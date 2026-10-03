import test from 'node:test'
import assert from 'node:assert/strict'
import { appendEvent, readActiveEvents, readEventPage, getSalt, type TrackEvent } from '../src/lib/tracking/store'
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
    assert.match(String(commands[0][1]), /PERSIST/)
    assert.doesNotMatch(String(commands[0][1]), /LTRIM|EXPIRE/)
    assert.deepEqual(await readActiveEvents(), [event])
    global.fetch = async () => Response.json({ error: 'provider failure' }, { status: 503 })
    await assert.rejects(readActiveEvents(), /storage_unavailable/)
  } finally {
    global.fetch = fetch
    process.env = original
  }
})

test('older records remain readable and history advances in pages of 50', async () => {
  const original = { ...process.env }, fetch = global.fetch
  const records = Array.from({ length: 121 }, (_, index) => JSON.stringify({
    ...event, ts: new Date(Date.UTC(2020, 0, 1 + index)).toISOString(), visitorId: `visitor-${index}`,
  }))
  try {
    Object.assign(process.env, { NODE_ENV: 'production', UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test-only' })
    global.fetch = async (_url, init) => {
      const command = JSON.parse(String(init?.body))
      if (command[0] === 'LLEN') return Response.json({ result: records.length })
      if (command[0] === 'LRANGE') return Response.json({ result: records.slice(Number(command[2]), Number(command[3]) < 0 ? undefined : Number(command[3]) + 1) })
      return Response.json({ result: 1 })
    }
    const first = await readEventPage(1)
    records.push(JSON.stringify({ ...event, visitorId: 'new-arrival', ts: new Date().toISOString() }))
    const second = await readEventPage(2, 50, first.anchor)
    const third = await readEventPage(3, 50, first.anchor)
    assert.equal(first.events.length, 50)
    assert.equal(second.events.length, 50)
    assert.equal(third.events.length, 21)
    assert.equal(first.events[0].visitorId, 'visitor-120')
    assert.equal(second.events[0].visitorId, 'visitor-70')
    assert.equal(third.events.at(-1)?.visitorId, 'visitor-0')
    assert.equal(third.hasNext, false)
    assert.equal((await readActiveEvents()).length, 122)
  } finally {
    global.fetch = fetch
    process.env = original
  }
})

test('local analytics reuses its persisted salt instead of rotating on restart', async () => {
  const { promises: fs } = await import('node:fs')
  const original = { ...process.env },
    read = fs.readFile,
    mkdir = fs.mkdir,
    write = fs.writeFile
  let writes = 0
  try {
    Object.assign(process.env, { NODE_ENV: 'development' })
    delete process.env.TRACKING_SALT
    fs.readFile = (async () => 'persisted-development-salt') as unknown as typeof fs.readFile
    fs.mkdir = (async () => undefined) as typeof fs.mkdir
    fs.writeFile = async () => {
      writes++
    }
    assert.equal(await getSalt(), 'persisted-development-salt')
    assert.equal(writes, 0)
  } finally {
    fs.readFile = read
    fs.mkdir = mkdir
    fs.writeFile = write
    process.env = original
  }
})
