import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { redisConfigured, redisCommand, allowRequest } from '@/lib/server/redis'

const REDIS_KEY = `duyportfolio:${process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'}:tracking:v1`
export function trackingStorageKind() {
  return redisConfigured()
    ? 'redis'
    : process.env.NODE_ENV === 'production'
      ? 'unconfigured'
      : 'local-development'
}
function requireDurableInProduction() {
  if (process.env.NODE_ENV === 'production' && !redisConfigured())
    throw Error('storage_unconfigured')
}

const DATA_DIR = path.join(process.cwd(), 'data')
const ACTIVE_FILE = path.join(DATA_DIR, 'tracking.jsonl')
const SALT_FILE = path.join(DATA_DIR, '.salt')
const MAX_FILE_BYTES = 50 * 1024 * 1024

export interface TrackEvent {
  kind?: 'pageview' | 'life_story_view' | 'life_video_play' | 'life_video_complete' | 'life_source_click' | 'ui_click' | 'chat_open' | 'chat_sent' | 'chat_completed' | 'chat_failed' | 'contact_open' | 'contact_submitted' | 'contact_accepted' | 'contact_failed' | 'mailapp_open'
  targetId?: string | null
  eventId?: string
  details?: {label?:string;href?:string;element?:string;status?:string;conversationId?:string;turnId?:string;requestId?:string}
  ts: string
  path: string
  referrer: string | null
  userAgent: string | null
  country: string | null
  locale: string | null
  visitorId: string
  sessionId: string
  screenWidth: number | null
  screenHeight: number | null
  city?: string | null
  region?: string | null
  timezone?: string | null
  source?: string | null
  medium?: string | null
  campaign?: string | null
}

let cachedSalt: string | null = null

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

export async function getSalt(): Promise<string> {
  if (process.env.TRACKING_SALT) {
    cachedSalt = process.env.TRACKING_SALT
    return cachedSalt
  }
  if (process.env.NODE_ENV === 'production') {
    if ((process.env.ADMIN_SECRET?.length || 0) >= 32)
      return crypto
        .createHmac('sha256', process.env.ADMIN_SECRET!)
        .update('tracking-salt')
        .digest('hex')
    throw Error('tracking_salt_unconfigured')
  }
  if (cachedSalt) return cachedSalt
  await ensureDir()
  try {
    cachedSalt = (await fs.readFile(SALT_FILE, 'utf8')).trim()
    if (cachedSalt) return cachedSalt
  } catch {
    /* fall through */
  }
  cachedSalt = crypto.randomBytes(32).toString('hex')
  await fs.writeFile(SALT_FILE, cachedSalt, { mode: 0o600 })
  return cachedSalt
}

export function hashIdentity(parts: string[], salt: string): string {
  return crypto
    .createHash('sha256')
    .update(salt + '|' + parts.join('|'))
    .digest('hex')
    .slice(0, 16)
}

async function rotateIfNeeded(): Promise<void> {
  try {
    const stat = await fs.stat(ACTIVE_FILE)
    if (stat.size < MAX_FILE_BYTES) return
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').slice(0, 19)
    const archive = path.join(DATA_DIR, `tracking-${stamp}.jsonl`)
    await fs.rename(ACTIVE_FILE, archive)
  } catch {
    /* file does not exist yet — nothing to rotate */
  }
}

export async function appendEvent(evt: TrackEvent): Promise<void> {
  requireDurableInProduction()
  if (redisConfigured()) {
    await redisCommand([
      'EVAL',
      "if ARGV[2]~='' and redis.call('HSETNX',KEYS[2],ARGV[2],'1')==0 then return 0 end; redis.call('RPUSH',KEYS[1],ARGV[1]); redis.call('PERSIST',KEYS[1]); return 1",
      2,
      REDIS_KEY,
      REDIS_KEY + ':ids',
      JSON.stringify(evt),
      evt.eventId || '',
    ])
    return
  }
  await ensureDir()
  await rotateIfNeeded()
  await fs.appendFile(ACTIVE_FILE, JSON.stringify(evt) + '\n', 'utf8')
}

export async function readActiveEvents(): Promise<TrackEvent[]> {
  requireDurableInProduction()
  let lines: string[]
  if (redisConfigured()) {
    await redisCommand(['PERSIST', REDIS_KEY])
    lines = await redisCommand<string[]>(['LRANGE', REDIS_KEY, 0, -1])
  }
  else {
    await ensureDir()
    const files = (await fs.readdir(DATA_DIR)).filter(name => name === 'tracking.jsonl' || /^tracking-.*\.jsonl$/.test(name)).sort()
    lines = (await Promise.all(files.map(name => fs.readFile(path.join(DATA_DIR, name), 'utf8')))).flatMap(content => content.split('\n'))
  }
  const events: TrackEvent[] = []
  for (const line of lines) {
    try {
      const e = JSON.parse(line)
      if (
        typeof e.ts === 'string' &&
        Number.isFinite(Date.parse(e.ts)) &&
        typeof e.path === 'string' &&
        typeof e.visitorId === 'string' &&
        typeof e.sessionId === 'string'
      )
        events.push(e)
    } catch {
      /* Skip one malformed record. */
    }
  }
  return events.sort((a, b) => a.ts.localeCompare(b.ts))
}

export async function readEventPage(page: number, pageSize = 50, anchor?: number, sessionId?: string): Promise<{ events: TrackEvent[]; total: number; page: number; hasNext: boolean; anchor: number }> {
  requireDurableInProduction()
  const safePage = Math.max(1, Math.floor(page))
  const safeSize = Math.min(50, Math.max(1, Math.floor(pageSize)))
  if (sessionId) {
    const all = (await readActiveEvents()).filter(event => event.sessionId === sessionId)
    const total = anchor === undefined ? all.length : Math.min(all.length,Math.max(0,Math.floor(anchor)))
    const end = total - (safePage - 1)*safeSize
    return {events:end<=0 ? [] : all.slice(Math.max(0,end-safeSize),end).reverse(),total,page:safePage,hasNext:end>safeSize,anchor:total}
  }
  if (redisConfigured()) {
    await redisCommand(['PERSIST', REDIS_KEY])
    const total = Number(await redisCommand<number>(['LLEN', REDIS_KEY]))
    const snapshotTotal = anchor === undefined ? total : Math.min(total, Math.max(0, Math.floor(anchor)))
    const newestOffset = (safePage - 1) * safeSize
    if (newestOffset >= snapshotTotal) return { events: [], total: snapshotTotal, page: safePage, hasNext: false, anchor: snapshotTotal }
    const start = Math.max(0, snapshotTotal - newestOffset - safeSize)
    const end = snapshotTotal - newestOffset - 1
    const raw = await redisCommand<string[]>(['LRANGE', REDIS_KEY, start, end])
    const events = raw.flatMap(line => { try { return [JSON.parse(line) as TrackEvent] } catch { return [] } }).reverse()
    return { events, total: snapshotTotal, page: safePage, hasNext: newestOffset + safeSize < snapshotTotal, anchor: snapshotTotal }
  }
  const all = await readActiveEvents()
  const total = anchor === undefined ? all.length : Math.min(all.length, Math.max(0, Math.floor(anchor)))
  const newestOffset = (safePage - 1) * safeSize
  return { events: all.slice(Math.max(0, total - newestOffset - safeSize), total - newestOffset).reverse(), total, page: safePage, hasNext: newestOffset + safeSize < total, anchor: total }
}

export async function rateLimitOk(visitorId: string) {
  return allowRequest('tracking', visitorId, 180, 60)
}
