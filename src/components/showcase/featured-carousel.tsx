'use client'

import { entrancePose,settledPose,nextMotionSeed,motionPattern } from '@/components/motion/entrance-patterns'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useLocale } from '@/lib/i18n'
import dynamic from 'next/dynamic'

const ThreeCover = dynamic(() => import('./three-cover'), { ssr: false })

import type { CoverCopy } from '@/data/showcase-covers'

export const FEATURED_INTERVAL_MS = 30_000

/** One clock for both showcases. Only visible, unattended foreground time counts. */
export function FeaturedCarousel({ items, label, cinema = false }: {
  items: CoverCopy[]; label: string; cinema?: boolean
}) {
  const { locale } = useLocale()
  const vi = locale === 'vi'
  const root = useRef<HTMLElement>(null)
  const visible = useInView(root, { amount: 0.2 })
  const reduced = useReducedMotion()
  const [transitionSeed,setTransitionSeed]=useState(0)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [foreground, setForeground] = useState(true)
  const remaining = useRef(FEATURED_INTERVAL_MS)
  const currentIndex = items.length ? index % items.length : 0
  const item = items[currentIndex]
  const running = reduced === false && visible && foreground && !paused && !hovered && !focused && items.length > 1

  useEffect(() => {
    const changed = () => setForeground(!document.hidden)
    changed()
    document.addEventListener('visibilitychange', changed)
    return () => document.removeEventListener('visibilitychange', changed)
  }, [])

  useEffect(() => {
    if (!running) return
    const started = Date.now()
    let advanced = false
    const timer = window.setTimeout(() => {
      advanced = true
      remaining.current = FEATURED_INTERVAL_MS
      setTransitionSeed(previous=>nextMotionSeed(previous))
      setIndex(current => (current + 1) % items.length)
    }, remaining.current)
    return () => {
      window.clearTimeout(timer)
      if (!advanced) remaining.current = Math.max(1, remaining.current - (Date.now() - started))
    }
  }, [running, index, items.length])

  function select(next: number) {
    setTransitionSeed(previous=>nextMotionSeed(previous))
    remaining.current = FEATURED_INTERVAL_MS
    setIndex((next + items.length) % items.length)
    // A manual selection deserves a full reading interval; don't fight the reader.
    setPaused(true)
  }

  if (!item) return null
  const pose=entrancePose(transitionSeed,currentIndex)
  const mode=currentIndex%3
  const ambience=cinema ? ['radial-gradient(ellipse at 25% 52%,rgb(var(--accent-warm) / .13),transparent 58%)','radial-gradient(ellipse at 23% 36%,rgb(var(--accent) / .1),transparent 60%),radial-gradient(ellipse at 44% 86%,rgb(var(--accent-warm) / .11),transparent 50%)','radial-gradient(ellipse at 18% 70%,rgb(var(--accent-warm) / .14),transparent 56%)'][mode] : ['radial-gradient(ellipse at 24% 52%,rgb(var(--accent) / .12),transparent 60%)','radial-gradient(ellipse at 24% 55%,rgba(81,141,211,.13),transparent 62%)','radial-gradient(ellipse at 26% 50%,rgba(149,113,196,.13),transparent 60%)'][mode]
  const controlClass = 'grid h-10 w-10 place-items-center rounded-full border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] transition-colors hover:bg-[rgb(var(--surface-overlay))] focus-visible:outline-2 focus-visible:outline-[rgb(var(--accent))]'
  return <section ref={root} aria-roledescription="carousel" aria-label={label} data-featured-carousel data-transition-pattern={motionPattern(transitionSeed)}
    className="relative border-b border-[rgb(var(--border))] bg-[rgb(var(--surface-page))]"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    <AnimatePresence initial={false}><motion.div key={mode} aria-hidden="true" className="pointer-events-none absolute inset-0" style={{backgroundImage:ambience}} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1.2}} /></AnimatePresence>
    <div className="relative mx-auto grid max-w-[1440px] items-center gap-4 px-4 py-8 sm:px-8 lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:px-12 lg:py-14">
      <div className="pointer-events-none relative h-[340px] w-full sm:h-[400px] lg:h-[440px]" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div key={currentIndex} className="absolute inset-0" initial={reduced ? false : {...pose,x:pose.x*1.2,rotate:0}} animate={settledPose} exit={{opacity:0,x:-pose.x*.45,scale:.985}} transition={{duration: reduced ? 0 : .8, ease: [.22, 1, .36, 1]}}>
            <ThreeCover cinema={cinema} variant={currentIndex} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div aria-live={paused || reduced ? 'polite' : 'off'} aria-atomic="true" data-featured-slide={`${cinema ? 'cinema' : 'research'}-${currentIndex}`} className="pb-7 lg:py-5">
        <motion.div key={currentIndex} initial={reduced ? false : {...pose,x:-pose.x*.65,rotate:0}} animate={settledPose} transition={{ duration: .7, ease: [.22, 1, .36, 1] }} className="min-h-[360px] sm:min-h-[340px] lg:min-h-[320px]">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[.24em] text-[rgb(var(--accent))]">{item.eyebrow}</p>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-[-.035em] text-[rgb(var(--text-primary))] sm:text-5xl lg:text-[3.25rem]">{item.title}</h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[rgb(var(--text-secondary))] sm:text-base">{item.body}</p>
        </motion.div>
        <div className="mt-7 flex items-center gap-3" aria-label={vi ? 'Điều khiển slide' : 'Slide controls'}>
          <button type="button" className={controlClass} aria-label={vi ? 'Slide trước' : 'Previous slide'} onClick={() => select(index - 1)}>←</button>
          <span className="min-w-14 text-center font-mono text-[11px] tabular-nums text-[rgb(var(--text-muted))]">{currentIndex + 1} / {items.length}</span>
          <button type="button" className={controlClass} aria-label={vi ? 'Slide tiếp' : 'Next slide'} onClick={() => select(index + 1)}>→</button>
          {!reduced && <button type="button" className={`${controlClass} ml-2`} aria-label={paused ? (vi ? 'Tiếp tục tự chuyển' : 'Resume slideshow') : (vi ? 'Dừng tự chuyển' : 'Pause slideshow')} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '▷' : 'Ⅱ'}</button>}
        </div>
        <p className="mt-3 text-[11px] text-[rgb(var(--text-muted))]">{reduced ? (vi ? 'Chọn từng bìa để khám phá.' : 'Explore each cover at your own pace.') : paused ? (vi ? 'Đã dừng · tiếp tục khi bạn sẵn sàng.' : 'Paused · resume when you’re ready.') : (vi ? 'Mỗi 30 giây · dừng khi tương tác.' : 'Every 30 seconds · pauses while you interact.')}</p>
      </div>
    </div>
  </section>
}
