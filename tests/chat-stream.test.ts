import assert from 'node:assert/strict'
import test from 'node:test'
import { consumeChatStream } from '../src/lib/chat/stream'

function stream(chunks: string[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk))
      controller.close()
    },
  })
}

test('streaming joins split SSE frames and CRLF without losing Unicode', async () => {
  const updates: string[] = []
  const result = await consumeChatStream(
    stream([
      'data: {"del',
      'ta":"Xin "}\r',
      '\n\r\ndata: {"delta":"chào 🐰"}\n\nevent: done\ndata: [DONE]\n\n',
    ]),
    (value) => updates.push(value)
  )
  assert.equal(result, 'Xin chào 🐰')
  assert.deepEqual(updates, ['Xin ', 'Xin chào 🐰'])
})

test('an upstream error frame rejects rather than displaying a completed blank reply', async () => {
  await assert.rejects(
    consumeChatStream(stream(['event: error\ndata: {"message":"unavailable"}\n\n']), () => {}),
    /unavailable/
  )
})

test('an empty or truncated response is an error and a final unseparated frame is read', async () => {
  await assert.rejects(
    consumeChatStream(stream([]), () => {}),
    /empty/
  )
  assert.equal(await consumeChatStream(stream(['data: {"delta":"hello"}']), () => {}), 'hello')
})
