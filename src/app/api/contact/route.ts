import { NextResponse } from 'next/server'
import { trackingContext } from '@/lib/tracking/server-context'
import { newTurn, saveTurn, readTurn, validRecordId, type ConversationTurn } from '@/lib/tracking/conversations'
import { appendEvent } from '@/lib/tracking/store'
import { emailConfiguration, deliverEmail } from '@/lib/contact/provider'
import { createHash, randomUUID } from 'node:crypto'
import { allowRequest, requestIdentity, sameOrigin, redisConfigured, redisCommand } from '@/lib/server/redis'
export const runtime = 'nodejs'
export const maxDuration = 20
const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status })
export async function GET() {
  const deliveryAvailable=emailConfiguration().available
  return NextResponse.json({available:deliveryAvailable || redisConfigured(),deliveryAvailable,inboxAvailable:redisConfigured()}, {headers:{'Cache-Control':'no-store'}})
}
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
  const { email, subject, message, requestId, website, conversationId } = data
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
  let turn:ConversationTurn | undefined
  let lockKey=''
  let lockToken=''
  try {
    if (!(await allowRequest('contact',requestIdentity(request),5,3600))) return fail('rate_limited',429)
    const context=await trackingContext(request)
    // Contact contents are voluntarily submitted to the owner even when analytics is opted out.
    const contactContext=context || {ts:new Date().toISOString(),path:'/',visitorId:'contact-only',sessionId:requestId,referrer:null,userAgent:null,country:null,locale:null,screenWidth:null,screenHeight:null}
    turn=newTurn(contactContext,validRecordId(conversationId) ? conversationId : requestId,requestId,message.trim(),'contact')
    if(redisConfigured()) {
      lockKey=`duyportfolio:${process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'}:contact-lock:${turn.conversationId}:${requestId}`
      lockToken=randomUUID()
      if(!await redisCommand(['SET',lockKey,lockToken,'NX','EX',60])) return fail('delivery_in_progress',409)
    }
    const prior=await readTurn(turn.conversationId,requestId)
    if(prior && (prior.user!==message.trim() || prior.email!==email.trim() || prior.subject!==subject.trim())) return fail('request_conflict',409)
    if(prior?.providerId) return NextResponse.json({ok:true,status:'accepted'})
    turn={...turn,ts:prior?.ts || turn.ts,email:email.trim(),subject:subject.trim()}
    await saveTurn(turn)
    const event=async(kind:'contact_submitted'|'contact_accepted'|'contact_failed',status:string) => {
      if(context) await appendEvent({...context,ts:new Date().toISOString(),kind,targetId:'contact:send',eventId:`${turn!.conversationId}:${requestId}:${kind}`,details:{requestId,status,conversationId:turn!.conversationId,turnId:requestId}})
    }
    await event('contact_submitted','submitted')
    if(!emailConfiguration().available) {
      turn={...turn,status:'error',error:'delivery_unconfigured',finishedAt:new Date().toISOString()}
      await saveTurn(turn);await event('contact_failed','delivery_unconfigured')
      return NextResponse.json({ok:true,status:'stored',delivery:'unconfigured'},{status:202})
    }
    const fingerprint=createHash('sha256').update(JSON.stringify([email.trim(),subject.trim(),message.trim()])).digest('hex').slice(0,24)
    const idempotencyKey=`portfolio-${requestId}-${fingerprint}`
    try {
      const receipt=await deliverEmail({email:email.trim(),subject:subject.trim(),message:message.trim(),idempotencyKey})
      turn={...turn,status:'complete',providerId:receipt.id,model:receipt.provider,finishedAt:new Date().toISOString()}
      await saveTurn(turn);await event('contact_accepted','accepted')
      return NextResponse.json({ok:true,status:'accepted'})
    } catch {
      turn={...turn,status:'error',error:'delivery_unavailable',finishedAt:new Date().toISOString()}
      await saveTurn(turn);await event('contact_failed','delivery_unavailable')
      return fail('delivery_unavailable',502)
    }
  } catch {return fail('storage_unavailable',503)}
  finally {
    if(lockKey && lockToken) await redisCommand(['EVAL',"if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end; return 0",1,lockKey,lockToken]).catch(()=>{})
  }
}
