import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/tracking/admin-auth'
import { readEventPage } from '@/lib/tracking/store'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const rawAnchor = searchParams.get('anchor')
    const anchor = rawAnchor && /^\d+$/.test(rawAnchor) ? Number(rawAnchor) : undefined
    const session = searchParams.get('session') || undefined
    if (session && !/^[a-zA-Z0-9-]{8,64}$/.test(session)) return NextResponse.json({error:'invalid_session'},{status:400})
    const result = await readEventPage(page, 50, anchor, session)
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json(
      { error: 'storage_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
