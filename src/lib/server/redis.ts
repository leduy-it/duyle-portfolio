import { createHash } from 'node:crypto'
export function redisConfigured() {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
    (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)
  )
}
export async function redisCommand<T>(command: (string | number)[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token || !url.startsWith('https://')) throw Error('storage_unconfigured')
  const response = await fetch(url.replace(/\/$/, ''), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
  })
  if (!response.ok) throw Error('storage_unavailable')
  const data = await response.json()
  if (data.error) throw Error('storage_unavailable')
  return data.result as T
}
const buckets = new Map<string, { count: number; expires: number }>()
/** Atomic fixed window, shared across serverless instances. Keys contain no raw IP. */
export async function allowRequest(scope: string, identity: string, max: number, seconds: number) {
  const hash = createHash('sha256').update(identity).digest('hex').slice(0, 24)
  const key = `duyportfolio:${process.env.VERCEL_ENV || process.env.NODE_ENV || "development"}:limit:${scope}:${hash}`
  if (redisConfigured())
    return (
      Number(
        await redisCommand([
          'EVAL',
          "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",
          1,
          key,
          seconds,
        ])
      ) <= max
    )
  if (process.env.NODE_ENV === 'production') throw Error('storage_unconfigured')
  const now = Date.now()
  if (buckets.size > 2000) for (const [id, b] of buckets) if (b.expires <= now) buckets.delete(id)
  const bucket = buckets.get(key)
  if (!bucket || bucket.expires <= now) {
    buckets.set(key, { count: 1, expires: now + seconds * 1000 })
    return true
  }
  return ++bucket.count <= max
}
export function requestIdentity(request: Request) {
  return (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local')
    .split(',')[0]
    .trim()
    .slice(0, 128)
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    const parsed = new URL(origin)
    const host = request.headers.get('host') || new URL(request.url).host
    return ['http:', 'https:'].includes(parsed.protocol) && parsed.host === host
  } catch {
    return false
  }
}
