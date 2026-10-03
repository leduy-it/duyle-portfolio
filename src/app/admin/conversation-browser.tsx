'use client'
import { useCallback, useEffect, useState } from 'react'
import type { ConversationInfo, ConversationTurn } from '@/lib/tracking/conversations'
import { ChatReplyCards, ChatReplyText } from '@/components/chat/rich-message'

interface Page<T> {records:T[];page:number;total:number;anchor:number;hasNext:boolean}
const empty = {records:[],page:1,total:0,anchor:0,hasNext:false}
async function load<T>(page:number,id?:string,anchor?:number):Promise<Page<T>> {
  const params = new URLSearchParams({page:String(page)})
  if(id) params.set('id',id)
  if(anchor !== undefined) params.set('anchor',String(anchor))
  const response = await fetch(`/api/admin/conversations?${params}`,{cache:'no-store'})
  if(!response.ok) throw Error(response.status===404 ? 'Session expired. Sign in again.' : 'Conversation storage unavailable. The last loaded data is preserved.')
  return response.json()
}
export function ConversationBrowser() {
  const [conversations,setConversations]=useState<Page<ConversationInfo>>(empty)
  const [turns,setTurns]=useState<Page<ConversationTurn>>(empty)
  const [selected,setSelected]=useState<ConversationInfo | null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const refresh = useCallback(async() => {
    setError('')
    try {setConversations(await load<ConversationInfo>(1))} catch(error) {setError((error as Error).message)}
  },[])
  useEffect(()=>{void refresh()},[refresh])
  async function select(info:ConversationInfo) {
    setError('');setBusy(true)
    try {const page=await load<ConversationTurn>(1,info.id);setSelected(info);setTurns(page)} catch(error) {setError((error as Error).message)} finally {setBusy(false)}
  }
  async function move(page:number) {
    setError('');setBusy(true)
    try {
      if(selected) setTurns(await load<ConversationTurn>(page,selected.id,turns.anchor))
      else setConversations(await load<ConversationInfo>(page,undefined,conversations.anchor))
    } catch(error) {setError((error as Error).message)} finally {setBusy(false)}
  }
  async function exportHistory() {
    if(!selected) return
    setBusy(true);setError('')
    try {
      let page=await load<ConversationTurn>(1,selected.id)
      const records=[...page.records]
      while(page.hasNext) {page=await load<ConversationTurn>(page.page+1,selected.id,page.anchor);records.push(...page.records)}
      const blob=new Blob([JSON.stringify({conversation:selected,exportedAt:new Date().toISOString(),records:records.reverse()},null,2)],{type:'application/json'})
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`conversation-${selected.id}.json`;link.click();URL.revokeObjectURL(url)
    } catch(error) {setError((error as Error).message)} finally {setBusy(false)}
  }
  const page=selected ? turns : conversations
  return <section className="my-6 rounded-lg border border-[rgb(var(--border))] p-4" data-admin-conversations>
    <header className="flex flex-wrap justify-between gap-3 mb-4"><div><h2 className="text-sm font-semibold">Conversations & contact inbox</h2><p className="text-[11px] mt-1 text-[rgb(var(--text-muted))]">Owner only · full submitted text and reply/media references · 50 records per page · no automatic deletion</p></div><div className="flex flex-wrap gap-2 text-xs">
      {selected && <button className="rounded border px-3 py-2" onClick={()=>setSelected(null)}>All conversations</button>}
      <button className="rounded border px-3 py-2" disabled={busy} onClick={()=>selected ? void select(selected) : void refresh()}>Refresh</button>
      {selected && <button className="rounded border px-3 py-2" disabled={busy} onClick={()=>void exportHistory()}>Export full conversation</button>}
    </div></header>
    {error && <p role="alert" className="text-xs text-[rgb(var(--terminal-red))] mb-3">{error}</p>}
    {selected ? <><p className="mb-3 break-all text-[11px]">Conversation {selected.id} · visitor {selected.visitorId} · session {selected.sessionId}</p>
      <div className="space-y-4">{turns.records.map(turn=><article key={turn.id} className="rounded border border-[rgb(var(--border-muted))] p-3 text-xs">
        <header className="flex flex-wrap justify-between gap-2 text-[10px] text-[rgb(var(--text-muted))]"><time>{new Date(turn.ts).toLocaleString()}</time><span>{turn.mode} · {turn.status} · {turn.path} · {turn.model || '—'}</span></header>
        {turn.email && <p className="mt-3 break-all">From: {turn.email} · {turn.subject}</p>}
        <h3 className="mt-3 text-[rgb(var(--accent))]">Visitor</h3><p className="whitespace-pre-wrap break-words leading-relaxed mt-1">{turn.user}</p>
        {turn.assistant && <><h3 className="mt-3 text-[rgb(var(--accent))]">Assistant</h3><div className="mt-1 whitespace-pre-wrap break-words leading-relaxed"><ChatReplyText text={turn.assistant} /></div><ChatReplyCards text={turn.assistant} question={turn.user} vi={/[àáạảãâầấậẩẫăằắặẳẵđ]/i.test(turn.user)} /></>}
        {!!turn.sources?.length && <ul className="mt-3 space-y-1">{turn.sources.map(source=><li key={source.url}><a className="underline break-all" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>}
        {turn.error && <p className="mt-3 text-[rgb(var(--terminal-red))]">{turn.error}</p>}
        {turn.providerId && <p className="mt-2 break-all text-[10px]">Provider acceptance receipt: {turn.providerId}. Inbox arrival is not confirmed here.</p>}
      </article>)}</div></> : <div className="space-y-2">{conversations.records.map(info=><button type="button" key={info.id} disabled={busy} onClick={()=>void select(info)} className="w-full text-left rounded border border-[rgb(var(--border-muted))] p-3 hover:border-[rgb(var(--accent))]">
        <span className="flex justify-between gap-2 text-[10px] text-[rgb(var(--text-muted))]"><time>{new Date(info.updatedAt).toLocaleString()}</time><span>{info.visitorId.slice(0,8)}</span></span><p className="mt-2 text-xs break-words">{info.preview}</p>
      </button>)}</div>}
    {!page.records.length && !error && <p className="text-xs py-5 text-[rgb(var(--text-muted))]">No recorded conversations yet. Earlier chats were not saved.</p>}
    <footer className="mt-4 flex justify-between items-center gap-3 text-xs"><span>Page {page.page} · {page.total} records</span><div className="flex gap-2"><button disabled={busy || page.page<=1} onClick={()=>void move(page.page-1)} className="border rounded px-3 py-2 disabled:opacity-40">Previous</button><button disabled={busy || !page.hasNext} onClick={()=>void move(page.page+1)} className="border rounded px-3 py-2 disabled:opacity-40">Next</button></div></footer>
  </section>
}
