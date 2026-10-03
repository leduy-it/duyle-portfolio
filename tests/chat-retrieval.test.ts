import test from 'node:test'
import assert from 'node:assert/strict'
import { replyLanguage } from '../src/lib/chat/language'
import { lexicalRetrieve, knowledgeDocuments } from '../src/lib/chat/documents'

test('latest question determines language independently of the interface', () => {
  assert.equal(replyLanguage('Is Duy handsome?'), 'en')
  assert.equal(replyLanguage('What does Duy build?'), 'en')
  assert.equal(replyLanguage('Duy có đẹp trai không?'), 'vi')
  assert.equal(replyLanguage('duy lam gi vay'), 'vi')
  assert.equal(replyLanguage('Tell me about his OCR experience'), 'en')
  assert.equal(replyLanguage('Trả lời bằng tiếng Anh: Duy làm gì?'), 'en')
  assert.equal(replyLanguage('Please answer in Vietnamese: what does Duy build?'), 'vi')
})
test('retrieval finds factual social media and technical evidence with canonical sources', () => {
  const results = lexicalRetrieve('Vietnamese handwritten recognition hackathon', 4)
  assert.ok(results.some(doc => /hackathon/i.test(doc.text)))
  assert.ok(knowledgeDocuments.some(doc => doc.source.includes('instagram.com') && /portrait/i.test(doc.text)))
  assert.ok(knowledgeDocuments.every(doc => doc.id && doc.source && doc.text))
  assert.deepEqual(lexicalRetrieve('zzzzxyznonexistent', 4), [])
})

test('semantic lookup uses valid precomputed vectors, caches queries, falls back on provider failure', async()=>{
  const {retrieveKnowledge}=await import('../src/lib/chat/retrieval')
  const {default:index}=await import('../src/lib/chat/embeddings.json')
  const original=global.fetch
  process.env.JINA_API_KEY='test-only'
  let count=0
  try {
    const entry=index.entries.find(item=>item.id==='life-soict-hackathon')!
    global.fetch=async()=>{count++;return Response.json({data:[{embedding:entry.vector}]})}
    const first=await retrieveKnowledge('a unique handwritten competition question')
    assert.equal(first.mode,'hybrid')
    assert.ok(first.documents.some(doc=>doc.id==='life-soict-hackathon'))
    await retrieveKnowledge('a unique handwritten competition question')
    assert.equal(count,1)
    global.fetch=async()=>new Response('',{status:429})
    const fallback=await retrieveKnowledge('Naver Vietnamese handwriting hackathon')
    assert.equal(fallback.mode,'lexical')
    assert.ok(fallback.documents.some(doc=>/hackathon/i.test(doc.text)))
  }finally{global.fetch=original;delete process.env.JINA_API_KEY}
})

test('appearance banter follows owner voice and keeps English and Vietnamese separate',async()=>{
  const {appearanceReply}=await import('../src/lib/chat/personality')
  assert.match(appearanceReply('Is Duy handsome?') || '',/The most handsome/)
  assert.match(appearanceReply('Duy có đẹp trai không? Cho xem ảnh') || '',/Đẹp trai nhất/)
  assert.equal(appearanceReply('How does his OCR architecture work?'),null)
  assert.equal(appearanceReply('Is Duy handsome and how does his OCR architecture work?'),null)
})
