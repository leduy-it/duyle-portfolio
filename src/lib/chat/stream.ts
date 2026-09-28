export async function consumeChatStream(
  body: ReadableStream<Uint8Array>,
  onText: (text: string) => void
): Promise<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''
  let finished = false
  function event(frame: string) {
    const lines = frame.replace(/\r\n/g, '\n').split('\n')
    const kind = lines
      .find((line) => line.startsWith('event:'))
      ?.slice(6)
      .trim()
    const data = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')
      .trim()
    if (kind === 'error') throw new Error('chat_unavailable')
    if (data === '[DONE]' || kind === 'done') {
      finished = true
      return
    }
    if (!data) return
    let payload: { delta?: unknown; error?: unknown }
    try {
      payload = JSON.parse(data)
    } catch {
      return
    }
    if (payload.error) throw new Error('chat_unavailable')
    if (typeof payload.delta === 'string') {
      text += payload.delta
      onText(text)
    }
  }
  try {
    while (!finished) {
      const { value, done } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      let boundary: RegExpExecArray | null
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index)
        buffer = buffer.slice(boundary.index + boundary[0].length)
        event(frame)
        if (finished) break
      }
      if (done) {
        if (buffer.trim() && !finished) event(buffer)
        break
      }
    }
    if (!text.trim()) throw new Error('empty_reply')
    if (!finished) throw new Error('incomplete_reply')
    return text
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
