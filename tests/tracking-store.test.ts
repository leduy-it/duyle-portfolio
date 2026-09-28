import test from 'node:test'
import assert from 'node:assert/strict'
import { appendEvent, readActiveEvents, getSalt, type TrackEvent } from '../src/lib/tracking/store'
const event: TrackEvent = {
  ts: new Date().toISOString(),
  path: '/pets',
  referrer: 'https://github.com',
  country: 'VN',
  locale: 'vi',
  userAgent: 'Mozilla/5.0',
  visitorId: 'anonymous-test',
  sessionId: 'session-test',
  screenWidth: 390,
  screenHeight: 844,
}
test('serverless analytics fails explicitly when durable storage is absent', async () => {
  const original = { ...process.env }
  try {
    Object.assign(process.env, { NODE_ENV: 'production' })
    for (const key of [
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'KV_REST_API_URL',
      'KV_REST_API_TOKEN',
      'TRACKING_SALT',
      'ADMIN_SECRET',
    ])
      delete process.env[key]
    await assert.rejects(readActiveEvents(), /storage/)
    await assert.rejects(getSalt(), /salt/)
  } finally {
    process.env = original
  }
})
test('durable analytics writes atomically and propagates outages instead of reporting zero', async () => {
  const original = { ...process.env },
    fetch = global.fetch,
    commands: unknown[][] = []
  try {
    Object.assign(process.env, {
      NODE_ENV: 'production',
      UPSTASH_REDIS_REST_URL: 'https://redis.example',
      UPSTASH_REDIS_REST_TOKEN: 'test-only',
    })
    global.fetch = async (_url, init) => {
      const command = JSON.parse(String(init?.body))
      commands.push(command)
      return Response.json({
        result: command[0] === 'LRANGE' ? [JSON.stringify(event)] : 1,
      })
    }
    await appendEvent(event)
    assert.equal(commands[0][0], 'EVAL')
    assert.deepEqual(await readActiveEvents(), [event])
    global.fetch = async () => Response.json({ error: 'provider failure' }, { status: 503 })
    await assert.rejects(readActiveEvents(), /storage_unavailable/)
  } finally {
    global.fetch = fetch
    process.env = original
  }
})
