import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSummary } from '../src/lib/tracking/aggregate'
import type { TrackEvent } from '../src/lib/tracking/store'

test('life engagement and social campaigns do not inflate pageview totals', async () => {
  const original = { ...process.env }, fetch = global.fetch
  const base: TrackEvent = {
    ts: new Date().toISOString(), path: '/life', referrer: null, country: 'VN', locale: 'vi',
    userAgent: 'Mozilla/5.0', visitorId: 'v1', sessionId: 's1', screenWidth: 390, screenHeight: 844,
  }
  const events: TrackEvent[] = [
    { ...base, source: 'instagram', medium: 'social', campaign: 'life' },
    { ...base, kind: 'life_story_view', targetId: 'camera-on' },
    { ...base, kind: 'life_video_play', targetId: 'fb-camera-2026' },
    { ...base, kind: 'life_video_complete', targetId: 'fb-camera-2026' },
  ]
  try {
    Object.assign(process.env, { NODE_ENV: 'production', UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test-only' })
    global.fetch = async (_url, init) => {
      const command = JSON.parse(String(init?.body))
      return Response.json({ result: command[0] === 'LRANGE' ? events.map(e => JSON.stringify(e)) : 1 })
    }
    const summary = await buildSummary({ range: '7d' })
    assert.equal(summary.totals.pageviews, 1)
    assert.equal(summary.totals.avgPagesPerSession, 1)
    assert.equal(summary.life.storyViews, 1)
    assert.equal(summary.life.videoPlays, 1)
    assert.equal(summary.life.videoCompletions, 1)
    assert.deepEqual(summary.socialSources, [{ label: 'instagram', count: 1 }])
  } finally {
    global.fetch = fetch
    process.env = original
  }
})
