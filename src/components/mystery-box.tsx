'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { setAdminSelfFlag } from './visitor-tracker'

const TRIGGER = 'leduy'
const BUFFER_LEN = 8

function isTypingTarget(t: EventTarget | null): boolean {
  if (!t || !(t instanceof HTMLElement)) return false
  const tag = t.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (t.isContentEditable) return true
  return false
}

export function MysteryBox() {
  const [open, setOpen] = useState(false)
  const [pass, setPass] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(0)
  const router = useRouter()
  const bufferRef = useRef('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      if (!e.key || e.key.length !== 1) return
      const next = (bufferRef.current + e.key.toLowerCase()).slice(-BUFFER_LEN)
      bufferRef.current = next
      if (next.endsWith(TRIGGER)) {
        bufferRef.current = ''
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60)
      return () => window.clearTimeout(id)
    }
    setPass('')
    setError(null)
  }, [open])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ passphrase: pass }),
      })
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (res.ok && json?.ok) {
        setAdminSelfFlag(true)
        setOpen(false)
        router.push('/admin')
        router.refresh()
        return
      }
      const errors: Record<string, string> = {
        admin_unconfigured: 'Owner access has not been configured for this environment.',
        storage_unconfigured: 'Owner access is waiting for the database connection. Please finish the Upstash setup.',
        temporarily_unavailable: 'The login service is temporarily unavailable. Please try again shortly.',
        too_many_attempts: 'Too many attempts. Try again in 15 minutes.',
        wrong_passphrase: 'That passphrase did not match. Try again.',
        invalid_origin: 'Please reload this page and try again.',
      }
      setError(errors[json?.error || ''] || 'Unable to sign in. Please try again.')
      setShake((s) => s + 1)
    } catch {
      setError('network error')
      setShake((s) => s + 1)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[60] pointer-events-none"
          aria-live="polite"
        >
          <motion.div
            key={shake}
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
              x: shake > 0 ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
            }}
            exit={{ y: 16, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto fixed bottom-5 right-5 w-[min(360px,calc(100vw-2.5rem))] rounded-xl border backdrop-blur-md p-4 font-mono text-sm shadow-[0_16px_48px_-12px_rgba(0,0,0,0.55)]"
            style={{
              backgroundColor: 'rgb(var(--surface-card) / 0.92)',
              borderColor: 'rgb(var(--border) / 0.8)',
              color: 'rgb(var(--text-primary))',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[rgb(var(--accent))] font-semibold tracking-tight">🎁 Mystery Box</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="close"
                className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <input
                ref={inputRef}
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="say the magic word…"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-[rgb(var(--accent))] transition-colors"
                style={{ borderColor: 'rgb(var(--border-muted))' }}
              />
              {error && (
                <p className="text-xs text-[rgb(var(--terminal-red))]">{error}</p>
              )}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] text-[rgb(var(--text-muted))] tracking-wide">
                  Private analytics · owner access
                </p>
                <button
                  type="submit"
                  disabled={submitting || pass.length === 0}
                  className="rounded-md px-3 py-1.5 text-xs font-medium tracking-tight border transition-colors disabled:opacity-40"
                  style={{
                    borderColor: 'rgb(var(--accent))',
                    color: 'rgb(var(--accent))',
                  }}
                >
                  {submitting ? 'opening…' : 'open'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
