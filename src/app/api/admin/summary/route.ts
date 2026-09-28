import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/tracking/admin-auth'
import { buildSummary, RangeKey } from '@/lib/tracking/aggregate'

export const runtime = 'nodejs'

function parseRange(input: string | null): RangeKey {
  if (input === '24h' || input === '7d' || input === '30d' || input === 'all') return input
  return '7d'
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const range = parseRange(searchParams.get('range'))
    const pathContains = searchParams.get('pathContains')
    const summary = await buildSummary({
      range,
      pathContains: pathContains?.slice(0, 200) || null,
    })
    return NextResponse.json(summary, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json(
      { error: 'storage_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
