import test from 'node:test'
import assert from 'node:assert/strict'
import { POST, GET } from '../src/app/api/contact/route'
const payload = {
  email: 'visitor@example.com',
  subject: 'Hello',
  message: 'I would love to chat about your work.',
  requestId: crypto.randomUUID(),
}
const req = (body: unknown) =>
  new Request('https://portfolio.example/api/contact', {
    method: 'POST',
    headers: { origin: 'https://portfolio.example' },
    body: JSON.stringify(body),
  })
test('contact validates email/header injection and empty content before sending', async () => {
  for (const body of [
    null,
    { ...payload, email: 'bad-address' },
    { ...payload, subject: 'hello\r\nbcc:somebody@example.com' },
    { ...payload, message: '  ' },
  ])
    assert.equal((await POST(req(body))).status, 400)
})
test('contact accepts only a provider receipt and keeps recipient fixed', async () => {
  process.env.RESEND_API_KEY = 'test-only'
  process.env.CONTACT_FROM_EMAIL = 'Portfolio <portfolio@example.com>'
  const original = global.fetch
  let sent: Record<string, unknown> = {}
  let idempotency = ''
  try {
    global.fetch = async (_url, init) => {
      sent = JSON.parse(String(init?.body))
      idempotency = new Headers(init?.headers).get('Idempotency-Key') || ''
      return Response.json({ id: 'receipt-1' })
    }
    const response = await POST(req({ ...payload, to: 'attacker@example.com' }))
    assert.equal(response.status, 200)
    assert.deepEqual(sent.to, ['levduyit@gmail.com'])
    assert.equal(sent.reply_to, payload.email)
    assert.ok(idempotency)
    global.fetch = async () => {throw Error('duplicate sends are forbidden')}
    assert.equal((await POST(req(payload))).status,200)
    global.fetch = async () => Response.json({ message: 'private diagnostic' })
    const bad = await POST(req({ ...payload, requestId: crypto.randomUUID() }))
    assert.equal(bad.status, 502)
    assert.doesNotMatch(await bad.text(), /private diagnostic/)
  } finally {
    global.fetch = original
    delete process.env.RESEND_API_KEY
    delete process.env.CONTACT_FROM_EMAIL
  }
})

 test('delivery capability is truthful and never exposes configuration values', async () => {
  delete process.env.RESEND_API_KEY
  delete process.env.CONTACT_FROM_EMAIL
  assert.deepEqual(await (await GET()).json(), {available:false,deliveryAvailable:false,inboxAvailable:false})
  process.env.RESEND_API_KEY='test-provider-secret'
  process.env.CONTACT_FROM_EMAIL='Portfolio <test@example.com>'
  const configured=await GET()
  assert.deepEqual(await configured.json(), {available:true,deliveryAvailable:true,inboxAvailable:false})
  assert.match(configured.headers.get('cache-control') || '', /no-store/)
  delete process.env.RESEND_API_KEY
  delete process.env.CONTACT_FROM_EMAIL
})

test('unconfigured delivery saves full submission to owner inbox without claiming email acceptance',async()=>{
  const env={...process.env},fetch=global.fetch
  const {promises:fs}=await import('node:fs')
  const read=fs.readFile,append=fs.appendFile,mkdir=fs.mkdir
  let journal=''
  try {
    for(const key of ['RESEND_API_KEY','CONTACT_FROM_EMAIL','BREVO_API_KEY','KV_REST_API_URL','KV_REST_API_TOKEN','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN']) delete process.env[key]
    Object.assign(process.env,{NODE_ENV:'development',TRACKING_SALT:'test-salt'})
    fs.mkdir=(async()=>undefined) as typeof fs.mkdir
    fs.readFile=(async()=>journal) as unknown as typeof fs.readFile
    fs.appendFile=(async(file,data)=>{if(String(file).includes('conversations'))journal+=data}) as typeof fs.appendFile
    global.fetch=async()=>{throw Error('No provider request without credentials')}
    const response=await POST(req({...payload,requestId:crypto.randomUUID()}))
    assert.equal(response.status,202)
    assert.deepEqual(await response.json(),{ok:true,status:'stored',delivery:'unconfigured'})
    const records=journal.trim().split('\n').map(line=>JSON.parse(line))
    assert.equal(records.at(-1).user,payload.message);assert.equal(records.at(-1).email,payload.email)
    assert.equal(records.at(-1).error,'delivery_unconfigured')
  }finally{process.env=env;global.fetch=fetch;fs.readFile=read;fs.appendFile=append;fs.mkdir=mkdir}
})

test('Brevo free adapter requires its receipt and uses verified sender and fixed owner recipient',async()=>{
  const env={...process.env},fetch=global.fetch
  const {deliverEmail}=await import('../src/lib/contact/provider')
  try {
    Object.assign(process.env,{CONTACT_PROVIDER:'brevo',BREVO_API_KEY:'test-only',CONTACT_FROM_EMAIL:'Portfolio <verified@example.com>'})
    global.fetch=async(url,init)=>{
      assert.equal(String(url),'https://api.brevo.com/v3/smtp/email')
      const data=JSON.parse(String(init?.body))
      assert.deepEqual(data.to,[{email:'levduyit@gmail.com',name:'Michael Le'}]);assert.equal(data.sender.email,'verified@example.com')
      assert.equal(data.replyTo.email,payload.email);assert.equal(data.headers['Idempotency-Key'],'test-request')
      return Response.json({messageId:'brevo-receipt'}, {status:201})
    }
    assert.deepEqual(await deliverEmail({...payload,idempotencyKey:'test-request'}),{id:'brevo-receipt',provider:'brevo'})
  }finally{process.env=env;global.fetch=fetch}
})
