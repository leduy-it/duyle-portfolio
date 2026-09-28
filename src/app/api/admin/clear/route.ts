import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/tracking/admin-auth'
import { sameOrigin } from '@/lib/server/redis'
import { clearActive } from '@/lib/tracking/store'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
  if (!sameOrigin(req)) return NextResponse.json({ error: 'invalid_origin' }, { status: 403 })
  const body = (await req.json().catch(() => null)) as {
    confirm?: unknown
  } | null
  if (typeof body?.confirm !== 'string' || body.confirm !== 'delete') {
    return NextResponse.json({ ok: false, error: 'confirm required' }, { status: 400 })
  }
  try {
    await clearActive()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 })
  }
}
