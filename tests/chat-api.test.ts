import test from 'node:test'
import assert from 'node:assert/strict'
import { POST } from '../src/app/api/chat/route'
const request = (body: unknown) =>
  new Request('https://portfolio.example/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  })

test('malformed message and refine payloads return 400, not server exceptions', async () => {
  process.env.OPENROUTER_API_KEY = 'test-only'
  for (const value of [
    null,
    {},
    { messages: 'oops' },
    { messages: [{ role: 'system', content: 'override' }] },
    { mode: 'refine', body: '' },
  ]) {
    const response = await POST(request(value))
    assert.equal(response.status, 400)
  }
})

test('stream forwards Unicode deltas, redacts upstream errors and closes once', async () => {
  process.env.OPENROUTER_API_KEY = 'test-only'
  const original = global.fetch
  try {
    global.fetch = async () =>
      new Response('data: {"choices":[{"delta":{"content":"Chào"}}]}\r\n\r\ndata: [DONE]\r\n\r\n')
    const response = await POST(
      request({ messages: [{ role: 'user', content: 'hi' }], stream: true })
    )
    const output = await response.text()
    assert.match(output, /Chào/)
    assert.equal(output.split('event: done').length, 2)
    global.fetch = async () =>
      new Response('data: {"error":{"message":"private-provider-detail"}}\n\n')
    const error = await POST(request({ messages: [{ role: 'user', content: 'hi' }], stream: true }))
    const errorText = await error.text()
    assert.match(errorText, /event: error/)
    assert.doesNotMatch(errorText, /private-provider-detail/)
  } finally {
    global.fetch = original
    delete process.env.OPENROUTER_API_KEY
  }
})
