'use client'

import { replyLanguage } from '@/lib/chat/language'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cardsFromReply, safeChatHref, type ChatCard } from '@/lib/chat/catalog'
import './rich-message.css'

export function ChatReplyText({ text, onNavigate }: { text: string; onNavigate?: (newTab?: boolean) => void }) {
  const clean = text.replace(/\[\[(?:card:)?[a-z0-9-]+\]\]/gi, '').replace(/\[\[[^\]]*$/, '')
  const pieces: ReactNode[] = []
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g
  let cursor = 0
  for (const match of clean.matchAll(pattern)) {
    pieces.push(clean.slice(cursor, match.index))
    const href = safeChatHref(match[2])
    pieces.push(href ? <Link className="chat-inline-link" href={href} key={match.index} onClick={() => onNavigate?.()}>{match[1]}</Link> : match[1])
    cursor = match.index! + match[0].length
  }
  pieces.push(clean.slice(cursor))
  return <>{pieces}</>
}

export function ChatReplyCards({ text, question, vi, onNavigate, streaming = false }: {
  text: string; question?: string; vi: boolean; onNavigate?: (newTab?: boolean) => void; streaming?: boolean
}) {
  vi = question ? replyLanguage(question) === 'vi' : vi
  const cards = streaming ? [] : cardsFromReply(text, question)
  const [preview, setPreview] = useState<ChatCard | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (preview && dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [preview])
  if (!cards.length) return null
  return <div className="chat-cards" data-chat-cards>
    {cards.map(card => <article className="chat-card" key={card.id} data-chat-card={card.id}>
      {card.video ? <video className="chat-card-media" src={card.video} poster={card.image} controls playsInline preload="none" aria-label={card.title[vi ? 'vi' : 'en']} />
        : card.image ? <button type="button" className="chat-card-preview" onClick={() => setPreview(card)} aria-label={`${vi ? 'Xem ảnh' : 'Preview image'}: ${card.title[vi ? 'vi' : 'en']}`}>
          <Image className="chat-card-media" src={card.image} alt={card.title[vi ? 'vi' : 'en']} width={640} height={400} sizes="(max-width: 480px) 85vw, 350px" />
          <span aria-hidden="true">⤢</span>
        </button> : null}
      <div className="chat-card-body">
        <span className="chat-card-source">{card.source || card.category}</span>
        <h4>{card.title[vi ? 'vi' : 'en']}</h4>
        <p>{card.description[vi ? 'vi' : 'en']}</p>
        <div className="chat-card-actions">
          <Link href={card.href} onClick={() => onNavigate?.()}>{vi ? 'Khám phá' : 'Explore'} <span aria-hidden="true">→</span></Link>
          <Link href={card.href} target="_blank" rel="noopener noreferrer" onClick={() => onNavigate?.(true)} aria-label={`${vi ? 'Mở tab mới' : 'Open in new tab'}: ${card.title[vi ? 'vi' : 'en']}`} title={vi ? 'Mở tab mới' : 'Open in new tab'}>↗</Link>
        </div>
      </div>
    </article>)}
    {preview && <dialog ref={dialog} className="chat-media-dialog" aria-label={preview.title[vi ? 'vi' : 'en']} onClose={() => setPreview(null)} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close() }}>
      <button type="button" onClick={() => dialog.current?.close()} aria-label={vi ? 'Đóng ảnh' : 'Close preview'}>×</button>
      <Image src={preview.image!} alt={preview.title[vi ? 'vi' : 'en']} width={1200} height={850} sizes="90vw" />
      <p>{preview.title[vi ? 'vi' : 'en']}</p>
    </dialog>}
  </div>
}
