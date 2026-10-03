'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'

const HINT_SEEN_KEY = 'pf_hint_seen_v2'
const ADMIN_FLAG_KEY = 'pf_admin_self'

const HINTS: Hint[] = [
  { id:'plain', tag:'PSST', flavor:'sys', lines:["There's a hidden door here.", 'Outside text fields, type the name twice:', '> leduy leduy', 'Owner login still needs a passphrase.'] },
  { id:'plain-vi', tag:'BÍ MẬT', flavor:'whisper', lines:['Trang này có một cánh cửa ẩn.', 'Ở ngoài ô nhập, gõ tên hai lần:', '> leduy leduy', 'Đăng nhập chủ trang vẫn cần mật khẩu.'] },
]

interface Hint {
  id: string
  tag: string
  flavor: 'sys' | 'whisper' | 'glitch'
  lines: string[]
}

function pickHint(vi: boolean): Hint { return HINTS[vi ? 1 : 0] }

function isAdminFlagSet(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(ADMIN_FLAG_KEY) === '1'
  } catch {
    return false
  }
}

function deriveTyped(lines: string[], totalChars: number): { typed: number[]; current: number } {
  let remaining = totalChars
  const typed = lines.map(() => 0)
  let current = -1
  for (let i = 0; i < lines.length; i++) {
    const len = lines[i].length
    if (remaining >= len) {
      typed[i] = len
      remaining -= len
    } else {
      typed[i] = Math.max(0, remaining)
      if (current === -1) current = i
      remaining = 0
    }
  }
  if (current === -1) current = lines.length
  return { typed, current }
}

export function SecretHint() {
  const pathname = usePathname()
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState<Hint | null>(null)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<number | null>(null)
  const tickRef = useRef<number | null>(null)
  const armed = useRef(false)

  const onAdminPage = useMemo(() => pathname?.startsWith('/admin') ?? false, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (armed.current) return
    if (onAdminPage) return
    if (isAdminFlagSet()) return

    let seenStr: string | null = null
    try {
      seenStr = window.localStorage.getItem(HINT_SEEN_KEY)
    } catch {
      /* ignore */
    }
    const seenAt = seenStr ? Number.parseInt(seenStr, 10) : 0
    const cooldown = 1000 * 60 * 60 * 24 * 3
    if (Number.isFinite(seenAt) && Date.now() - seenAt < cooldown) return

    armed.current = true
    let elapsed = 0
    timerRef.current = window.setInterval(() => {
      if (document.hidden || document.querySelector('#gracie-chat,[data-maximized="true"],dialog[open]')) return
      elapsed += 1000
      if (elapsed < 30000) return
      setHint(pickHint(locale === 'vi'))
      setProgress(0)
      setOpen(true)
      try { localStorage.setItem(HINT_SEEN_KEY,String(Date.now())) } catch {}
      if (timerRef.current) window.clearInterval(timerRef.current)
    },1000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      armed.current = false
    }
  }, [onAdminPage, locale])

  useEffect(() => {
    if (!open || !hint) return
    const totalLen = hint.lines.reduce((a, l) => a + l.length, 0)
    tickRef.current = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 2
        if (next >= totalLen && tickRef.current) {
          window.clearInterval(tickRef.current)
          tickRef.current = null
        }
        return next
      })
    }, 24)
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
    }
  }, [open, hint])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      setOpen(false)
    }, 14_000)
    return () => window.clearTimeout(id)
  }, [open])

  const dismiss = useCallback((persist: boolean) => {
    setOpen(false)
    if (persist) {
      try {
        window.localStorage.setItem(HINT_SEEN_KEY, String(Date.now()))
      } catch {
        /* ignore */
      }
    }
  }, [])

  if (!hint || onAdminPage) return null

  const { typed, current: currentLine } = deriveTyped(hint.lines, progress)

  const accent =
    hint.flavor === 'glitch'
      ? 'rgb(var(--terminal-red))'
      : hint.flavor === 'whisper'
        ? 'rgb(var(--accent-warm))'
        : 'rgb(var(--accent))'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: -16, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -12, y: 8, transition: { duration: 0.2 } }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 left-5 z-[55] pointer-events-auto w-[min(360px,calc(100vw-2.5rem))] font-mono"
          aria-live="polite"
          role="status"
          aria-label={locale === 'vi' ? 'Gợi ý tính năng ẩn' : 'Hidden feature hint'}
        >
          <div
            className="rounded-md border backdrop-blur-md p-3 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.55)]"
            style={{
              borderColor: 'rgb(var(--border) / 0.85)',
              backgroundColor: 'rgb(var(--surface-card) / 0.92)',
              color: 'rgb(var(--text-primary))',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[10px] tracking-[0.22em] uppercase font-semibold"
                style={{ color: accent }}
              >
                ▶ {hint.tag}
              </span>
              <button
                type="button"
                onClick={() => dismiss(true)}
                className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] text-sm leading-none"
                aria-label={locale === 'vi' ? 'Ẩn gợi ý bí mật' : 'Dismiss hidden feature hint'}
              >
                ×
              </button>
            </div>
            <div className="space-y-1 text-[12px] leading-relaxed">
              {hint.lines.map((line, i) => {
                const visible = typed[i] ?? 0
                const isCurrent = i === currentLine
                return (
                  <p key={i} className="whitespace-pre-wrap">
                    <span
                      className={hint.flavor === 'glitch' ? 'text-[rgb(var(--terminal-red))]' : undefined}
                    >
                      {line.slice(0, visible)}
                    </span>
                    {isCurrent && visible < line.length && (
                      <span
                        className="inline-block w-[7px] h-[12px] -mb-[1px] ml-[1px] animate-pulse"
                        style={{ backgroundColor: accent, verticalAlign: 'middle' }}
                      />
                    )}
                  </p>
                )
              })}
            </div>
            <div className="mt-3 pt-2 flex items-center justify-between border-t" style={{ borderColor: 'rgb(var(--border-muted) / 0.6)' }}>
              <span className="text-[10px] text-[rgb(var(--text-muted))]">{'// signal will fade…'}</span>
              <button
                type="button"
                onClick={() => dismiss(true)}
                className="text-[10px] tracking-wide uppercase hover:opacity-100 opacity-70 transition-opacity"
                style={{ color: accent }}
              >
                {locale === 'vi' ? 'Đã hiểu' : 'Got it'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
