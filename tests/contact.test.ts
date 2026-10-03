import test from 'node:test'
import assert from 'node:assert/strict'
import { POST, GET } from '../src/app/api/contact/route'
const payload = {
  email: 'visitor@example.com',
  subject: 'Hello',
  message: 'I would love to chat about your work.',
  requestId: 'a1b2c3d4-0123-4567-890a-0123456789ab',
}
const req = (body: unknown) =>
  new Request('https://portfolio.example/api/contact', {
    method: 'POST',
    headers: { origin: 'https://portfolio.example' },
    body: JSON.stringify(body),
  })
test('contact validates email/header injection and empty content before sending', async () => {
  for (const body of [
    null,
    { ...payload, email: 'bad-address' },
    { ...payload, subject: 'hello\r\nbcc:somebody@example.com' },
    { ...payload, message: '  ' },
  ])
    assert.equal((await POST(req(body))).status, 400)
})
test('contact accepts only a provider receipt and keeps recipient fixed', async () => {
  process.env.RESEND_API_KEY = 'test-only'
  process.env.CONTACT_FROM_EMAIL = 'Portfolio <portfolio@example.com>'
  const original = global.fetch
  let sent: Record<string, unknown> = {}
  let idempotency = ''
  try {
    global.fetch = async (_url, init) => {
      sent = JSON.parse(String(init?.body))
      idempotency = new Headers(init?.headers).get('Idempotency-Key') || ''
      return Response.json({ id: 'receipt-1' })
    }
    const response = await POST(req({ ...payload, to: 'attacker@example.com' }))
    assert.equal(response.status, 200)
    assert.deepEqual(sent.to, ['levduyit@gmail.com'])
    assert.equal(sent.reply_to, payload.email)
    assert.ok(idempotency)
    global.fetch = async () => Response.json({ message: 'private diagnostic' })
    const bad = await POST(req({ ...payload, requestId: 'b1b2c3d4-0123-4567-890a-0123456789ab' }))
    assert.equal(bad.status, 502)
    assert.doesNotMatch(await bad.text(), /private diagnostic/)
  } finally {
    global.fetch = original
    delete process.env.RESEND_API_KEY
    delete process.env.CONTACT_FROM_EMAIL
  }
})

 test('delivery capability is truthful and never exposes configuration values', async () => {
  delete process.env.RESEND_API_KEY
  delete process.env.CONTACT_FROM_EMAIL
  assert.deepEqual(await (await GET()).json(), {available:false})
  process.env.RESEND_API_KEY='test-provider-secret'
  process.env.CONTACT_FROM_EMAIL='Portfolio <test@example.com>'
  const configured=await GET()
  assert.deepEqual(await configured.json(), {available:true})
  assert.match(configured.headers.get('cache-control') || '', /no-store/)
  delete process.env.RESEND_API_KEY
  delete process.env.CONTACT_FROM_EMAIL
})
