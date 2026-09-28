import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { allowRequest, requestIdentity, sameOrigin } from '@/lib/server/redis'
export const runtime = 'nodejs'
export const maxDuration = 20
const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status })
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail('invalid_origin', 403)
  if (Number(request.headers.get('content-length')) > 14_000) return fail('too_large', 413)
  let data
  try {
    const raw = await request.text()
    if (raw.length > 12_000) return fail('too_large', 413)
    data = JSON.parse(raw)
  } catch {
    return fail('invalid_request', 400)
  }
  if (!data || typeof data !== 'object') return fail('invalid_request', 400)
  const { email, subject, message, requestId, website } = data
  if (
    typeof email !== 'string' ||
    email.length > 254 ||
    !/^\S+@[^\s@]+\.[^\s@]+$/.test(email) ||
    /[\r\n]/.test(email) ||
    typeof subject !== 'string' ||
    !subject.trim() ||
    subject.length > 160 ||
    /[\r\n]/.test(subject) ||
    typeof message !== 'string' ||
    !message.trim() ||
    message.length > 8000 ||
    typeof requestId !== 'string' ||
    !/^[a-f0-9-]{36}$/i.test(requestId)
  )
    return fail('invalid_fields', 400)
  if (website) return fail('invalid_request', 400)
  const apiKey = process.env.RESEND_API_KEY,
    from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from || /[\r\n]/.test(from)) return fail('delivery_unconfigured', 503)
  try {
    if (!(await allowRequest('contact', requestIdentity(request), 5, 3600)))
      return fail('rate_limited', 429)
    const payload = {
      from,
      to: ['levduyit@gmail.com'],
      reply_to: email.trim(),
      subject: `Portfolio / ${subject.trim()}`,
      text: message.trim(),
    }
    const fingerprint = createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
      .slice(0, 24)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `portfolio-${requestId}-${fingerprint}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    })
    const receipt = await response.json().catch(() => null)
    if (!response.ok || typeof receipt?.id !== 'string' || !receipt.id)
      return fail('delivery_unavailable', 502)
    return NextResponse.json({ ok: true, status: 'accepted' })
  } catch {
    return fail('delivery_unavailable', 503)
  }
}
