import { NextRequest, NextResponse } from 'next/server'
import { adminConfigured, buildAdminCookie, passphraseMatches } from '@/lib/tracking/admin-auth'
import { allowRequest, requestIdentity, sameOrigin } from '@/lib/server/redis'
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json({ ok: false, error: 'invalid_origin' }, { status: 403 })
  if (!adminConfigured())
    return NextResponse.json({ ok: false, error: 'admin_unconfigured' }, { status: 503 })
  if (Number(req.headers.get('content-length')) > 1024)
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  try {
    if (!(await allowRequest('admin-login', requestIdentity(req), 8, 900)))
      return NextResponse.json({ ok: false, error: 'too_many_attempts' }, { status: 429 })
    const raw = await req.text()
    if (raw.length > 1024)
      return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
    const body = JSON.parse(raw),
      provided = typeof body?.passphrase === 'string' ? body.passphrase : ''
    if (!passphraseMatches(provided))
      return NextResponse.json({ ok: false, error: 'wrong_passphrase' }, { status: 401 })
    const cookie = buildAdminCookie(),
      res = NextResponse.json({ ok: true })
    res.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: cookie.maxAge,
    })
    return res
  } catch {
    return NextResponse.json({ ok: false, error: 'temporarily_unavailable' }, { status: 503 })
  }
}
