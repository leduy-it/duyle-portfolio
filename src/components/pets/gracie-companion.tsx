'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { consumeChatStream } from '@/lib/chat/stream'
import { stageChatHandoff, type ChatTurn } from '@/lib/chat/handoff'
import { useHomeMotionPreferences } from '@/components/home/home-motion'
import { usePetSave } from '@/lib/pets/pet-save-provider'
import { useCompanionPreference } from '@/lib/pets/companion-preference'
import { GracieSprite, type GraciePose } from './gracie-sprite'
import './gracie.css'

export function GracieCompanion() {
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLocale()
  const { visible, setVisible } = useCompanionPreference()
  const { prefersReducedMotion, isCoarsePointer } = useHomeMotionPreferences()
  const { save } = usePetSave()
  const stage = save.pets.find((pet) => pet.species === 'gracie')?.stage ?? 0
  const vi = locale === 'vi'
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [pose, setPose] = useState<GraciePose>('idle')
  const root = useRef<HTMLDivElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const controller = useRef<AbortController | null>(null)
  const turnsRef = useRef<ChatTurn[]>([])
  const beforeRequest = useRef<ChatTurn[]>([])
  const pendingText = useRef('')
  const requestId = useRef(0)
  const lastClick = useRef(0)

  function updateTurns(next: ChatTurn[]) {
    turnsRef.current = next
    setTurns(next)
  }

  useEffect(
    () => () => {
      controller.current?.abort()
    },
    []
  )

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus({ preventScroll: true })
    function dismiss(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        launcher.current?.focus()
      }
    }
    function outside(event: PointerEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', dismiss)
    document.addEventListener('pointerdown', outside)
    return () => {
      document.removeEventListener('keydown', dismiss)
      document.removeEventListener('pointerdown', outside)
    }
  }, [open])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [turns, busy])

  useEffect(() => {
    if (!visible || prefersReducedMotion || isCoarsePointer || pathname.startsWith('/admin')) return
    let frame = 0
    function follow(event: PointerEvent) {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = launcher.current?.getBoundingClientRect()
        if (!rect || !root.current) return
        root.current.style.setProperty(
          '--gracie-look-x',
          `${Math.max(-2.5, Math.min(2.5, (event.clientX - rect.x - rect.width / 2) / 150))}px`
        )
        root.current.style.setProperty(
          '--gracie-look-y',
          `${Math.max(-2, Math.min(2, (event.clientY - rect.y) / 180))}px`
        )
      })
    }
    window.addEventListener('pointermove', follow, { passive: true })
    return () => {
      window.removeEventListener('pointermove', follow)
      cancelAnimationFrame(frame)
    }
  }, [visible, prefersReducedMotion, isCoarsePointer, pathname])

  function fullChat() {
    const draft = busy ? pendingText.current : input
    const history = busy ? beforeRequest.current : turnsRef.current
    requestId.current += 1
    controller.current?.abort()
    setBusy(false)
    setPose('idle')
    updateTurns(history)
    stageChatHandoff({ messages: history, draft })
    setInput('')
    setOpen(false)
    if (pathname !== '/') router.push('/#terminal-chat')
    else
      document.getElementById('terminal-chat')?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      })
  }

  function activate() {
    const now = performance.now()
    if (now - lastClick.current < 300 && lastClick.current > 0) {
      lastClick.current = 0
      fullChat()
      return
    }
    lastClick.current = now
    setOpen((value) => !value)
    if (!busy) setPose('greeting')
  }

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    const id = ++requestId.current
    const previous = turnsRef.current
    beforeRequest.current = previous
    pendingText.current = text
    const history: ChatTurn[] = [...previous, { role: 'user' as const, content: text }].slice(-14)
    updateTurns([...history, { role: 'assistant', content: '' }])
    setInput('')
    setError(false)
    setBusy(true)
    setPose('thinking')
    controller.current = new AbortController()
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, stream: true }),
        signal: controller.current.signal,
      })
      if (!response.ok || !response.body) throw new Error('unavailable')
      await consumeChatStream(response.body, (content) => {
        if (requestId.current === id) updateTurns([...history, { role: 'assistant', content }])
      })
      if (requestId.current === id) setPose('ready')
    } catch {
      if (requestId.current !== id) return
      updateTurns(previous)
      setInput(text)
      setError(true)
      setPose('error')
    } finally {
      if (requestId.current === id) {
        setBusy(false)
        pendingText.current = ''
      }
    }
  }

  if (!visible || pathname.startsWith('/admin')) return null

  return (
    <div ref={root} className="gracie-companion" data-open={open}>
      {open && (
        <section
          id="gracie-chat"
          role="dialog"
          aria-label={vi ? 'Chat nhanh với Gracie' : 'Quick chat with Gracie'}
          className="gracie-chat"
        >
          <header className="gracie-chat-header">
            <div>
              <span className="gracie-kicker">
                <i /> GRACIE.OS
              </span>
              <h2>{vi ? 'Thỏ nhỏ, chuyện lớn.' : 'Small bunny. Big opinions.'}</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                launcher.current?.focus()
              }}
              aria-label={vi ? 'Đóng chat' : 'Close chat'}
              className="gracie-close"
            >
              ×
            </button>
          </header>
          <div
            className="gracie-chat-log"
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {turns.length === 0 && (
              <div className="gracie-welcome">
                <span className="gracie-wave">✦</span>
                <p>
                  {vi
                    ? 'Mình là Gracie, trợ lý kiêm đội hóng chuyện của Duy.'
                    : 'I’m Gracie, Duy’s sidekick and unofficial gossip filter.'}
                </p>
                <small>
                  {vi
                    ? 'Hỏi về công việc, phim ảnh, hoặc thử cà khịa một câu.'
                    : 'Ask about his work, his cinema wall, or bring a little banter.'}
                </small>
                <div className="gracie-suggestions">
                  {(vi
                    ? ['Duy làm gì?', 'Có mấy người yêu?']
                    : ['What does Duy build?', 'Any dating lore?']
                  ).map((text) => (
                    <button
                      type="button"
                      key={text}
                      onClick={() => {
                        setInput(text)
                        inputRef.current?.focus()
                      }}
                    >
                      {text} ↗
                    </button>
                  ))}
                </div>
              </div>
            )}
            {turns.map((turn, i) => (
              <div key={i} className={`gracie-message gracie-message-${turn.role}`}>
                {turn.content ? (
                  turn.content.replace(/^\[(?:Duy's agent|trợ lí của Duy)\]\s*/i, '')
                ) : (
                  <span className="gracie-typing" aria-label={vi ? 'Đang nghĩ' : 'Thinking'}>
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
            ))}
          </div>
          {error && (
            <p role="alert" className="gracie-error">
              {vi
                ? 'Sóng hơi chập chờn. Tin nhắn vẫn ở đây, gửi lại nhé.'
                : 'A little signal trouble. Your message is saved below—try again.'}
            </p>
          )}
          <form
            className="gracie-form"
            onSubmit={(event) => {
              event.preventDefault()
              void send()
            }}
          >
            <label className="sr-only" htmlFor="gracie-input">
              {vi ? 'Tin nhắn' : 'Message'}
            </label>
            <textarea
              id="gracie-input"
              ref={inputRef}
              rows={2}
              maxLength={2000}
              value={input}
              disabled={busy}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  void send()
                }
              }}
              placeholder={vi ? 'Nói gì vui vui đi…' : 'Say something interesting…'}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label={vi ? 'Gửi tin nhắn' : 'Send message'}
            >
              {busy ? '···' : '↑'}
            </button>
          </form>
          <footer className="gracie-chat-footer">
            <button type="button" onClick={fullChat}>
              {vi ? 'Mở terminal' : 'Open full chat'} ↗
            </button>
            <Link href="/pets" onClick={() => setOpen(false)}>
              {vi ? 'Ghé trại pet' : 'Visit the hatchery'} <span>✦</span>
            </Link>
          </footer>
        </section>
      )}
      <div className="gracie-launcher-row">
        <button
          type="button"
          className="gracie-hide"
          onClick={() => {
            setOpen(false)
            setVisible(false)
          }}
          aria-label={
            vi
              ? 'Ẩn Gracie. Bật lại bằng nút thỏ trên thanh menu.'
              : 'Hide Gracie. Show again with the bunny switch in the header.'
          }
          title={vi ? 'Ẩn Gracie' : 'Hide Gracie'}
        >
          ×
        </button>
        <span className="gracie-hint" role="tooltip" id="gracie-hint">
          {vi ? 'Chạm để chat · nhấp đúp mở terminal' : 'Tap to chat · double-click for terminal'}
        </span>
        <button
          ref={launcher}
          type="button"
          className="gracie-launcher"
          onClick={activate}
          aria-label={vi ? 'Gracie — mở chat nhanh' : 'Gracie — open quick chat'}
          aria-expanded={open}
          aria-controls="gracie-chat"
          aria-describedby="gracie-hint"
        >
          <GracieSprite
            stage={stage}
            pose={busy ? 'thinking' : pose}
            reducedMotion={prefersReducedMotion}
          />
          <span className="gracie-name">
            <i /> Gracie
          </span>
        </button>
      </div>
    </div>
  )
}
