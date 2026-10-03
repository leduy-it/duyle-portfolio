import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { redisConfigured, redisCommand } from '@/lib/server/redis'
import type { TrackEvent } from './store'

const PREFIX = `duyportfolio:${process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'}:conversations:v1`
const LOCAL = path.join(process.cwd(), 'data', 'conversations')
export type TurnStatus = 'receiving' | 'complete' | 'error' | 'aborted'
export interface ConversationTurn {
  id: string; conversationId: string; visitorId: string; sessionId: string; ts: string; finishedAt?: string
  mode: 'chat' | 'compose' | 'refine' | 'contact'; path: string; user: string; assistant: string
  status: TurnStatus; model?: string; error?: string; sources?: { title: string; url: string }[]
  email?: string; subject?: string; providerId?: string
}
export interface ConversationInfo { id: string; visitorId: string; sessionId: string; createdAt: string; updatedAt: string; preview: string }
export const validRecordId = (id: unknown): id is string => typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id)
export function conversationKey(visitorId: string, clientId: string) { return createHash('sha256').update(`${visitorId}|${clientId}`).digest('hex').slice(0,32) }
export function newTurn(context: TrackEvent, clientId: string, turnId: string, user: string, mode: ConversationTurn['mode'] = 'chat'): ConversationTurn {
  return { id: turnId, conversationId: conversationKey(context.visitorId, clientId), visitorId: context.visitorId, sessionId: context.sessionId, ts: new Date().toISOString(), mode, path: context.path, user, assistant: '', status: 'receiving' }
}
function requireStorage() { if (process.env.NODE_ENV === 'production' && !redisConfigured()) throw Error('storage_unconfigured') }
const decode = <T,>(values: string[]) => values.flatMap(raw => { try { return [JSON.parse(raw) as T] } catch { return [] } })
/** Immutable creation order. Updating streaming status never adds duplicate rows. No TTL/trimming. */
export async function saveTurn(turn: ConversationTurn) {
  requireStorage()
  const info: ConversationInfo = { id: turn.conversationId, visitorId: turn.visitorId, sessionId: turn.sessionId, createdAt: turn.ts, updatedAt: turn.finishedAt || turn.ts, preview: turn.user.slice(0,160) }
  if (redisConfigured()) {
    await redisCommand(['EVAL', `local fresh=redis.call('HSETNX',KEYS[1],ARGV[1],ARGV[2]); if fresh==1 then redis.call('RPUSH',KEYS[2],ARGV[1]); end; redis.call('HSET',KEYS[1],ARGV[1],ARGV[2]); if redis.call('HSETNX',KEYS[3],ARGV[3],ARGV[4])==1 then redis.call('RPUSH',KEYS[4],ARGV[3]); else local old=cjson.decode(redis.call('HGET',KEYS[3],ARGV[3])); local item=cjson.decode(ARGV[4]); item.createdAt=old.createdAt; redis.call('HSET',KEYS[3],ARGV[3],cjson.encode(item)); end; return fresh`, 4, `${PREFIX}:${turn.conversationId}:records`, `${PREFIX}:${turn.conversationId}:order`, `${PREFIX}:info`, `${PREFIX}:order`, turn.id, JSON.stringify(turn), turn.conversationId, JSON.stringify(info)])
    return
  }
  await fs.mkdir(LOCAL, { recursive: true })
  await fs.appendFile(path.join(LOCAL, 'journal.jsonl'), JSON.stringify(turn)+'\n', { mode: 0o600 })
}
async function localTurns() {
  let raw = ''
  try { raw = await fs.readFile(path.join(LOCAL,'journal.jsonl'),'utf8') } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  const records = new Map<string, ConversationTurn>()
  for (const item of decode<ConversationTurn>(raw.split('\n'))) records.set(`${item.conversationId}:${item.id}`,item)
  return [...records.values()]
}
export async function conversationPage(page = 1, anchor?: number, conversationId?: string) {
  requireStorage()
  const safePage = Math.max(1, Math.floor(page))
  const orderKey = conversationId ? `${PREFIX}:${conversationId}:order` : `${PREFIX}:order`
  let all: (ConversationTurn | ConversationInfo)[] = []
  let count: number
  if (redisConfigured()) count = Number(await redisCommand(['LLEN',orderKey]))
  else {
    const turns = await localTurns()
    if (conversationId) all = turns.filter(turn => turn.conversationId === conversationId)
    else {
      const infos = new Map<string, ConversationInfo>()
      for (const turn of turns) {
        const prior = infos.get(turn.conversationId)
        infos.set(turn.conversationId, {id:turn.conversationId,visitorId:turn.visitorId,sessionId:turn.sessionId,createdAt:prior?.createdAt || turn.ts,updatedAt:turn.finishedAt || turn.ts,preview:turn.user.slice(0,160)})
      }
      all = [...infos.values()]
    }
    count = all.length
  }
  const total = anchor === undefined ? count : Math.min(count,Math.max(0,Math.floor(anchor)))
  const end = total - (safePage - 1)*50
  if (end <= 0) return { records: [], page: safePage, total, anchor: total, hasNext: false }
  const start = Math.max(0,end-50)
  let records: (ConversationTurn | ConversationInfo)[]
  if (redisConfigured()) {
    const ids = await redisCommand<string[]>(['LRANGE',orderKey,start,end-1])
    const raw = ids.length ? await redisCommand<string[]>(['HMGET',conversationId ? `${PREFIX}:${conversationId}:records` : `${PREFIX}:info`,...ids]) : []
    records = decode<ConversationTurn | ConversationInfo>(raw).reverse()
  } else records = all.slice(start,end).reverse()
  return { records, page:safePage,total,anchor:total,hasNext:start>0 }
}

export async function readTurn(conversationId:string,id:string):Promise<ConversationTurn | null> {
  requireStorage()
  if(redisConfigured()) {
    const raw=await redisCommand<string | null>(['HGET',`${PREFIX}:${conversationId}:records`,id])
    return raw ? JSON.parse(raw) : null
  }
  return (await localTurns()).find(turn=>turn.conversationId===conversationId && turn.id===id) || null
}
