import { allowRequest } from '@/lib/server/redis'
import { createHash } from 'node:crypto'
import index from './embeddings.json'
import { knowledgeDocuments, lexicalScores, normalizeText, type KnowledgeDocument } from './documents'
import { discoverCards } from './catalog'
const cache = new Map<string,{vector:number[];expires:number}>()
const valid = new Map(index.entries.map((entry: {id:string;hash:string;vector:number[]}) => [entry.id,entry]))
export function cosine(a:number[],b:number[]) {
  if(a.length!==b.length||!a.length) return 0
  let dot=0,aa=0,bb=0
  for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}
  return aa&&bb?dot/Math.sqrt(aa*bb):0
}
async function queryVector(question:string):Promise<number[]|null> {
  const key=process.env.JINA_API_KEY
  if(!key||!index.entries.length) return null
  const normalized=normalizeText(question.trim())
  const hit=cache.get(normalized)
  if(hit&&hit.expires>Date.now()) return hit.vector
  try {
    if (!(await allowRequest('jina-query','public-global-budget',100,86400))) return null
    const res=await fetch('https://api.jina.ai/v1/embeddings',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:index.model,task:'retrieval.query',dimensions:index.dimensions,normalized:true,input:[question.slice(0,1500)]}),signal:AbortSignal.timeout(2200)})
    if(!res.ok)return null
    const vector=(await res.json()).data?.[0]?.embedding
    if(!Array.isArray(vector)||vector.length!==index.dimensions||!vector.every(Number.isFinite))return null
    if(cache.size>=200)cache.delete(cache.keys().next().value!)
    cache.set(normalized,{vector,expires:Date.now()+15*60*1000})
    return vector
  }catch{return null}
}
export async function retrieveKnowledge(question:string):Promise<{documents:KnowledgeDocument[];mode:'hybrid'|'lexical'}> {
  const vector=await queryVector(question)
  const intent=new Set(discoverCards(question).map(card=>card.id))
  const lexical=lexicalScores(question)
  const max=Math.max(1,...lexical.map(item=>item.score))
  const ranked=lexical.map(({doc,score})=>{
    const entry=valid.get(doc.id)
    const fresh=entry&&entry.hash===createHash('sha256').update(doc.text).digest('hex')
    const semantic=vector&&fresh?cosine(vector,entry.vector):0
    return {doc,score:score/max*.45+Math.max(0,semantic)*.55+(doc.cardId&&intent.has(doc.cardId)?.3:0), relevant:score>0||semantic>.3||!!(doc.cardId&&intent.has(doc.cardId))}
  }).filter(item=>item.relevant).sort((a,b)=>b.score-a.score)
  return {documents:ranked.slice(0,6).map(item=>item.doc),mode:vector?'hybrid':'lexical'}
}
