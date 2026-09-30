'use client'
import { useEffect, useRef, useState } from 'react'
import type { Species } from '@/data/pets/catalog'
import { petAppearance } from '@/lib/pets/appearance'
import { AtlasPet, type PetLane } from './atlas-pet'
import { MotionPet, motionCatalog } from './motion-pet'

const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
/** Bounded little trips, real directional poses, and long quiet intervals. */
export function LivingPet({ species, stage, enabled = true }: { species: Species; stage: number; enabled?: boolean }) {
  const root = useRef<HTMLSpanElement>(null)
  const location = useRef({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [clip, setClip] = useState('')
  const [turning, setTurning] = useState(false)
  const [lane, setLane] = useState<PetLane>('idle')
  const appearance = petAppearance(species, stage)
  useEffect(() => {
    const node = root.current
    if (!node || !enabled) return
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const clips = motionCatalog[appearance.pet]
    let visible = false, timer = 0, heading = 4
    function stop() { clearTimeout(timer); setClip(''); setTurning(false); setLane('idle') }
    function later(action: () => void, ms: number) { timer = window.setTimeout(action, ms) }
    function turn(target: number, done: () => void) {
      const delta = (target - heading + 8) % 8
      if (!delta || !clips) { heading = target; done(); return }
      heading = (heading + (delta <= 4 ? 1 : -1) + 8) % 8
      const next = `walk-${directions[heading]}`
      if (clips[next]) { setClip(next); setTurning(true) }
      later(() => turn(target, done), 90)
    }
    function schedule() {
      stop()
      if (!visible || document.hidden || media.matches) return
      later(() => {
        const quiet = Math.random() < .35 ? (Math.random() < .3 ? 'sleep' : 'rest') : ''
        if (quiet && clips?.[quiet]) { setClip(quiet); later(schedule, quiet === 'sleep' ? 10000 : 5500); return }
        const next = { x: Math.round(Math.random() * 36 - 18), y: clips ? Math.round(Math.random() * 20 - 10) : 0 }
        const dx = next.x - location.current.x, dy = next.y - location.current.y
        if (Math.hypot(dx, dy) < 8) { schedule(); return }
        const direction = (Math.round(Math.atan2(dx, -dy) / (Math.PI / 4)) + 8) % 8
        const walk = `walk-${directions[direction]}`
        const beginWalk = () => turn(direction, () => {
          setTurning(false)
          setClip(clips?.[walk] ? walk : '')
          setLane(dx >= 0 ? 'running-right' : 'running-left')
          location.current = next
          setPosition(next)
          later(() => {
            setLane('idle')
            turn(4, () => {
              setTurning(false)
              if (clips?.['stop-s']) { setClip('stop-s'); later(schedule, 400) }
              else schedule()
            })
          }, 1920)
        })
        if (clips?.['start-s']) { setClip('start-s'); later(beginWalk, 400) }
        else beginWalk()
      }, 14000 + Math.random() * 16000)
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule() })
    observer.observe(node)
    document.addEventListener('visibilitychange', schedule)
    media.addEventListener('change', schedule)
    return () => { stop(); observer.disconnect(); document.removeEventListener('visibilitychange', schedule); media.removeEventListener('change', schedule) }
  }, [enabled, species, appearance.pet])
  return <span ref={root} className="living-pet" style={{ transform: `translate(${position.x}px,${position.y}px)` }}>
    {clip ? <MotionPet pet={appearance.pet} clip={clip} still={turning} /> : <AtlasPet {...appearance} follow={lane === 'idle'} lane={lane} />}
  </span>
}
