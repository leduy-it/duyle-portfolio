import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { redisConfigured, redisCommand, allowRequest } from '@/lib/server/redis'

const REDIS_KEY = `duyportfolio:${process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'}:tracking:v1`
const RETENTION_DAYS = 90
export const MAX_RETAINED_EVENTS = 10_000
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
      "redis.call('RPUSH',KEYS[1],ARGV[1]); redis.call('LTRIM',KEYS[1],-tonumber(ARGV[2]),-1); redis.call('EXPIRE',KEYS[1],ARGV[3]); return 1",
      1,
      REDIS_KEY,
      JSON.stringify(evt),
      MAX_RETAINED_EVENTS,
      RETENTION_DAYS * 86400,
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
  if (redisConfigured()) lines = await redisCommand<string[]>(['LRANGE', REDIS_KEY, 0, -1])
  else {
    try {
      lines = (await fs.readFile(ACTIVE_FILE, 'utf8')).split('\n')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw error
    }
  }
  const cutoff = Date.now() - RETENTION_DAYS * 86400_000
  const events: TrackEvent[] = []
  for (const line of lines) {
    try {
      const e = JSON.parse(line)
      if (
        typeof e.ts === 'string' &&
        Date.parse(e.ts) >= cutoff &&
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

export async function clearActive(): Promise<void> {
  requireDurableInProduction()
  if (redisConfigured()) {
    await redisCommand([
      'EVAL',
      "if redis.call('EXISTS',KEYS[1])==1 then redis.call('RENAME',KEYS[1],KEYS[2]); redis.call('EXPIRE',KEYS[2],604800) end; return 1",
      2,
      REDIS_KEY,
      `${REDIS_KEY}:archive:${Date.now()}`,
    ])
    return
  }
  await ensureDir()
  try {
    const stat = await fs.stat(ACTIVE_FILE)
    if (stat.size > 0) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').slice(0, 19)
      await fs.rename(ACTIVE_FILE, path.join(DATA_DIR, `tracking-${stamp}.jsonl`))
    }
  } catch {
    /* nothing to clear */
  }
  await fs.writeFile(ACTIVE_FILE, '', 'utf8')
}

export async function rateLimitOk(visitorId: string) {
  return allowRequest('tracking', visitorId, 60, 60)
}
