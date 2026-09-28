'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocale } from '@/lib/i18n'
import { consumeChatStream } from '@/lib/chat/stream'
import { CHAT_HANDOFF_EVENT, consumeChatHandoff } from '@/lib/chat/handoff'
// Try the new locale-aware export; fall back to the legacy export if the data agent hasn't landed yet.
import { CANNED_RESPONSES } from '@/data/terminal-suggestions'
import { MagneticButton } from './magnetic-button'
import {
  APPLE_EASE_OUT_EXPO,
  APPLE_EASE_OUT_QUART,
  SOFT_SPRING,
  useHomeMotionPreferences,
} from './home-motion'

const TIMESTAMP = '23:57:03'

interface Message {
  time: string
  text: string
  isUser?: boolean
  streaming?: boolean
}

type WindowState = 'open' | 'minimized' | 'maximized' | 'closed'

type View = 'chat' | 'compose' | 'sent'

interface ComposeState {
  subject: string
  body: string
  email: string
  refineInstruction: string
  composing: boolean // LLM draft in flight
  sending: boolean
  error: string | null
}

const LS_POS_KEY = 'leduy-chat-pos'
const LS_STATE_KEY = 'leduy-chat-state'

// Locale-aware canned responses map — populated when the data agent lands the new export.
// Until then, CANNED_RESPONSES_BY_LOCALE will be undefined and we fall back to the legacy map.
const _terminalSuggestions = require('@/data/terminal-suggestions') as {
  CANNED_RESPONSES_BY_LOCALE?: Record<string, Record<string, string>>
}
const CANNED_RESPONSES_BY_LOCALE: Record<string, Record<string, string>> | undefined =
  _terminalSuggestions.CANNED_RESPONSES_BY_LOCALE

export function TerminalChat() {
  const { locale, t } = useLocale()
  const { prefersReducedMotion } = useHomeMotionPreferences()

  const [messages, setMessages] = useState<Message[]>([
    { time: TIMESTAMP, text: `STATUS: ${t('chat.statusOnline')}` },
    {
      time: TIMESTAMP,
      text: `${t('chat.agentPrefix')}\n\n${t('chat.banner')}`,
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [windowState, setWindowState] = useState<WindowState>('open')
  const [drag, setDrag] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [hydrated, setHydrated] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [view, setView] = useState<View>('chat')
  const [compose, setCompose] = useState<ComposeState>({
    subject: t('compose.subjectDefault'),
    body: '',
    email: '',
    refineInstruction: '',
    composing: false,
    sending: false,
    error: null,
  })

  const dragRef = useRef<{
    startX: number
    startY: number
    baseX: number
    baseY: number
  } | null>(null)
  const isDraggingRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const terminalInputRef = useRef<HTMLInputElement | null>(null)
  const hasHandoffRef = useRef(false)
  const deliveryAttempt = useRef({ fingerprint: '', id: '' })
  const sendingRef = useRef(false)
  const chatRequest = useRef<AbortController | null>(null)
  const chatGeneration = useRef(0)
  const chatInFlight = useRef(false)
  useEffect(
    () => () => {
      chatGeneration.current += 1
      chatRequest.current?.abort()
    },
    []
  )

  // Reset initial messages when locale changes
  useEffect(() => {
    if (hasHandoffRef.current) return
    setMessages([
      { time: TIMESTAMP, text: `STATUS: ${t('chat.statusOnline')}` },
      {
        time: TIMESTAMP,
        text: `${t('chat.agentPrefix')}\n\n${t('chat.banner')}`,
      },
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  // Hydrate from localStorage after first render (SSR-safe)
  useEffect(() => {
    try {
      const savedPos = localStorage.getItem(LS_POS_KEY)
      if (savedPos) {
        const pos = JSON.parse(savedPos) as { x: number; y: number }
        if (typeof pos.x === 'number' && typeof pos.y === 'number') {
          setDrag(pos)
        }
      }
      const savedState = localStorage.getItem(LS_STATE_KEY)
      if (savedState && ['open', 'minimized', 'maximized', 'closed'].includes(savedState)) {
        setWindowState(savedState as WindowState)
      }
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  // Gracie transfers a snapshot once, including an unsent draft if interrupted.
  useEffect(() => {
    if (!hydrated) return
    function receive() {
      const transfer = consumeChatHandoff()
      if (!transfer) return
      // Opening an unused companion simply restores this terminal, including
      // any active reply or unsent draft. There is no new conversation to apply.
      if (!transfer.messages.length && !transfer.draft.trim()) {
        setWindowState('open')
        setView('chat')
        setDrag({ x: 0, y: 0 })
        requestAnimationFrame(() => terminalInputRef.current?.focus({ preventScroll: true }))
        return
      }
      chatGeneration.current += 1
      chatRequest.current?.abort()
      chatInFlight.current = false
      setBusy(false)
      hasHandoffRef.current = true
      setMessages(
        transfer.messages.map((turn) => ({
          time: getCurrentTime(),
          text: turn.content,
          isUser: turn.role === 'user',
        }))
      )
      setInput(transfer.draft)
      setWindowState('open')
      setView('chat')
      setDrag({ x: 0, y: 0 })
      requestAnimationFrame(() => terminalInputRef.current?.focus({ preventScroll: true }))
    }
    receive()
    window.addEventListener(CHAT_HANDOFF_EVENT, receive)
    return () => window.removeEventListener(CHAT_HANDOFF_EVENT, receive)
  }, [hydrated])

  // Persist drag position and window state
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(LS_POS_KEY, JSON.stringify(drag))
    } catch {
      // ignore
    }
  }, [drag, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(LS_STATE_KEY, windowState)
    } catch {
      // ignore
    }
  }, [windowState, hydrated])

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'end',
    })
  }, [messages, prefersReducedMotion])

  // Listen for "send-this" events from suggestion pills (and other emitters).
  useEffect(() => {
    function onChatSend(e: Event) {
      const detail = (e as CustomEvent<{ text?: string }>).detail
      if (!detail?.text) return
      // Restore window if closed/minimized so the user sees the reply.
      setWindowState((prev) => (prev === 'closed' || prev === 'minimized' ? 'open' : prev))
      sendMessage(detail.text)
    }
    window.addEventListener('leduy:chat-send', onChatSend as EventListener)
    return () => window.removeEventListener('leduy:chat-send', onChatSend as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, busy, locale])

  // Mouse drag handlers
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragRef.current) return
      isDraggingRef.current = true
      setDrag({
        x: dragRef.current.baseX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.baseY + (e.clientY - dragRef.current.startY),
      })
    }
    function onUp() {
      dragRef.current = null
      isDraggingRef.current = false
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  function startDrag(e: React.MouseEvent) {
    // Don't start drag on buttons
    if ((e.target as HTMLElement).closest('button')) return
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: drag.x,
      baseY: drag.y,
    }
    document.body.style.userSelect = 'none'
  }

  function resetPosition() {
    setDrag({ x: 0, y: 0 })
  }

  function handleGreenClick(e: React.MouseEvent) {
    e.stopPropagation()
    setWindowState((prev) => (prev === 'maximized' ? 'open' : 'maximized'))
  }

  function handleGreenDblClick(e: React.MouseEvent) {
    e.stopPropagation()
    resetPosition()
  }

  function getCurrentTime() {
    return new Date().toTimeString().slice(0, 8)
  }

  function getCannedResponses(): Record<string, string> {
    if (CANNED_RESPONSES_BY_LOCALE) {
      return (
        CANNED_RESPONSES_BY_LOCALE[locale] ?? CANNED_RESPONSES_BY_LOCALE['en'] ?? CANNED_RESPONSES
      )
    }
    return CANNED_RESPONSES
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || chatInFlight.current || trimmed.length > 2000) return
    hasHandoffRef.current = true
    chatInFlight.current = true
    const generation = ++chatGeneration.current
    chatRequest.current = new AbortController()

    const userMsg: Message = {
      time: getCurrentTime(),
      text: trimmed,
      isUser: true,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Always route through the LLM (with streaming) so replies feel alive and the
    // agent sees the full conversation context. Canned responses are intentionally
    // not used as a fast-path here — they exist only as "warm-start" hints in the
    // system prompt for the model.

    setBusy(true)
    const replyTime = getCurrentTime()
    setMessages((prev) => [...prev, { time: replyTime, text: '', streaming: true }])

    try {
      const history = [...messages, userMsg]
        .filter((m) => !m.text.startsWith('STATUS:') && m.text !== '')
        .map((m) => ({
          role: (m.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-14), stream: true }),
        signal: chatRequest.current.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`http ${res.status}`)
      }

      const acc = await consumeChatStream(res.body, (text) => {
        if (generation !== chatGeneration.current) return
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last?.streaming) next[next.length - 1] = { ...last, text }
          return next
        })
      })

      if (generation !== chatGeneration.current) return
      setMessages((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last && last.streaming) {
          next[next.length - 1] = {
            ...last,
            streaming: false,
            text: acc || '(no reply)',
          }
        }
        return next
      })
    } catch {
      if (generation !== chatGeneration.current) return
      setInput(trimmed)
      setMessages((prev) => {
        const next = prev.slice(0, -2)
        next.push({
          time: getCurrentTime(),
          text: `${t('chat.agentPrefix')}\n\n${t('chat.error')}`,
        })
        return next
      })
    } finally {
      if (generation === chatGeneration.current) {
        setBusy(false)
        chatInFlight.current = false
      }
    }
  }

  async function openCompose() {
    setCompose({
      subject: t('compose.subjectDefault'),
      body: '',
      email: '',
      refineInstruction: '',
      composing: true,
      sending: false,
      error: null,
    })
    setView('compose')

    try {
      const history = messages
        .filter((m) => !m.text.startsWith('STATUS:') && m.text !== '')
        .map((m) => ({
          role: (m.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'compose', messages: history }),
      })

      if (!res.ok) throw new Error(`http ${res.status}`)
      const data = (await res.json()) as { reply?: string }
      setCompose((prev) => ({
        ...prev,
        body: data.reply ?? '',
        composing: false,
      }))
    } catch {
      setCompose((prev) => ({ ...prev, composing: false }))
    }
  }

  async function refineCompose() {
    setCompose((prev) => ({ ...prev, composing: true, error: null }))

    try {
      const history = messages
        .filter((m) => !m.text.startsWith('STATUS:') && m.text !== '')
        .map((m) => ({
          role: (m.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }))

      const currentBody = compose.body
      const instruction = compose.refineInstruction.trim()

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'refine',
          messages: history,
          body: currentBody,
          instruction,
        }),
      })

      if (!res.ok) throw new Error(`http ${res.status}`)
      const data = (await res.json()) as { reply?: string }
      setCompose((prev) => ({
        ...prev,
        body: data.reply ?? prev.body,
        // Clear the instruction field after a successful refine so the user can give a new one.
        refineInstruction: '',
        composing: false,
      }))
    } catch {
      setCompose((prev) => ({ ...prev, composing: false }))
    }
  }

  async function sendContact() {
    if (
      !compose.email.trim() ||
      !compose.body.trim() ||
      !compose.subject.trim() ||
      sendingRef.current
    )
      return
    sendingRef.current = true
    const fingerprint = JSON.stringify([compose.email.trim(), compose.subject, compose.body])
    if (deliveryAttempt.current.fingerprint !== fingerprint)
      deliveryAttempt.current = { fingerprint, id: crypto.randomUUID() }
    setCompose((prev) => ({ ...prev, sending: true, error: null }))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: compose.email.trim(),
          subject: compose.subject,
          message: compose.body,
          requestId: deliveryAttempt.current.id,
        }),
        signal: AbortSignal.timeout(18_000),
      })
      const data = await res.json()
      if (!res.ok || data.status !== 'accepted') throw new Error('delivery_failed')
      setView('sent')
    } catch {
      const mailtoHref = `mailto:levduyit@gmail.com?subject=${encodeURIComponent(compose.subject)}&body=${encodeURIComponent(compose.body)}`
      setCompose((prev) => ({ ...prev, error: mailtoHref }))
    } finally {
      sendingRef.current = false
      setCompose((prev) => ({ ...prev, sending: false }))
    }
  }

  // Build container styles
  const reducedMotion = prefersReducedMotion
  const mountTransition = reducedMotion
    ? { duration: 0.12 }
    : { duration: 0.5, ease: APPLE_EASE_OUT_EXPO }
  const microTransition = reducedMotion
    ? { duration: 0.12 }
    : { duration: 0.22, ease: APPLE_EASE_OUT_QUART }
  const viewTransition = reducedMotion
    ? { duration: 0.12 }
    : { duration: 0.32, ease: APPLE_EASE_OUT_EXPO }

  const baseContainerStyle: React.CSSProperties = {
    backgroundColor: 'rgb(var(--surface-card) / 0.72)',
    borderColor: 'rgb(var(--border) / 0.6)',
    boxShadow: 'var(--shadow-card)',
  }

  const normalTransform = reducedMotion ? undefined : `translate3d(${drag.x}px, ${drag.y}px, 0)`

  const normalContainerStyle: React.CSSProperties = {
    ...baseContainerStyle,
    transform: normalTransform,
    transition:
      dragRef.current || reducedMotion
        ? 'none'
        : 'transform 200ms var(--ease-out-quart), box-shadow 200ms',
  }

  const maximizedContainerStyle: React.CSSProperties = {
    ...baseContainerStyle,
    position: 'fixed',
    width: 'min(960px, calc(100vw - 32px))',
    height: 'min(720px, 80vh)',
    top: '96px',
    left: '50%',
    transform: reducedMotion ? 'translateX(-50%)' : 'translateX(-50%)',
    transition: reducedMotion ? 'none' : 'all 240ms var(--ease-out-quart)',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
  }

  if (windowState === 'closed') {
    return (
      <MagneticButton
        onClick={() => setWindowState('open')}
        pull={4}
        className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface-card))] px-4 py-2 font-mono text-xs text-[rgb(var(--text-secondary))] transition-colors duration-200 hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
      >
        <span className="h-2 w-2 rounded-full bg-[rgb(34,197,94)]" />
        {t('chat.reopen')}
      </MagneticButton>
    )
  }

  const isMaximized = windowState === 'maximized'
  const containerStyle = isMaximized ? maximizedContainerStyle : normalContainerStyle
  const containerClass = isMaximized
    ? 'w-full rounded-3xl border backdrop-blur-md overflow-hidden'
    : 'w-full rounded-3xl border backdrop-blur-md overflow-hidden transition-shadow duration-200'

  const containerA11y = isMaximized
    ? {
        role: 'dialog' as const,
        'aria-modal': true,
        'aria-label': "Duy's agent — maximized",
      }
    : {}

  return (
    <>
      <AnimatePresence>
        {isMaximized && (
          <motion.div
            key="terminal-backdrop"
            onClick={() => setWindowState('open')}
            className="fixed inset-0 bg-[rgba(0,0,0,0.55)] backdrop-blur-sm"
            style={{ zIndex: 49 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={viewTransition}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={mountTransition}
      >
        <div className={containerClass} style={containerStyle} {...containerA11y}>
          {/* Title bar — draggable */}
          <div
            onMouseDown={startDrag}
            onDoubleClick={resetPosition}
            className="flex cursor-grab select-none items-center gap-2 border-b px-4 py-2.5 active:cursor-grabbing"
            style={{
              backgroundColor: 'rgb(var(--surface-overlay) / 0.6)',
              borderColor: 'rgb(var(--border) / 0.5)',
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
              flexShrink: 0,
            }}
          >
            <motion.button
              onClick={(event) => {
                event.stopPropagation()
                setWindowState('closed')
              }}
              aria-label="Close"
              className="group relative h-6 w-6 shrink-0 rounded-full bg-[radial-gradient(circle,rgb(239,68,68)_6px,transparent_6px)]"
              whileHover={reducedMotion ? undefined : { scale: 1.08 }}
              whileTap={reducedMotion ? undefined : { scale: 0.94 }}
              transition={reducedMotion ? { duration: 0.12 } : { type: 'spring', ...SOFT_SPRING }}
            >
              <span className="invisible absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[rgba(0,0,0,0.6)] group-hover:visible">
                ×
              </span>
            </motion.button>
            <motion.button
              onClick={(event) => {
                event.stopPropagation()
                setWindowState('minimized')
              }}
              aria-label="Minimize"
              className="group relative h-6 w-6 shrink-0 rounded-full bg-[radial-gradient(circle,rgb(234,179,8)_6px,transparent_6px)]"
              whileHover={reducedMotion ? undefined : { scale: 1.08 }}
              whileTap={reducedMotion ? undefined : { scale: 0.94 }}
              transition={reducedMotion ? { duration: 0.12 } : { type: 'spring', ...SOFT_SPRING }}
            >
              <span className="invisible absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[rgba(0,0,0,0.6)] group-hover:visible">
                −
              </span>
            </motion.button>
            <motion.button
              onClick={handleGreenClick}
              onDoubleClick={handleGreenDblClick}
              aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
              title="Click to maximize/restore · Double-click to recenter"
              className="group relative h-6 w-6 shrink-0 rounded-full bg-[radial-gradient(circle,rgb(34,197,94)_6px,transparent_6px)]"
              whileHover={reducedMotion ? undefined : { scale: 1.08 }}
              whileTap={reducedMotion ? undefined : { scale: 0.94 }}
              transition={reducedMotion ? { duration: 0.12 } : { type: 'spring', ...SOFT_SPRING }}
            >
              <span className="invisible absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[rgba(0,0,0,0.6)] group-hover:visible">
                ⤢
              </span>
            </motion.button>
            <span className="ml-1 min-w-0 truncate text-xs font-mono text-[rgb(var(--text-muted))]">
              {t('brand.shellPrompt')}
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-[rgb(var(--text-muted))]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${busy ? 'bg-[rgb(234,179,8)] animate-pulse' : 'bg-[rgb(34,197,94)]'}`}
              />
              {busy ? t('chat.statusBusy') : t('chat.statusIdle')}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {(windowState === 'open' || windowState === 'maximized') && view === 'chat' && (
              <motion.div
                key="chat-view"
                className={isMaximized ? 'flex flex-1 flex-col' : 'flex flex-col'}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={viewTransition}
              >
                <div
                  className={`flex flex-col gap-3 overflow-y-auto px-4 py-4 font-mono text-sm ${isMaximized ? 'flex-1' : 'min-h-[340px] max-h-[520px]'}`}
                >
                  <AnimatePresence initial={!reducedMotion}>
                    {messages.map((msg, i) => {
                      const isStatus = msg.text.startsWith('STATUS:')
                      const isAgentReply =
                        !msg.isUser &&
                        !isStatus &&
                        !msg.streaming &&
                        msg.text.trim().length > 0 &&
                        i > 1

                      return (
                        <motion.div
                          key={`${msg.time}-${i}-${msg.isUser ? 'user' : 'agent'}`}
                          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          transition={microTransition}
                        >
                          {msg.isUser ? (
                            <p className="whitespace-pre-wrap text-[rgb(var(--text-secondary))]">
                              <span className="text-[rgb(var(--accent))]">&gt; </span>
                              {msg.text}
                            </p>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed text-[rgb(var(--text-primary))]">
                              <span className="mr-2 text-[rgb(var(--text-muted))]">
                                [{msg.time}]
                              </span>
                              {isStatus ? (
                                <>
                                  <span className="font-semibold text-[rgb(var(--accent))]">
                                    STATUS:
                                  </span>
                                  {msg.text.replace('STATUS:', '')}
                                </>
                              ) : (
                                <>
                                  {msg.text}
                                  {msg.streaming && (
                                    <span className="ml-1 inline-block h-3 w-1.5 animate-pulse align-middle bg-[rgb(var(--accent))]" />
                                  )}
                                </>
                              )}
                            </p>
                          )}
                          {isAgentReply && (
                            <div className="mt-1.5 ml-[5.5rem] flex items-center gap-2 text-[10px] font-mono text-[rgb(var(--text-muted))]">
                              <span aria-hidden>↗</span>
                              <MagneticButton
                                onClick={openCompose}
                                pull={4}
                                className="rounded-full border border-[rgb(var(--accent)/0.3)] px-2 py-0.5 text-[rgb(var(--accent))] transition-all duration-200 ease-[var(--ease-out-quart)] hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--accent)/0.1)]"
                              >
                                {t('compose.button')}
                              </MagneticButton>
                              <span className="opacity-70">
                                — relay this thread to Duy&apos;s inbox
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <motion.div
                  className="flex items-center gap-2 border-t px-4 py-3"
                  style={{
                    borderColor: 'rgb(var(--border) / 0.5)',
                    flexShrink: 0,
                  }}
                  animate={
                    inputFocused && !reducedMotion
                      ? { boxShadow: '0 -14px 28px rgba(102,252,241,0.08)' }
                      : { boxShadow: '0 0 0 rgba(102,252,241,0)' }
                  }
                  transition={microTransition}
                >
                  <motion.span
                    className="font-mono text-sm text-[rgb(var(--accent))]"
                    animate={
                      inputFocused && !reducedMotion
                        ? {
                            opacity: [1, 0.35, 1],
                            textShadow: [
                              '0 0 0 rgba(102,252,241,0)',
                              '0 0 12px rgba(102,252,241,0.45)',
                              '0 0 0 rgba(102,252,241,0)',
                            ],
                          }
                        : {
                            opacity: 1,
                            textShadow: '0 0 0 rgba(102,252,241,0)',
                          }
                    }
                    transition={
                      inputFocused && !reducedMotion
                        ? {
                            duration: 1.1,
                            ease: 'easeInOut',
                            repeat: Number.POSITIVE_INFINITY,
                          }
                        : microTransition
                    }
                  >
                    &gt;
                  </motion.span>
                  <input
                    type="text"
                    id="terminal-chat-input"
                    name="message"
                    aria-label={t('chat.placeholder')}
                    ref={terminalInputRef}
                    maxLength={2000}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={(event) => event.key === 'Enter' && sendMessage(input)}
                    placeholder={busy ? t('chat.placeholderBusy') : t('chat.placeholder')}
                    disabled={busy}
                    className="flex-1 bg-transparent font-mono text-sm text-[rgb(var(--text-primary))] outline-none caret-[rgb(var(--accent))] placeholder-[rgb(var(--text-muted))] disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => sendMessage(input)}
                    disabled={busy || !input.trim()}
                    aria-label="Send chat"
                    title="Send chat (Enter)"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-[rgb(var(--surface-page))] transition-all duration-200 ease-[var(--ease-out-quart)] hover:brightness-110 active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </motion.div>

                {/* Email-Duy row — visually distinct from chat (amber, envelope icon) */}
                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5"
                  style={{
                    borderColor: 'rgb(var(--border) / 0.4)',
                    backgroundColor: 'rgb(var(--surface-overlay) / 0.45)',
                    flexShrink: 0,
                  }}
                >
                  <span className="flex items-center gap-2 font-mono text-[10px] tracking-wide text-[rgb(var(--text-muted))]">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Want Duy himself? Send him an email →
                  </span>
                  <MagneticButton
                    onClick={openCompose}
                    disabled={busy}
                    pull={5}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-mono transition-all duration-200 ease-[var(--ease-out-quart)] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      borderColor: 'rgb(var(--accent-warm) / 0.55)',
                      color: 'rgb(var(--accent-warm))',
                      backgroundColor: 'rgb(var(--accent-warm) / 0.06)',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {t('compose.button')}
                  </MagneticButton>
                </div>
              </motion.div>
            )}

            {(windowState === 'open' || windowState === 'maximized') && view === 'compose' && (
              <motion.div
                key="compose-view"
                className={`flex flex-col gap-4 overflow-y-auto px-4 py-4 ${isMaximized ? 'flex-1' : 'min-h-[340px]'}`}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={viewTransition}
              >
                <p className="font-mono text-xs text-[rgb(var(--text-muted))]">
                  {t('compose.title')}
                </p>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[11px] text-[rgb(var(--text-muted))]">
                    {t('compose.subjectLabel')}
                  </label>
                  <input
                    type="text"
                    maxLength={160}
                    value={compose.subject}
                    onChange={(event) =>
                      setCompose((prev) => ({
                        ...prev,
                        subject: event.target.value,
                      }))
                    }
                    className="rounded-lg border px-3 py-2 font-mono text-sm text-[rgb(var(--text-primary))] outline-none transition-all duration-200 focus:ring-2"
                    style={{
                      backgroundColor: 'rgb(var(--surface-overlay))',
                      borderColor: 'rgb(var(--border))',
                      // @ts-expect-error CSS custom property
                      '--tw-ring-color': 'rgb(var(--accent) / 0.4)',
                    }}
                  />
                </div>

                <div className="relative flex flex-col gap-1">
                  <label className="font-mono text-[11px] text-[rgb(var(--text-muted))]">
                    {t('compose.bodyLabel')}
                  </label>
                  <textarea
                    rows={8}
                    maxLength={8000}
                    value={compose.body}
                    onChange={(event) =>
                      setCompose((prev) => ({
                        ...prev,
                        body: event.target.value,
                      }))
                    }
                    placeholder={t('compose.bodyPlaceholder')}
                    className="resize-y rounded-lg border px-3 py-2 font-mono text-sm text-[rgb(var(--text-primary))] outline-none transition-all duration-200 focus:ring-2"
                    style={{
                      backgroundColor: 'rgb(var(--surface-overlay))',
                      borderColor: 'rgb(var(--border))',
                      // @ts-expect-error CSS custom property
                      '--tw-ring-color': 'rgb(var(--accent) / 0.4)',
                    }}
                  />
                  <AnimatePresence>
                    {compose.composing && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-[rgba(0,0,0,0.35)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={microTransition}
                      >
                        <span className="animate-pulse font-mono text-xs text-[rgb(var(--text-muted))]">
                          drafting...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[11px] text-[rgb(var(--text-muted))]">
                    {t('compose.fromLabel')}
                  </label>
                  <input
                    type="email"
                    maxLength={254}
                    value={compose.email}
                    onChange={(event) =>
                      setCompose((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder={t('compose.fromPlaceholder')}
                    required
                    className="rounded-lg border px-3 py-2 font-mono text-sm text-[rgb(var(--text-primary))] outline-none transition-all duration-200 focus:ring-2"
                    style={{
                      backgroundColor: 'rgb(var(--surface-overlay))',
                      borderColor: 'rgb(var(--border))',
                      // @ts-expect-error CSS custom property
                      '--tw-ring-color': 'rgb(var(--accent) / 0.4)',
                    }}
                  />
                </div>

                {compose.error && (
                  <p className="font-mono text-xs text-[rgb(var(--text-secondary))]">
                    {t('compose.fallback').split('?')[0]}{' '}
                    <motion.a
                      href={compose.error}
                      className="text-[rgb(var(--accent))] underline transition-colors duration-200 hover:text-[rgb(var(--accent-hover))]"
                      whileHover={reducedMotion ? undefined : { y: -1 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                      transition={microTransition}
                    >
                      {t('compose.fallback').split('?')[1] ?? 'Open in your email app instead?'}
                    </motion.a>
                  </p>
                )}

                <p className="font-mono text-[10px] leading-relaxed text-[rgb(var(--text-muted))]">
                  {t('compose.confirmNote')}
                </p>

                {/* Refine instruction (optional) — guides the next LLM polish pass */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[rgb(var(--text-muted))]">
                    {t('compose.refineInstructionLabel')}
                  </label>
                  <input
                    type="text"
                    value={compose.refineInstruction}
                    onChange={(event) =>
                      setCompose((prev) => ({
                        ...prev,
                        refineInstruction: event.target.value,
                      }))
                    }
                    placeholder={t('compose.refineInstructionPlaceholder')}
                    className="rounded-lg border px-3 py-2 font-mono text-xs text-[rgb(var(--text-primary))] outline-none transition-all duration-200 focus:ring-2"
                    style={{
                      backgroundColor: 'rgb(var(--surface-overlay))',
                      borderColor: 'rgb(var(--border))',
                      // @ts-expect-error CSS custom property
                      '--tw-ring-color': 'rgb(var(--accent) / 0.4)',
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2" style={{ flexShrink: 0 }}>
                  <MagneticButton
                    onClick={refineCompose}
                    disabled={compose.composing || compose.sending}
                    pull={4}
                    className="rounded-full border border-[rgb(var(--accent)/0.5)] px-4 py-1.5 text-[11px] font-mono text-[rgb(var(--accent))] transition-all duration-200 ease-[var(--ease-out-quart)] hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--accent)/0.08)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t('compose.refine')}
                  </MagneticButton>
                  <MagneticButton
                    onClick={sendContact}
                    disabled={!compose.email.trim() || compose.composing || compose.sending}
                    pull={5}
                    className="rounded-full bg-[rgb(var(--accent))] px-4 py-1.5 text-[11px] font-mono text-[rgb(var(--surface-card))] transition-all duration-200 ease-[var(--ease-out-quart)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {compose.sending ? 'Sending...' : t('compose.send')}
                  </MagneticButton>
                  <MagneticButton
                    onClick={() => {
                      setView('chat')
                      setCompose((prev) => ({ ...prev, error: null }))
                    }}
                    disabled={compose.sending}
                    pull={4}
                    className="rounded-full border border-[rgb(var(--border))] px-4 py-1.5 text-[11px] font-mono text-[rgb(var(--text-secondary))] transition-all duration-200 ease-[var(--ease-out-quart)] hover:border-[rgb(var(--accent)/0.5)] hover:text-[rgb(var(--accent))] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t('compose.cancel')}
                  </MagneticButton>
                </div>
              </motion.div>
            )}

            {(windowState === 'open' || windowState === 'maximized') && view === 'sent' && (
              <motion.div
                key="sent-view"
                className={`flex flex-col items-start justify-center gap-4 px-4 py-6 ${isMaximized ? 'flex-1' : 'min-h-[340px]'}`}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={viewTransition}
              >
                <p className="font-mono text-sm text-[rgb(var(--text-primary))]">
                  {t('compose.sentTitle')}
                </p>
                <MagneticButton
                  onClick={() => {
                    setView('chat')
                  }}
                  pull={4}
                  className="rounded-full border border-[rgb(var(--accent)/0.5)] px-4 py-1.5 text-[11px] font-mono text-[rgb(var(--accent))] transition-all duration-200 ease-[var(--ease-out-quart)] hover:border-[rgb(var(--accent))] hover:bg-[rgb(var(--accent)/0.08)]"
                >
                  {t('compose.sentBack')}
                </MagneticButton>
              </motion.div>
            )}

            {windowState === 'minimized' && (
              <motion.div
                key="minimized-view"
                className="px-4 py-2 font-mono text-[10px] text-[rgb(var(--text-muted))]"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={microTransition}
              >
                {t('chat.minimizedHint')}
                <MagneticButton
                  onClick={() => setWindowState('open')}
                  pull={3}
                  className="ml-2 underline transition-colors duration-200 text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]"
                >
                  {t('chat.restore')}
                </MagneticButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
