'use client'

import {formatEventTime} from '@/lib/tracking/presentation'
import {useCallback,useEffect,useRef,useState} from 'react'
import type {ConversationInfo,ConversationTurn} from '@/lib/tracking/conversations'
import {ChatReplyCards,ChatReplyText} from '@/components/chat/rich-message'
import './conversation-browser.css'

interface Page<T>{records:T[];page:number;total:number;anchor:number;hasNext:boolean}
const empty={records:[],page:1,total:0,anchor:0,hasNext:false}
async function load<T>(page:number,id?:string,anchor?:number,signal?:AbortSignal):Promise<Page<T>>{
  const params=new URLSearchParams({page:String(page)})
  if(id)params.set('id',id)
  if(anchor!==undefined)params.set('anchor',String(anchor))
  const response=await fetch(`/api/admin/conversations?${params}`,{cache:'no-store',signal})
  if(!response.ok)throw Error(response.status===404?'Session expired. Sign in again.':'Conversation storage unavailable. Previously loaded records are preserved.')
  return response.json()
}
export function ConversationBrowser(){
  const [conversations,setConversations]=useState<Page<ConversationInfo>>(empty)
  const [turns,setTurns]=useState<Page<ConversationTurn>>(empty)
  const [selected,setSelected]=useState<ConversationInfo|null>(null)
  const [error,setError]=useState('')
  const [loadingThread,setLoadingThread]=useState(false)
  const [busy,setBusy]=useState(false)
  const [expanded,setExpanded]=useState(false)
  const [showThreads,setShowThreads]=useState(true)
  const [filter,setFilter]=useState('')
  const dialog=useRef<HTMLDialogElement>(null)
  const request=useRef<AbortController|null>(null)
  const selectedId=useRef('')
  const refresh=useCallback(async()=>{
    setError('')
    try{setConversations(await load<ConversationInfo>(1))}catch(e){setError((e as Error).message)}
  },[])
  useEffect(()=>{void refresh();return()=>request.current?.abort()},[refresh])
  useEffect(()=>{if(expanded && dialog.current && !dialog.current.open)dialog.current.showModal()},[expanded])
  async function select(info:ConversationInfo){
    request.current?.abort()
    const controller=new AbortController();request.current=controller
    selectedId.current=info.id;setSelected(info);setTurns(empty);setShowThreads(false);setError('');setLoadingThread(true)
    try{
      const page=await load<ConversationTurn>(1,info.id,undefined,controller.signal)
      if(!controller.signal.aborted)setTurns({...page,records:[...page.records].reverse()})
    }catch(e){if(!controller.signal.aborted)setError((e as Error).message)}
    finally{if(!controller.signal.aborted)setLoadingThread(false)}
  }
  async function moveThreads(page:number){
    setBusy(true);setError('')
    try{setConversations(await load<ConversationInfo>(page,undefined,conversations.anchor))}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function older(){
    if(!selected || !turns.hasNext)return
    const id=selected.id;setBusy(true);setError('')
    try{const page=await load<ConversationTurn>(turns.page+1,id,turns.anchor);if(selectedId.current===id)setTurns(current=>({...page,records:[...page.records].reverse().concat(current.records)}))}
    catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function exportHistory(){
    if(!selected)return
    const info=selected;setBusy(true);setError('')
    try{
      let page=await load<ConversationTurn>(1,info.id);const records=[...page.records]
      while(page.hasNext){page=await load<ConversationTurn>(page.page+1,info.id,page.anchor);records.push(...page.records)}
      const blob=new Blob([JSON.stringify({conversation:info,exportedAt:new Date().toISOString(),records:records.reverse()},null,2)],{type:'application/json'})
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`conversation-${info.id}.json`;link.click();URL.revokeObjectURL(url)
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  function restore(){dialog.current?.close();setExpanded(false)}
  const filtered=conversations.records.filter(info=>`${info.preview} ${info.visitorId} ${info.sessionId}`.toLowerCase().includes(filter.toLowerCase()))
  const workspace=<div className="conversation-workspace" data-show-threads={showThreads}>
    <aside className="conversation-sidebar" data-thread-sidebar aria-label="Conversation threads">
      <div className="conversation-sidebar-header"><span className="conversation-eyebrow">$ conversations</span><span>{conversations.total} threads</span><button className="conversation-sidebar-restore" onClick={()=>expanded?restore():setExpanded(true)} aria-label={expanded?'Restore view':'Open full view'}>{expanded?'↙ Restore':'⤢ Open full'}</button></div>
      <label className="conversation-search"><span className="sr-only">Find a loaded thread</span><input type="search" value={filter} onChange={event=>setFilter(event.target.value)} placeholder="Find a thread…" /></label>
      <div className="conversation-thread-list">{filtered.map(info=><button type="button" key={info.id} aria-current={selected?.id===info.id?'true':undefined} onClick={()=>void select(info)}>
        <span className="conversation-thread-preview">{info.preview || 'Untitled conversation'}</span><span className="conversation-thread-meta"><time>{formatEventTime(info.updatedAt)}</time><span>{info.visitorId.slice(0,8)}</span></span>
      </button>)}{!filtered.length && <p className="conversation-empty">{filter?'No matches on this page.':'No recorded threads yet.'}</p>}</div>
      <footer className="conversation-thread-pagination"><span>{conversations.page} / {Math.max(1,Math.ceil(conversations.total/50))}</span><button aria-label="Previous threads" disabled={busy || conversations.page<=1} onClick={()=>void moveThreads(conversations.page-1)}>←</button><button aria-label="Next threads" disabled={busy || !conversations.hasNext} onClick={()=>void moveThreads(conversations.page+1)}>→</button><button disabled={busy} onClick={()=>{void refresh();if(selected)void select(selected)}}>Refresh</button></footer>
    </aside>
    <div className="conversation-main">
      <header className="conversation-toolbar"><button className="conversation-mobile-threads" onClick={()=>setShowThreads(!showThreads)}>Threads</button><div className="conversation-title"><span>{selected?.preview || 'Select a conversation'}</span><small>{selected?`${turns.total} turns · ${selected.visitorId.slice(0,8)} · ${selected.sessionId.slice(0,8)}`:'Private owner transcript viewer'}</small></div><div className="conversation-controls">{selected && <button disabled={busy || loadingThread} onClick={()=>void exportHistory()}>Export full conversation</button>}<button onClick={()=>expanded?restore():setExpanded(true)} aria-label={expanded?'Restore view':'Open full view'}>{expanded?'↙ Restore':'⤢ Open full'}</button></div></header>
      {error && <p role="alert" className="conversation-error">{error}</p>}
      <div className="conversation-transcript" data-transcript role="region" aria-label="Conversation transcript" aria-busy={loadingThread}>
        {!selected && <div className="conversation-welcome"><span aria-hidden="true">&gt;_</span><h3>Every conversation, in one place.</h3><p>Choose a thread to read the original questions, replies, media and contact messages.</p><small>50 threads per page · no automatic deletion</small></div>}
        {loadingThread && <p className="conversation-empty" role="status">Loading conversation…</p>}
        {selected && !loadingThread && <div className="conversation-messages">
          {turns.hasNext && <button className="conversation-load-earlier" disabled={busy} onClick={()=>void older()}>Load earlier messages</button>}
          {turns.records.map(turn=><article key={turn.id} className="conversation-turn" data-turn-id={turn.id}>
            <div className="conversation-turn-meta"><time>{formatEventTime(turn.ts)}</time><span>{turn.mode} · {turn.path} · {turn.status}</span></div>
            <div className="conversation-user"><span className="conversation-speaker">visitor &gt;</span>{turn.email && <p className="conversation-contact">From: {turn.email} · {turn.subject}</p>}<p>{turn.user}</p></div>
            {turn.assistant && <div className="conversation-assistant"><span className="conversation-speaker">michael.py &gt; {turn.model && <small>{turn.model}</small>}</span><div className="conversation-reply"><ChatReplyText {...{text:turn.assistant,sources:turn.sources}} /></div><ChatReplyCards text={turn.assistant} question={turn.user} vi={false}/></div>}
            {turn.error && <p className="conversation-error">{turn.error}</p>}
            {turn.submissionId && <p className="conversation-turn-meta">Form relay {turn.submissionReportedBy==='browser' ? 'acknowledgement reported by browser' : 'acknowledged submission'} · local reference: {turn.submissionId}. Owner email activation and inbox arrival require confirmation.</p>}
            {turn.providerId && <p className="conversation-turn-meta">Provider acceptance receipt: {turn.providerId}. Inbox arrival is not confirmed here.</p>}
          </article>)}
          {!turns.records.length && !error && <p className="conversation-empty">No turns recorded in this thread.</p>}
          <footer className="conversation-transcript-footer">{turns.records.length} / {turns.total} turns loaded · questions and replies are shown in original order<details><summary>Thread details</summary><p>Conversation {selected.id}<br/>Visitor {selected.visitorId}<br/>Session {selected.sessionId}</p></details></footer>
        </div>}
      </div>
    </div>
  </div>
  return <section className="conversation-section" data-admin-conversations>
    <header className="conversation-section-header"><div><h2>Conversations & contact inbox</h2><p>Owner only · original questions and replies · media and sources · no automatic deletion</p></div></header>
    {!expanded && workspace}
    {expanded && <dialog ref={dialog} className="conversation-full" aria-label="Conversation workspace" onClose={()=>setExpanded(false)} onClick={event=>{if(event.target===event.currentTarget)restore()}}>{workspace}</dialog>}
  </section>
}
