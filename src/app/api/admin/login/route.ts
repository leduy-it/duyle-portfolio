import { NextRequest, NextResponse } from 'next/server'
import { buildAdminCookie, passphraseMatches } from '@/lib/tracking/admin-auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { passphrase?: unknown } | null
  const provided = typeof body?.passphrase === 'string' ? body.passphrase : ''

  if (!passphraseMatches(provided)) {
    await new Promise((r) => setTimeout(r, 250))
    return NextResponse.json({ ok: false, error: 'wrong incantation' }, { status: 401 })
  }

  const cookie = buildAdminCookie()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: cookie.maxAge,
  })
  return res
}
