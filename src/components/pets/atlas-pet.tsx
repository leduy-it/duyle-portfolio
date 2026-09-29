'use client'
import { useEffect, useRef } from 'react'
import './atlas-pet.css'

export const LANES = [
  'idle',
  'running-right',
  'running-left',
  'waving',
  'jumping',
  'failed',
  'waiting',
  'running',
  'review',
] as const
export type PetLane = (typeof LANES)[number]
const durations = [
  [280, 110, 110, 140, 140, 320],
  [120, 120, 120, 120, 120, 120, 120, 220],
  [120, 120, 120, 120, 120, 120, 120, 220],
  [140, 140, 140, 280],
  [140, 140, 140, 140, 280],
  [140, 140, 140, 140, 140, 140, 140, 240],
  [150, 150, 150, 150, 150, 260],
  [120, 120, 120, 120, 120, 220],
  [150, 150, 150, 150, 150, 280],
]
export function AtlasPet({
  pet = 'bunny',
  file = 'spritesheet.webp',
  lane = 'idle',
  className = '',
  reducedMotion = false,
  follow = false,
}: {
  pet?: string
  file?: string
  lane?: PetLane
  className?: string
  reducedMotion?: boolean
  follow?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = Math.floor(Math.random() * 6),
      timer = 0,
      hover = false,
      direction: number | null = null,
      lookUntil = 0,
      visible = false
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const paint = (row: number, col: number) => {
      el.style.backgroundPosition = `${(col / 7) * 100}% ${(row / 10) * 100}%`
      el.dataset.frame = `${row}:${col}`
    }
    const tick = () => {
      const still = reducedMotion || media.matches
      let row = LANES.indexOf(lane)
      if (!still && hover && lane === 'idle' && frame < durations[3].length) row = 3
      if (
        !still &&
        follow &&
        !hover &&
        lane === 'idle' &&
        direction !== null &&
        Date.now() < lookUntil
      ) {
        paint(9 + Math.floor(direction / 8), direction % 8)
      } else paint(row, still ? 0 : frame % durations[row].length)
      const delay = durations[row][frame % durations[row].length]
      frame++
      if (visible && !document.hidden) timer = window.setTimeout(tick, delay)
    }
    const restart = () => {
      clearTimeout(timer)
      frame = 0
      if (visible && !document.hidden) tick()
    }
    const enter = () => {
      hover = true
      restart()
    }
    const leave = () => {
      hover = false
      restart()
    }
    const pointer = (e: PointerEvent) => {
      if (!follow || e.pointerType === 'touch') return
      const r = el.getBoundingClientRect(),
        dx = e.clientX - r.x - r.width / 2,
        dy = e.clientY - r.y - r.height / 2
      direction =
        Math.round(((Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 8)) % 16
      lookUntil = Date.now() + 650
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) el.style.backgroundImage = `url('/pets/hatch-pet-plus/${pet}/${file}')`
      restart()
    })
    observer.observe(el)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    if (follow) window.addEventListener('pointermove', pointer, { passive: true })
    document.addEventListener('visibilitychange', restart)
    media.addEventListener('change', restart)
    tick()
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointermove', pointer)
      document.removeEventListener('visibilitychange', restart)
      media.removeEventListener('change', restart)
    }
  }, [lane, follow, reducedMotion, pet, file])
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`atlas-pet ${className}`}
      data-pet={pet}
      data-lane={lane}
    />
  )
}
