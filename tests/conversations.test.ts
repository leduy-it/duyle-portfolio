import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import { conversationKey, newTurn, saveTurn, conversationPage, validRecordId } from '../src/lib/tracking/conversations'
import type { TrackEvent } from '../src/lib/tracking/store'
const context = {visitorId:'visitor',sessionId:'session',ts:'2026-10-04T00:00:00Z',path:'/pets'} as TrackEvent
const id = '00000000-0000-4000-8000-000000000001'
test('conversation keys isolate visitors and reject invalid request IDs', () => {
  assert.notEqual(conversationKey('alice',id),conversationKey('bob',id))
  assert.equal(validRecordId(id),true); assert.equal(validRecordId('../../secrets'),false)
})
test('local journal preserves updates, full Unicode replies and anchored pages without duplicating turns', async () => {
  const env = {...process.env}, read = fs.readFile, append = fs.appendFile, mkdir = fs.mkdir
  let journal = ''
  try {
    Object.assign(process.env,{NODE_ENV:'development'})
    for (const key of ['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','KV_REST_API_URL','KV_REST_API_TOKEN']) delete process.env[key]
    fs.mkdir = (async () => undefined) as typeof fs.mkdir
    fs.appendFile = (async (_file,data) => {journal += data}) as typeof fs.appendFile
    fs.readFile = (async () => journal) as unknown as typeof fs.readFile
    for (let i=0;i<121;i++) await saveTurn(newTurn(context,id,String(i),'Câu hỏi '+i))
    const cid = conversationKey('visitor',id)
    const first = await conversationPage(1,undefined,cid)
    const updated = {...newTurn(context,id,'120','Câu hỏi 120'), assistant:'Đây là câu trả lời đầy đủ [[card:profile-portrait]]',status:'complete' as const}
    await saveTurn(updated)
    await saveTurn(newTurn(context,id,'121','A new question'))
    const second = await conversationPage(2,first.anchor,cid)
    const third = await conversationPage(3,first.anchor,cid)
    assert.equal(first.total,121); assert.equal(second.records.length,50); assert.equal(third.records.length,21)
    assert.equal(second.records[0].id,'70'); assert.equal(third.hasNext,false)
    assert.equal((await conversationPage(1,undefined,cid)).total,122)
    const current = (await conversationPage(1,undefined,cid)).records[1]
    assert.equal('assistant' in current ? current.assistant : '',updated.assistant)
  } finally { process.env=env; fs.readFile=read; fs.appendFile=append; fs.mkdir=mkdir }
})
test('production refuses ephemeral disk and Redis updates never trim or expire history', async () => {
  const env = {...process.env},fetch = global.fetch
  try {
    Object.assign(process.env,{NODE_ENV:'production'})
    for (const key of ['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','KV_REST_API_URL','KV_REST_API_TOKEN']) delete process.env[key]
    await assert.rejects(saveTurn(newTurn(context,id,id,'hi')),/storage_unconfigured/)
    Object.assign(process.env,{UPSTASH_REDIS_REST_URL:'https://redis.test',UPSTASH_REDIS_REST_TOKEN:'test'})
    global.fetch = async (_url,init) => {
      const command = JSON.parse(String(init?.body)); assert.equal(command[0],'EVAL')
      assert.match(command[1],/HSETNX/); assert.doesNotMatch(command[1],/EXPIRE|LTRIM|DEL/)
      return Response.json({result:1})
    }
    await saveTurn(newTurn(context,id,id,'hi'))
    global.fetch = async () => Response.json({error:'failure'},{status:503})
    await assert.rejects(saveTurn(newTurn(context,id,id,'hi')),/storage_unavailable/)
  } finally { process.env=env;global.fetch=fetch }
})
