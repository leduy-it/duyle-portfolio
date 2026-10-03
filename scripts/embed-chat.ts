import { createHash } from 'node:crypto'
import previous from '../src/lib/chat/embeddings.json'
import { writeFile } from 'node:fs/promises'
import { knowledgeDocuments } from '../src/lib/chat/documents'
async function main() {
const key = process.env.JINA_API_KEY
if (!key) throw new Error('Set server-only JINA_API_KEY before indexing.')
const entries: {id:string; hash:string; vector:number[]}[] = []
const reusable = new Map(previous.entries.map(entry=>[entry.id,entry]))
const pending = knowledgeDocuments.filter(doc=>{const entry=reusable.get(doc.id); if(entry && entry.hash===createHash('sha256').update(doc.text).digest('hex') && entry.vector.length===256) {entries.push(entry); return false} return true})
for (let offset=0;offset<pending.length;offset+=24) {
  const batch = pending.slice(offset,offset+24)
  const response = await fetch('https://api.jina.ai/v1/embeddings',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:'jina-embeddings-v3',task:'retrieval.passage',dimensions:256,normalized:true,input:batch.map(doc=>doc.text)}),signal:AbortSignal.timeout(60000)})
  if(!response.ok) throw new Error(`Embedding provider status ${response.status}; no credentials logged.`)
  const result = await response.json()
  for(let index=0;index<batch.length;index++) {
    const vector=result.data?.find((item:{index:number})=>item.index===index)?.embedding
    if(!Array.isArray(vector)||vector.length!==256||!vector.every(Number.isFinite)) throw new Error('Invalid embedding response')
    entries.push({id:batch[index].id,hash:createHash('sha256').update(batch[index].text).digest('hex'),vector:vector.map((v:number)=>Number(v.toFixed(6)))})
  }
  console.log(`Indexed ${entries.length}/${knowledgeDocuments.length} public documents`)
}
await writeFile('src/lib/chat/embeddings.json',JSON.stringify({model:'jina-embeddings-v3',dimensions:256,entries})+'\n')

}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Embedding index failed'); process.exitCode=1 })
