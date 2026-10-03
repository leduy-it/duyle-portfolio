'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Summary, RangeKey } from '@/lib/tracking/aggregate'
import type { TrackEvent } from '@/lib/tracking/store'
import { flagFor, parseUA } from '@/lib/tracking/ua'
import { setAdminSelfFlag } from '@/components/visitor-tracker'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '24h', label: 'last 24h' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'all', label: 'all history' },
]

function fmtTs(ts: string): string {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function fmtRelative(ts: string): string {
  const d = new Date(ts).getTime()
  if (!Number.isFinite(d)) return ts
  const diff = Date.now() - d
  if (diff < 60_000) return `${Math.max(1, Math.floor(diff / 1000))}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-1"
      style={{
        borderColor: 'rgb(var(--border) / 0.7)',
        backgroundColor: 'rgb(var(--surface-card) / 0.6)',
      }}
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--text-muted))]">
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">
        {value}
      </span>
      {sub && <span className="text-[11px] text-[rgb(var(--text-muted))]">{sub}</span>}
    </div>
  )
}

function BarChart({ data, label = 'pageviews per day', secondaryLabel = 'uniques' }: { data: { date: string; views: number; uniques: number }[]; label?: string; secondaryLabel?: string }) {
  const max = Math.max(1, ...data.map((d) => d.views))
  const w = 720
  const h = 160
  const padX = 24
  const padY = 16
  const innerW = w - padX * 2
  const innerH = h - padY * 2
  const barW = data.length > 0 ? innerW / data.length : 0

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={label}
        className="w-full h-40 min-w-[480px]"
      >
        <line
          x1={padX}
          x2={w - padX}
          y1={h - padY}
          y2={h - padY}
          stroke="rgb(var(--border-muted))"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const barH = (d.views / max) * innerH
          const x = padX + i * barW + barW * 0.15
          const y = h - padY - barH
          const bw = Math.max(2, barW * 0.7)
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={bw}
                height={barH}
                fill="rgb(var(--accent))"
                opacity={0.85}
                rx={1.5}
              >
                <title>{`${d.date} — ${d.views} ${label}, ${d.uniques} ${secondaryLabel}`}</title>
              </rect>
            </g>
          )
        })}
        {data.length > 0 && (
          <>
            <text
              x={padX}
              y={h - 2}
              fontSize={9}
              fill="rgb(var(--text-muted))"
              fontFamily="monospace"
            >
              {data[0].date}
            </text>
            <text
              x={w - padX}
              y={h - 2}
              fontSize={9}
              fill="rgb(var(--text-muted))"
              textAnchor="end"
              fontFamily="monospace"
            >
              {data[data.length - 1].date}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

function HorizontalBars({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map(item => item.count))
  return <div className="space-y-3 text-xs">
    {data.length === 0 && <p className="text-[rgb(var(--text-muted))]">No events in this range yet.</p>}
    {data.map(item => <div key={item.label}>
      <div className="mb-1 flex justify-between gap-3"><span className="break-all">{item.label}</span><strong>{item.count}</strong></div>
      <div className="h-2 rounded bg-[rgb(var(--border-muted)/0.35)]"><div className="h-2 rounded bg-[rgb(var(--accent))]" style={{ width: `${100 * item.count / max}%` }} /></div>
    </div>)}
  </div>
}

function Section({
  title,
  children,
  right,
}: {
  title: string
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <section
      className="rounded-lg border p-4"
      style={{
        borderColor: 'rgb(var(--border) / 0.7)',
        backgroundColor: 'rgb(var(--surface-card) / 0.4)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  )
}

interface Props {
  storageKind: string
  initialSummary: Summary
  initialEventPage: { events: TrackEvent[]; total: number; page: number; hasNext: boolean; anchor: number }
}

export function AdminDashboard({ initialSummary, initialEventPage, storageKind }: Props) {
  const router = useRouter()
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [eventPage, setEventPage] = useState(initialEventPage)
  const [range, setRange] = useState<RangeKey>(initialSummary.range)
  const [pathFilter, setPathFilter] = useState(initialSummary.pathContains || '')
  const [sessionFilter,setSessionFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [selfTrack, setSelfTrack] = useState(true)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setSelfTrack(window.localStorage.getItem('pf_admin_self') !== '1')
    } catch {
      /* storage denied */
    }
  }, [])

  const fetchSummary = useCallback(async (r: RangeKey, contains: string) => {
    setLoading(true)
    setErr(null)
    try {
      const params = new URLSearchParams({ range: r })
      if (contains.trim()) params.set('pathContains', contains.trim())
      const res = await fetch(`/api/admin/summary?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!res.ok)
        throw new Error(
          res.status === 404
            ? 'Session expired. Sign in again.'
            : 'Analytics storage is unavailable. Showing the last loaded data.'
        )
      const data = (await res.json()) as Summary
      setSummary(data)
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Could not load statistics.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEventPage = useCallback(async (page: number, anchor?: number, session = sessionFilter) => {
    try {
      const res = await fetch(`/api/admin/events?page=${page}${anchor === undefined ? '' : `&anchor=${anchor}`}${session ? `&session=${encodeURIComponent(session)}` : ''}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Could not load event history.')
      setEventPage(await res.json())
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Could not load event history.')
    }
  }, [sessionFilter])

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      void fetchSummary(range, pathFilter)
    }, 250)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [range, pathFilter, fetchSummary])

  useEffect(() => {
    const id = window.setInterval(async () => {
      if (document.hidden) return
      try {
        if (eventPage.page === 1) void fetchEventPage(1)
        void fetchSummary(range, pathFilter)
      } catch {
        /* ignore */
      }
    }, 10_000)
    return () => window.clearInterval(id)
  }, [fetchSummary, fetchEventPage, eventPage.page, range, pathFilter])

  const onLogout = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAdminSelfFlag(false)
    router.refresh()
    router.push('/')
  }, [router])

  const toggleSelfTrack = useCallback(() => {
    setSelfTrack((prev) => {
      const next = !prev
      setAdminSelfFlag(!next)
      return next
    })
  }, [])

  const insights = summary.insights
  const totals = summary.totals
  const empty = summary.totalEventsAllTime === 0

  const onRefresh = useCallback(() => {
    void fetchSummary(range, pathFilter)
    void fetchEventPage(eventPage.page, eventPage.page === 1 ? undefined : eventPage.anchor)
  }, [fetchSummary, fetchEventPage, eventPage.page, eventPage.anchor, range, pathFilter])

  const browserCounts = useMemo(() => summary.browsers, [summary.browsers])
  const osCounts = useMemo(() => summary.os, [summary.os])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 font-mono">
      <header className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl tracking-tight">
            <span className="text-[rgb(var(--accent))]">admin</span>
            <span className="text-[rgb(var(--text-muted))]">/</span>
            <span>tracking</span>
          </h1>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
            owner-only · {summary.totalEventsAllTime.toLocaleString()} recorded events ·{' '}
            {storageKind}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[11px] text-[rgb(var(--text-muted))] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selfTrack}
              onChange={toggleSelfTrack}
              className="accent-[rgb(var(--accent))]"
            />
            log my own visits
          </label>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md border px-3 py-1.5 text-xs hover:border-[rgb(var(--accent))] transition-colors"
            style={{ borderColor: 'rgb(var(--border-muted))' }}
          >
            refresh
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border px-3 py-1.5 text-xs hover:border-[rgb(var(--accent))] transition-colors"
            style={{ borderColor: 'rgb(var(--border-muted))' }}
          >
            logout
          </button>
        </div>
      </header>

      <p className="mb-5 text-[11px] leading-relaxed text-[rgb(var(--text-muted))]">
        Recorded events are kept without an automatic age or count limit. Daily charts use UTC. Countries are approximate; direct
        traffic has no referrer header. Visitors are estimates based on a hashed network address and
        browser signature: shared networks can merge people, and changing networks can split them.
        Owner visits are excluded when “log my own visits” is off. DNT and detected bots are excluded.
        Sessions expire after 30 minutes of inactivity (new collection).
      </p>
      <div className="mb-6 rounded-lg border border-[rgb(var(--border))] p-4 text-xs leading-6">
        <strong>Recorded history starts: {insights.firstRecorded ? fmtTs(insights.firstRecorded) : 'Waiting for first visit'}</strong>
        <p>Earlier visits were not collected. This is recorded history, not lifetime traffic.</p>
        <p>Latest recorded visit: {insights.lastRecorded ? fmtTs(insights.lastRecorded) : '—'} · totals refresh every 10 seconds.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div
          className="flex gap-1 rounded-md border p-1"
          style={{ borderColor: 'rgb(var(--border-muted))' }}
        >
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                range === r.key
                  ? 'bg-[rgb(var(--accent)/0.18)] text-[rgb(var(--accent))]'
                  : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <input
          value={pathFilter}
          onChange={(e) => setPathFilter(e.target.value)}
          placeholder="filter path contains…"
          className="rounded-md border bg-transparent px-3 py-1.5 text-xs outline-none focus:border-[rgb(var(--accent))] min-w-[220px]"
          style={{ borderColor: 'rgb(var(--border-muted))' }}
        />
        {loading && <span className="text-[11px] text-[rgb(var(--text-muted))]">loading…</span>}
        {err && <span className="text-[11px] text-[rgb(var(--terminal-red))]">{err}</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="button / link clicks" value={summary.interactions.clicks} />
        <StatCard label="chat questions" value={summary.interactions.chatQuestions} />
        <StatCard label="completed chat replies" value={summary.interactions.chatReplies} sub={`${summary.interactions.chatErrors} failed / interrupted`} />
        <StatCard label="email submissions" value={summary.interactions.contactSubmissions} sub={`${summary.interactions.contactAccepted} provider accepted · ${summary.interactions.contactErrors} failed`} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Section title="most used buttons / links"><HorizontalBars data={summary.interactions.topButtons} /></Section>
        <Section title="contact funnel · same session">
          <HorizontalBars data={summary.interactions.funnel} />
          <p className="mt-3 text-[11px] leading-relaxed">{summary.interactions.contactOpens} form opens · {summary.interactions.mailAppOpens} mail app opens. Provider acceptance does not confirm inbox delivery. Earlier clicks and conversations were not collected.</p>
        </Section>
      </div>
      <Section title="interaction activity per day"><BarChart data={summary.interactions.perDay} label="interaction events per day" secondaryLabel="visitors" /></Section>
      {empty ? (
        <div
          className="rounded-lg border p-10 text-center"
          style={{
            borderColor: 'rgb(var(--border) / 0.7)',
            backgroundColor: 'rgb(var(--surface-card) / 0.4)',
          }}
        >
          <p className="text-base text-[rgb(var(--text-primary))] mb-2">no visitors yet</p>
          <p className="text-xs text-[rgb(var(--text-muted))]">go share your link 👀</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="pageviews" value={totals.pageviews.toLocaleString()} />
            <StatCard label="estimated visitors" value={totals.uniqueVisitors.toLocaleString()} />
            <StatCard label="sessions" value={totals.sessions.toLocaleString()} />
            <StatCard
              label="pages / session"
              value={totals.avgPagesPerSession.toFixed(2)}
              sub="avg in range"
            />
            <StatCard label="today views" value={totals.todayPageviews.toLocaleString()} />
            <StatCard label="today uniques" value={totals.todayUniques.toLocaleString()} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label="visitors in last 5 min" value={insights.recentVisitors} sub="Recent pageviews, not a live presence count" />
            <StatCard label="repeat visitors" value={insights.repeatVisitors} sub="Seen in multiple sessions within selected range" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {insights.breakdowns.map(group => <Section key={group.title} title={group.title}>
              <ul className="space-y-2 text-xs">{group.items.map(item => <li key={item.label} className="flex justify-between gap-3">
                <span className="break-words min-w-0">{item.label}</span><span>{item.count}</span>
              </li>)}</ul>
            </Section>)}
          </div>
          <div className="mb-6">
            <Section title="pageviews per day">
              <BarChart data={summary.perDay} />
            </Section>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="life story views" value={summary.life.storyViews.toLocaleString()} />
            <StatCard label="video plays" value={summary.life.videoPlays.toLocaleString()} />
            <StatCard label="video completions" value={summary.life.videoCompletions.toLocaleString()} />
            <StatCard label="photo post clicks" value={summary.life.sourceClicks.toLocaleString()} />
          </div>
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <Section title="traffic sources · pageviews">
              <HorizontalBars data={summary.socialSources} />
            </Section>
            <Section title="life content · engagement">
              <HorizontalBars data={summary.life.topContent.map(item => ({ label: item.id, count: item.views + item.plays }))} />
            </Section>
          </div>
          <div className="mb-6">
            <Section title="life content activity per day">
              <BarChart data={summary.life.perDay.map(day => ({ date: day.date, views: day.views + day.plays, uniques: day.completions }))} label="life actions" secondaryLabel="video completions" />
              <p className="mt-1 text-[11px] text-[rgb(var(--text-muted))]">Bars show story views plus video plays; video completions are listed above.</p>
            </Section>
          </div>
          <Section title="share links · tagged campaigns">
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              {(['instagram', 'facebook', 'linkedin'] as const).map(source => <a key={source} className="break-all underline text-[rgb(var(--accent))]" href={`/life?utm_source=${source}&utm_medium=social&utm_campaign=life`} target="_blank" rel="noopener noreferrer">/life · {source} ↗</a>)}
            </div>
            <p className="mt-2 text-[11px] text-[rgb(var(--text-muted))]">Copy the destination URL for each network. Source totals use these tags when present, otherwise the browser referrer.</p>
          </Section>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <Section title="top pages">
              <table className="w-full text-xs">
                <thead className="text-[rgb(var(--text-muted))]">
                  <tr>
                    <th className="text-left font-normal py-1">path</th>
                    <th className="text-right font-normal py-1">views</th>
                    <th className="text-right font-normal py-1">uniques</th>
                    <th className="text-right font-normal py-1">last</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topPages.map((p) => (
                    <tr
                      key={p.path}
                      className="border-t"
                      style={{ borderColor: 'rgb(var(--border-muted) / 0.4)' }}
                    >
                      <td className="py-1.5 truncate max-w-[220px]" title={p.path}>
                        {p.path}
                      </td>
                      <td className="py-1.5 text-right tabular-nums">{p.views}</td>
                      <td className="py-1.5 text-right tabular-nums text-[rgb(var(--text-muted))]">
                        {p.uniques}
                      </td>
                      <td className="py-1.5 text-right text-[rgb(var(--text-muted))]">
                        {fmtRelative(p.lastSeen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="top referrers">
              <table className="w-full text-xs">
                <thead className="text-[rgb(var(--text-muted))]">
                  <tr>
                    <th className="text-left font-normal py-1">host</th>
                    <th className="text-right font-normal py-1">count</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topReferrers.map((r) => (
                    <tr
                      key={r.host}
                      className="border-t"
                      style={{ borderColor: 'rgb(var(--border-muted) / 0.4)' }}
                    >
                      <td className="py-1.5">{r.host}</td>
                      <td className="py-1.5 text-right tabular-nums">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <Section title="countries">
              <ul className="space-y-1 text-xs">
                {summary.countries.map((c) => (
                  <li key={c.country} className="flex items-center justify-between">
                    <span>
                      <span className="mr-2">{flagFor(c.country) || '🏳️'}</span>
                      {c.country}
                    </span>
                    <span className="tabular-nums text-[rgb(var(--text-muted))]">{c.count}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="browsers">
              <ul className="space-y-1 text-xs">
                {browserCounts.map((b) => (
                  <li key={b.browser} className="flex items-center justify-between">
                    <span>{b.browser}</span>
                    <span className="tabular-nums text-[rgb(var(--text-muted))]">{b.count}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="os">
              <ul className="space-y-1 text-xs">
                {osCounts.map((o) => (
                  <li key={o.os} className="flex items-center justify-between">
                    <span>{o.os}</span>
                    <span className="tabular-nums text-[rgb(var(--text-muted))]">{o.count}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </>
      )}

      <Section
        title="event history"
        right={<span className="text-[10px] text-[rgb(var(--text-muted))]">50 records per page · newest first</span>}
      >
        <form className="flex flex-wrap gap-2 mb-4" onSubmit={event => {event.preventDefault();void fetchEventPage(1,undefined,sessionFilter)}}>
          <input aria-label="Session ID" value={sessionFilter} onChange={event => setSessionFilter(event.target.value)} placeholder="Filter by session ID" className="border rounded bg-transparent px-3 py-2 text-xs" />
          <button className="border rounded px-3 py-2 text-xs" type="submit">Show journey</button>
          <button className="border rounded px-3 py-2 text-xs" type="button" onClick={() => {setSessionFilter('');void fetchEventPage(1,undefined,'')}}>All sessions</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[rgb(var(--text-muted))]">
              <tr>
                <th className="text-left font-normal py-1 pr-3">time</th>
                <th className="text-left font-normal py-1 pr-3">path</th>
                <th className="text-left font-normal py-1 pr-3">event / content</th>
                <th className="text-left font-normal py-1 pr-3">visitor</th>
                <th className="text-left font-normal py-1 pr-3">geo</th>
                <th className="text-left font-normal py-1 pr-3">browser</th>
                <th className="text-left font-normal py-1">ref</th>
              </tr>
            </thead>
            <tbody>
              {eventPage.events.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-[rgb(var(--text-muted))]">
                    no records on this page
                  </td>
                </tr>
              )}
              {eventPage.events.map((e, i) => {
                const ua = parseUA(e.userAgent)
                return (
                  <tr
                    key={`${e.ts}-${i}`}
                    className="border-t"
                    style={{ borderColor: 'rgb(var(--border-muted) / 0.4)' }}
                  >
                    <td className="py-1.5 pr-3 text-[rgb(var(--text-muted))] whitespace-nowrap">
                      {fmtTs(e.ts)}
                    </td>
                    <td className="py-1.5 pr-3 truncate max-w-[200px]" title={e.path}>
                      {e.path}
                    </td>
                    <td className="py-1.5 pr-3 max-w-[300px] break-words">{e.kind || 'pageview'}{e.targetId ? ` · ${e.targetId}` : ''}{e.details && <details className="mt-1 text-[10px]"><summary>Details</summary><pre className="whitespace-pre-wrap">{JSON.stringify(e.details,null,2)}</pre></details>}</td>
                    <td className="py-1.5 pr-3 font-mono text-[rgb(var(--text-muted))]">
                      {e.visitorId.slice(0, 8)}<br /><button type="button" className="text-[10px] underline" title={e.sessionId} onClick={() => {setSessionFilter(e.sessionId);void fetchEventPage(1,undefined,e.sessionId)}}>{e.sessionId.slice(0,8)} · journey</button>
                    </td>
                    <td className="py-1.5 pr-3">
                      {flagFor(e.country) || ''} {[e.city, e.region, e.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="py-1.5 pr-3">
                      {ua.browser} · {ua.os}<br /><span className="text-[10px] text-[rgb(var(--text-muted))]">{e.locale || '—'} · {e.screenWidth || '?'}×{e.screenHeight || '?'}</span>
                    </td>
                    <td
                      className="py-1.5 truncate max-w-[160px] text-[rgb(var(--text-muted))]"
                      title={e.referrer || ''}
                    >
                      {e.referrer ? new URL(e.referrer, 'http://x').hostname : '(direct)'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span>Page {eventPage.page} · {eventPage.total.toLocaleString()} total records</span>
          <div className="flex gap-2">
            <button type="button" disabled={eventPage.page <= 1} onClick={() => void fetchEventPage(eventPage.page - 1, eventPage.anchor)} className="rounded border px-3 py-1.5 disabled:opacity-40" style={{ borderColor: 'rgb(var(--border-muted))' }}>Previous</button>
            <button type="button" disabled={!eventPage.hasNext} onClick={() => void fetchEventPage(eventPage.page + 1, eventPage.anchor)} className="rounded border px-3 py-1.5 disabled:opacity-40" style={{ borderColor: 'rgb(var(--border-muted))' }}>Next</button>
          </div>
        </div>
      </Section>
    </div>
  )
}
