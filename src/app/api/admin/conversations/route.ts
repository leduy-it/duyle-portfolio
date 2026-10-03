import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/tracking/admin-auth'
import { conversationPage } from '@/lib/tracking/conversations'
export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  if (!await isAdminRequest()) return NextResponse.json({error:'Not Found'},{status:404})
  const query = request.nextUrl.searchParams
  const id = query.get('id') || undefined
  if (id && !/^[a-f0-9]{32}$/.test(id)) return NextResponse.json({error:'invalid_id'},{status:400})
  const page = Math.max(1,parseInt(query.get('page') || '1',10) || 1)
  const anchor = /^\d+$/.test(query.get('anchor') || '') ? Number(query.get('anchor')) : undefined
  try { return NextResponse.json(await conversationPage(page,anchor,id),{headers:{'Cache-Control':'no-store'}}) }
  catch { return NextResponse.json({error:'storage_unavailable'},{status:503}) }
}
