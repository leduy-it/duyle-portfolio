import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { sameOrigin } from '@/lib/server/redis'
import { isBotUA } from '@/lib/tracking/bot-filter'
import { appendEvent, getSalt, hashIdentity, rateLimitOk, TrackEvent } from '@/lib/tracking/store'
import { isAdminRequest } from '@/lib/tracking/admin-auth'
import { lifeHighlights, lifeStories } from '@/data/life-stories'

export const runtime = 'nodejs'

const SESSION_COOKIE = 'pf_sid'
const SESSION_TTL = 60 * 30

interface IncomingPing {
  kind?: unknown
  targetId?: unknown
  details?: unknown
  eventId?: unknown
  path?: unknown
  referrer?: unknown
  screenWidth?: unknown
  screenHeight?: unknown
  locale?: unknown
  source?: unknown
  medium?: unknown
  campaign?: unknown
  ts?: unknown
}

const lifeIds = new Set([...lifeStories, ...lifeHighlights].map(item => item.id))
const clientActions = new Set(['ui_click','chat_open','contact_open','mailapp_open'])
const lifeActions = new Set(['life_story_view', 'life_video_play', 'life_video_complete', 'life_source_click'])

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return '0.0.0.0'
}

function clientCountry(req: NextRequest): string | null {
  return (
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-country') ||
    null
  )
}

function safePath(input: unknown): string | null {
  if (typeof input !== 'string') return null
  if (input.length === 0 || input.length > 512) return null
  if (!input.startsWith('/') || input.startsWith('//') || /[\\\u0000-\u001f]/.test(input))
    return null
  return input.split(/[?#]/)[0]
}

function safeStr(input: unknown, max: number): string | null {
  if (typeof input !== 'string') return null
  return input.slice(0, max)
}

function safeInt(input: unknown): number | null {
  if (typeof input !== 'number' || !Number.isFinite(input)) return null
  if (input < 0 || input > 100000) return null
  return Math.floor(input)
}

export async function POST(req: NextRequest) {
  try {
    if (!sameOrigin(req)) return NextResponse.json({ error: 'invalid_origin' }, { status: 403 })
    if (Number(req.headers.get('content-length')) > 4096)
      return NextResponse.json({ error: 'too_large' }, { status: 413 })
    if (req.headers.get('x-admin-self') === '1' && (await isAdminRequest())) {
      return NextResponse.json({ ok: true, skipped: 'admin' })
    }

    if ((req.headers.get('dnt') === '1' || req.headers.get('x-portfolio-dnt') === '1')) return NextResponse.json({ ok: true, skipped: 'dnt' })
    const ua = req.headers.get('user-agent')?.slice(0, 512) || null
    if (isBotUA(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' })
    }

    const body = (await req.json().catch(() => null)) as IncomingPing | null
    if (!body) return NextResponse.json({ error: 'bad request' }, { status: 400 })

    const path = safePath(body.path)
    if (!path) return NextResponse.json({ error: 'bad path' }, { status: 400 })
    const kind = body.kind == null || body.kind === 'pageview' ? 'pageview' : body.kind
    if (typeof kind !== 'string' || (kind !== 'pageview' && !lifeActions.has(kind) && !clientActions.has(kind)))
      return NextResponse.json({ error: 'bad event kind' }, { status: 400 })
    if (lifeActions.has(kind) && (path !== '/life' || typeof body.targetId !== 'string' || !lifeIds.has(body.targetId)))
      return NextResponse.json({ error: 'bad event target' }, { status: 400 })

    if (clientActions.has(kind) && (typeof body.targetId !== 'string' || body.targetId.length > 180 || !body.targetId.trim())) return NextResponse.json({error:'bad event target'},{status:400})
    const details = body.details && typeof body.details === 'object' ? body.details as Record<string,unknown> : {}
    const safeDetails = Object.fromEntries(['label','href','element'].flatMap(key => typeof details[key] === 'string' ? [[key, (details[key] as string).slice(0,180).split(/[?#]/)[0]]] : []))
    let referrer: string | null = null
    try {
      const ref = new URL(typeof body.referrer === 'string' ? body.referrer : '')
      if (['http:', 'https:'].includes(ref.protocol)) referrer = ref.origin
    } catch {
      /* Missing or invalid referrers are direct traffic. */
    }
    const locale = safeStr(body.locale, 32)
    const screenWidth = safeInt(body.screenWidth)
    const screenHeight = safeInt(body.screenHeight)

    const salt = await getSalt()
    const ip = clientIp(req)
    const ipHash = hashIdentity(['ip', ip], salt)
    const visitorId = hashIdentity(['v', ipHash, ua || ''], salt)

    if (!(await rateLimitOk(visitorId))) {
      return NextResponse.json({ ok: true, skipped: 'rate' })
    }

    let sessionId = req.cookies.get(SESSION_COOKIE)?.value
    if (!sessionId || sessionId.length < 8 || sessionId.length > 64) {
      sessionId = crypto.randomUUID()
    }

    const rawCountry = clientCountry(req)
    const country = rawCountry && /^[A-Za-z]{2}$/.test(rawCountry) ? rawCountry.toUpperCase() : null

    const geo = (name: string) => {
      const value = req.headers.get(name)
      if (!value) return null
      try { return decodeURIComponent(value).slice(0, 100) } catch { return null }
    }
    const campaignTag = (value: unknown) => typeof value === 'string'
      ? value.replace(/[^a-zA-Z0-9_. -]/g, '').slice(0, 80) || null : null
    const evt: TrackEvent = {
      eventId: typeof body.eventId === 'string' && /^[a-f0-9-]{36}$/i.test(body.eventId) ? body.eventId : undefined,
      details: clientActions.has(kind) ? safeDetails : undefined,
      kind: kind as TrackEvent['kind'],
      targetId: kind === 'pageview' ? null : body.targetId as string,
      city: geo('x-vercel-ip-city'),
      region: geo('x-vercel-ip-country-region'),
      timezone: geo('x-vercel-ip-timezone'),
      source: campaignTag(body.source),
      medium: campaignTag(body.medium),
      campaign: campaignTag(body.campaign),
      ts: new Date().toISOString(),
      path,
      referrer: referrer || null,
      userAgent: ua,
      country,
      locale,
      visitorId,
      sessionId,
      screenWidth,
      screenHeight,
    }

    await appendEvent(evt)

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_TTL,
    })
    return res
  } catch {
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
