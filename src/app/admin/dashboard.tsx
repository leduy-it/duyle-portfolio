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
  { key: 'all', label: 'retained history' },
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

function BarChart({ data }: { data: { date: string; views: number; uniques: number }[] }) {
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
        aria-label="pageviews per day"
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
                <title>{`${d.date} — ${d.views} views, ${d.uniques} uniques`}</title>
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
  initialEvents: TrackEvent[]
}

export function AdminDashboard({ initialSummary, initialEvents, storageKind }: Props) {
  const router = useRouter()
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [events, setEvents] = useState<TrackEvent[]>(initialEvents)
  const [range, setRange] = useState<RangeKey>(initialSummary.range)
  const [pathFilter, setPathFilter] = useState(initialSummary.pathContains || '')
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
        const res = await fetch('/api/admin/events?limit=50', {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = (await res.json()) as { events: TrackEvent[] }
        setEvents(data.events)
        void fetchSummary(range, pathFilter)
      } catch {
        /* ignore */
      }
    }, 10_000)
    return () => window.clearInterval(id)
  }, [fetchSummary, range, pathFilter])

  const onClear = useCallback(async () => {
    const typed =
      typeof window !== 'undefined'
        ? window.prompt('Type "delete" to wipe all tracking data:')
        : null
    if (typed !== 'delete') return
    const res = await fetch('/api/admin/clear', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: 'delete' }),
    })
    if (!res.ok) {
      setErr('clear failed')
      return
    }
    void fetchSummary(range, pathFilter)
    setEvents([])
  }, [fetchSummary, range, pathFilter])

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
  }, [fetchSummary, range, pathFilter])

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
            owner-only · {summary.totalEventsAllTime.toLocaleString()} retained events ·{' '}
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
            onClick={onClear}
            className="rounded-md border px-3 py-1.5 text-xs text-[rgb(var(--terminal-red))] hover:border-[rgb(var(--terminal-red))] transition-colors"
            style={{ borderColor: 'rgb(var(--border-muted))' }}
          >
            clear data
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
        Last 90 days, up to 10,000 events. Daily charts use UTC. Countries are approximate; direct
        traffic has no referrer header. Visitors are estimates based on a hashed network address and
        browser signature: shared networks can merge people, and changing networks can split them.
        Owner visits are excluded when “log my own visits” is off. DNT and detected bots are excluded.
        Sessions expire after 30 minutes of inactivity (new collection).
      </p>
      <div className="mb-6 rounded-lg border border-[rgb(var(--border))] p-4 text-xs leading-6">
        <strong>Recorded history starts: {insights.firstRecorded ? fmtTs(insights.firstRecorded) : 'Waiting for first visit'}</strong>
        <p>Earlier visits were not collected. This is retained history, not lifetime traffic.</p>
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
        title="live activity"
        right={<span className="text-[10px] text-[rgb(var(--text-muted))]">refresh · 10s</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[rgb(var(--text-muted))]">
              <tr>
                <th className="text-left font-normal py-1 pr-3">time</th>
                <th className="text-left font-normal py-1 pr-3">path</th>
                <th className="text-left font-normal py-1 pr-3">visitor</th>
                <th className="text-left font-normal py-1 pr-3">geo</th>
                <th className="text-left font-normal py-1 pr-3">browser</th>
                <th className="text-left font-normal py-1">ref</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-[rgb(var(--text-muted))]">
                    waiting for visitors…
                  </td>
                </tr>
              )}
              {events.map((e, i) => {
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
                    <td className="py-1.5 pr-3 font-mono text-[rgb(var(--text-muted))]">
                      {e.visitorId.slice(0, 8)}
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
      </Section>
    </div>
  )
}
