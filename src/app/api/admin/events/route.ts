import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/tracking/admin-auth'
import { recentEvents } from '@/lib/tracking/aggregate'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get('limit') || '50', 10) || 50, 1),
      500
    )
    const before = searchParams.get('before')
    const events = await recentEvents(limit, before)
    return NextResponse.json({ events }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json(
      { error: 'storage_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
