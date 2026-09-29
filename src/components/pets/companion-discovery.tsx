'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const KEY = 'duy:companion-hint:last-shown:v1'
const WEEK = 7 * 24 * 60 * 60 * 1000
let shownThisVisit = false

/** A quiet invitation; the preview guide only starts after an explicit click. */
export function CompanionDiscovery({ enabled, vi, current }: {
  enabled: boolean; vi: boolean; current: string
}) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!enabled || shownThisVisit) return
    try {
      if (Date.now() - Number(localStorage.getItem(KEY) || 0) < WEEK) return
    } catch {}
    let elapsed = 0
    const timer = window.setInterval(() => {
      if (document.hidden) return
      elapsed += 1000
      if (elapsed < 90000) return
      shownThisVisit = true
      try { localStorage.setItem(KEY, String(Date.now())) } catch {}
      setShown(true)
      clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [enabled])
  if (!enabled || !shown) return null
  const next = current === 'inko' ? 'bunny' : 'inko'
  return <aside className="companion-discovery" aria-label={vi ? 'Gợi ý Pets' : 'Pets suggestion'}>
    <Link href={`/pets#companion=${next}`} onClick={() => setShown(false)}>
      <span aria-hidden="true">✧</span>
      {vi ? 'Thử một pet khác?' : 'Meet another pet?'} <span aria-hidden="true">↗</span>
    </Link>
    <button type="button" onClick={() => setShown(false)} aria-label={vi ? 'Ẩn gợi ý' : 'Dismiss suggestion'}>×</button>
  </aside>
}
