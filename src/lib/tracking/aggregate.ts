import { TrackEvent, readActiveEvents } from './store'
import { parseUA } from './ua'

export type RangeKey = '24h' | '7d' | '30d' | 'all'

export interface Summary {
  insights: {
    firstRecorded: string | null
    lastRecorded: string | null
    recentVisitors: number
    repeatVisitors: number
    breakdowns: { title: string; items: { label: string; count: number }[] }[]
  }
  totals: {
    pageviews: number
    uniqueVisitors: number
    sessions: number
    avgPagesPerSession: number
    todayPageviews: number
    todayUniques: number
  }
  perDay: { date: string; views: number; uniques: number }[]
  topPages: { path: string; views: number; uniques: number; lastSeen: string }[]
  topReferrers: { host: string; count: number }[]
  countries: { country: string; count: number }[]
  browsers: { browser: string; count: number }[]
  os: { os: string; count: number }[]
  range: RangeKey
  pathContains: string | null
  totalEventsAllTime: number
}

function rangeStart(range: RangeKey): number {
  const now = Date.now()
  switch (range) {
    case '24h':
      return now - 24 * 60 * 60 * 1000
    case '7d':
      return now - 7 * 24 * 60 * 60 * 1000
    case '30d':
      return now - 30 * 24 * 60 * 60 * 1000
    case 'all':
    default:
      return 0
  }
}

function dayKey(ts: string): string {
  return ts.slice(0, 10)
}

function refHost(ref: string | null): string {
  if (!ref) return '(direct)'
  try {
    const u = new URL(ref)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return '(direct)'
  }
}

function topN<T extends { count: number }>(arr: T[], n: number): T[] {
  return [...arr].sort((a, b) => b.count - a.count).slice(0, n)
}

function emptyDayBuckets(start: number, end: number): Map<string, { views: number; uniques: Set<string> }> {
  const out = new Map<string, { views: number; uniques: Set<string> }>()
  const startDay = new Date(start)
  startDay.setUTCHours(0, 0, 0, 0)
  for (let t = startDay.getTime(); t <= end; t += 24 * 60 * 60 * 1000) {
    out.set(new Date(t).toISOString().slice(0, 10), { views: 0, uniques: new Set() })
  }
  return out
}

export async function buildSummary(opts: { range: RangeKey; pathContains?: string | null }): Promise<Summary> {
  const { range, pathContains } = opts
  const all = await readActiveEvents()
  const startMs = rangeStart(range)
  const now = Date.now()

  const filtered: TrackEvent[] = []
  for (const e of all) {
    const t = Date.parse(e.ts)
    if (!Number.isFinite(t)) continue
    if (t < startMs) continue
    if (pathContains && !e.path.toLowerCase().includes(pathContains.toLowerCase())) continue
    filtered.push(e)
  }

  const todayKey = new Date().toISOString().slice(0, 10)
  const visitors = new Set<string>()
  const sessions = new Set<string>()
  const todayVisitors = new Set<string>()
  let todayViews = 0

  const days =
    range === 'all'
      ? new Map<string, { views: number; uniques: Set<string> }>()
      : emptyDayBuckets(startMs, now)

  const pageMap = new Map<string, { views: number; uniques: Set<string>; lastSeen: string }>()
  const refMap = new Map<string, number>()
  const countryMap = new Map<string, number>()
  const browserMap = new Map<string, number>()
  const osMap = new Map<string, number>()

  for (const e of filtered) {
    visitors.add(e.visitorId)
    sessions.add(e.sessionId)
    const dk = dayKey(e.ts)
    let bucket = days.get(dk)
    if (!bucket) {
      bucket = { views: 0, uniques: new Set() }
      days.set(dk, bucket)
    }
    bucket.views += 1
    bucket.uniques.add(e.visitorId)

    if (dk === todayKey) {
      todayViews += 1
      todayVisitors.add(e.visitorId)
    }

    let pm = pageMap.get(e.path)
    if (!pm) {
      pm = { views: 0, uniques: new Set(), lastSeen: e.ts }
      pageMap.set(e.path, pm)
    }
    pm.views += 1
    pm.uniques.add(e.visitorId)
    if (e.ts > pm.lastSeen) pm.lastSeen = e.ts

    const host = refHost(e.referrer)
    refMap.set(host, (refMap.get(host) || 0) + 1)

    const cc = e.country || 'XX'
    countryMap.set(cc, (countryMap.get(cc) || 0) + 1)

    const ua = parseUA(e.userAgent)
    browserMap.set(ua.browser, (browserMap.get(ua.browser) || 0) + 1)
    osMap.set(ua.os, (osMap.get(ua.os) || 0) + 1)
  }

  const perDay = [...days.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, views: v.views, uniques: v.uniques.size }))

  const topPages = [...pageMap.entries()]
    .map(([p, v]) => ({ path: p, views: v.views, uniques: v.uniques.size, lastSeen: v.lastSeen }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 25)

  const topReferrers = topN(
    [...refMap.entries()].map(([host, count]) => ({ host, count })),
    15,
  )

  const countries = topN(
    [...countryMap.entries()].map(([country, count]) => ({ country, count })),
    20,
  )

  const browsers = topN(
    [...browserMap.entries()].map(([browser, count]) => ({ browser, count })),
    10,
  )
  const os = topN(
    [...osMap.entries()].map(([osName, count]) => ({ os: osName, count })),
    10,
  )

  const sessionCount = sessions.size
  const avgPagesPerSession = sessionCount > 0 ? filtered.length / sessionCount : 0

  const breakdown = (title: string, values: string[]) => ({ title, items: topN(
    [...values.reduce((m, v) => m.set(v, (m.get(v) || 0) + 1), new Map<string, number>())]
      .map(([label, count]) => ({ label, count })), 12) })
  const visitSessions = new Map<string, Set<string>>()
  const journeys = new Map<string, TrackEvent[]>()
  for (const e of filtered) {
    const visits = visitSessions.get(e.visitorId) || new Set<string>()
    visits.add(e.sessionId); visitSessions.set(e.visitorId, visits)
    const journey = journeys.get(e.sessionId) || []
    journey.push(e); journeys.set(e.sessionId, journey)
  }
  return {
    insights: {
      firstRecorded: all[0]?.ts || null,
      lastRecorded: all.at(-1)?.ts || null,
      recentVisitors: new Set(filtered.filter(e => Date.parse(e.ts) > now - 300000).map(e => e.visitorId)).size,
      repeatVisitors: [...visitSessions.values()].filter(v => v.size > 1).length,
      breakdowns: [
        breakdown('Cities · approximate', filtered.map(e => e.city ? [e.city, e.region, e.country].filter(Boolean).join(', ') : 'Unknown')),
        breakdown('Devices', filtered.map(e => /ipad|tablet|android(?!.*mobile)/i.test(e.userAgent || '') ? 'Tablet' : parseUA(e.userAgent).mobile ? 'Mobile' : 'Desktop / other')),
        breakdown('Languages', filtered.map(e => e.locale || 'Unknown')),
        breakdown('Viewports', filtered.map(e => e.screenWidth && e.screenHeight ? `${e.screenWidth} × ${e.screenHeight}` : 'Unknown')),
        breakdown('Timezones', filtered.map(e => e.timezone || 'Unknown')),
        breakdown('Campaigns · source / medium / name', filtered.map(e => [e.source, e.medium, e.campaign].filter(Boolean).join(' / ') || 'Untagged')),
        breakdown('Entry pages · observed', [...journeys.values()].map(j => j[0].path)),
        breakdown('Last pages · observed', [...journeys.values()].map(j => j[j.length - 1].path)),
      ],
    },
    totals: {
      pageviews: filtered.length,
      uniqueVisitors: visitors.size,
      sessions: sessionCount,
      avgPagesPerSession: Number(avgPagesPerSession.toFixed(2)),
      todayPageviews: todayViews,
      todayUniques: todayVisitors.size,
    },
    perDay,
    topPages,
    topReferrers,
    countries,
    browsers,
    os,
    range,
    pathContains: pathContains || null,
    totalEventsAllTime: all.length,
  }
}

export async function recentEvents(limit: number, before?: string | null): Promise<TrackEvent[]> {
  const all = await readActiveEvents()
  let pool = all
  if (before) {
    const beforeMs = Date.parse(before)
    if (Number.isFinite(beforeMs)) {
      pool = all.filter((e) => Date.parse(e.ts) < beforeMs)
    }
  }
  return pool.slice(-limit).reverse()
}
