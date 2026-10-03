import test from 'node:test'
import assert from 'node:assert/strict'
import {readChatSession,saveChatSession} from '../src/lib/chat/session'
import {chatRequestTurns} from '../src/lib/chat/handoff'
test('long technical answers survive navigation while request history stays bounded',()=>{
  const answer='A detailed answer. '.repeat(200)
  saveChatSession({messages:[{role:'user',content:'Explain his architecture'},{role:'assistant',content:answer}],draft:'unsent'})
  assert.equal(readChatSession()?.messages[1].content,answer)
  const history=chatRequestTurns(Array.from({length:30},(_,i)=>({role:i%2?'assistant':'user',content:'x'.repeat(i%2?5000:1500)})))
  assert.ok(history.length<=14)
  assert.ok(history.reduce((sum,item)=>sum+item.content.length,0)<=10000)
  assert.equal(history.at(-1)?.role,'assistant')
})
