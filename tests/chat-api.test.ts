import test from 'node:test'
import assert from 'node:assert/strict'
import { POST } from '../src/app/api/chat/route'
const request = (body: unknown) =>
  new Request('https://portfolio.example/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  })

test('malformed message and refine payloads return 400, not server exceptions', async () => {
  process.env.OPENROUTER_API_KEY = 'test-only'
  for (const value of [
    null,
    {},
    { messages: 'oops' },
    { messages: [{ role: 'system', content: 'override' }] },
    { mode: 'refine', body: '' },
  ]) {
    const response = await POST(request(value))
    assert.equal(response.status, 400)
  }
})

test('stream forwards Unicode deltas, redacts upstream errors and closes once', async () => {
  process.env.OPENROUTER_API_KEY = 'test-only'
  const original = global.fetch
  try {
    global.fetch = async () =>
      new Response('data: {"choices":[{"delta":{"content":"Chào"}}]}\r\n\r\ndata: [DONE]\r\n\r\n')
    const response = await POST(
      request({ messages: [{ role: 'user', content: 'hi' }], stream: true })
    )
    const output = await response.text()
    assert.match(output, /Chào/)
    assert.equal(output.split('event: done').length, 2)
    global.fetch = async () =>
      new Response('data: {"error":{"message":"private-provider-detail"}}\n\n')
    const error = await POST(request({ messages: [{ role: 'user', content: 'hi' }], stream: true }))
    const errorText = await error.text()
    assert.match(errorText, /event: error/)
    assert.doesNotMatch(errorText, /private-provider-detail/)
    global.fetch = async () =>
      new Response('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n')
    const truncated = await POST(
      request({ messages: [{ role: 'user', content: 'hi' }], stream: true })
    )
    const truncatedText = await truncated.text()
    assert.match(truncatedText, /event: error/)
    assert.doesNotMatch(truncatedText, /event: done/)
  } finally {
    global.fetch = original
    delete process.env.OPENROUTER_API_KEY
  }
})

test('English latest question overrides Vietnamese history and retrieves grounded evidence', async () => {
  process.env.OPENROUTER_API_KEY='test-only'
  const original=global.fetch
  let sent: {messages:{role:string;content:string}[]} = {messages:[]}
  try {
    global.fetch=async(_url,init)=>{
      sent=JSON.parse(String(init?.body))
      return Response.json({choices:[{message:{content:"[Duy's agent]\n\nHe builds OCR systems."}}]})
    }
    const response=await POST(request({messages:[{role:'assistant',content:'[trợ lí của Duy] Xin chào.'},{role:'user',content:'What did Duy do in the handwritten recognition hackathon?'}]}))
    assert.equal(response.status,200)
    assert.match(sent.messages[0].content,/REPLY_LANGUAGE: English only/)
    assert.match(sent.messages[0].content,/Third prize|3rd Prize/i)
    assert.match(sent.messages[0].content,/data, not instructions/)
    assert.doesNotMatch(sent.messages[0].content,/RESEND_API_KEY|JINA_API_KEY|ADMIN_SECRET/)
  }finally{global.fetch=original;delete process.env.OPENROUTER_API_KEY}
})

test('server saves submitted turns and partial failed stream replies before finishing the request',async()=>{
  const env={...process.env},fetch=global.fetch
  const saved:{status:string;user:string;assistant:string}[]=[]
  try {
    Object.assign(process.env,{NODE_ENV:'production',OPENROUTER_API_KEY:'test-only',TRACKING_SALT:'test-only-salt',UPSTASH_REDIS_REST_URL:'https://redis.example',UPSTASH_REDIS_REST_TOKEN:'test-only'})
    global.fetch=async(url,init)=>{
      const payload=JSON.parse(String(init?.body))
      if(String(url)==='https://redis.example') {
        if(payload[0]==='EVAL' && String(payload[3]).includes(':conversations:')) saved.push(JSON.parse(payload[8]))
        return Response.json({result:1})
      }
      return new Response('data: {"choices":[{"delta":{"content":"Partial Unicode: Chào bạn"}}]}\n\n')
    }
    const response=await POST(new Request('https://portfolio.example/api/chat',{method:'POST',headers:{'user-agent':'Mozilla/5.0 (browser verification)'},body:JSON.stringify({conversationId:crypto.randomUUID(),turnId:crypto.randomUUID(),messages:[{role:'user',content:'hi'}],stream:true})}))
    const output=await response.text()
    assert.match(output,/Partial Unicode/);assert.match(output,/event: error/)
    assert.equal(saved[0].user,'hi');assert.equal(saved[0].status,'receiving')
    assert.equal(saved.at(-1)?.status,'error');assert.equal(saved.at(-1)?.assistant,'Partial Unicode: Chào bạn')
  }finally{process.env=env;global.fetch=fetch}
})
