'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import catalog from '@/data/pets/motion-catalog.json'
import { AtlasPet } from './atlas-pet'

export const motionCatalog: Record<string, Record<string, { file: string; frames: number; frameMs: number; direction: string; loop: boolean }>> = catalog
export function MotionPet({ pet, clip, still = false }: { pet: string; clip: string; still?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motion = motionCatalog[pet]?.[clip]
  useEffect(() => {
    const node = ref.current
    if (!node) return
    let visible = false
    function sync() { node!.style.animationPlayState = visible && !document.hidden ? 'running' : 'paused' }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    observer.observe(node)
    document.addEventListener('visibilitychange', sync)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [pet, clip])
  if (!motion) return <AtlasPet pet={pet} />
  return <span ref={ref} aria-hidden="true" className="atlas-pet motion-pet" data-pet={pet} style={{
    backgroundImage: `url('/pets/hatch-pet-plus/${pet}/motion/${motion.file}')`,
    backgroundSize: `${motion.frames * 100}% 100%`,
    '--motion-end': motion.loop ? `${motion.frames / (motion.frames - 1) * 100}%` : '100%',
    animationDuration: `${motion.frames * motion.frameMs}ms`,
    animationTimingFunction: `steps(${motion.loop ? motion.frames : motion.frames - 1})`,
    animationIterationCount: motion.loop ? 'infinite' : 1,
    animationFillMode: 'forwards',
    animationName: still ? 'none' : 'motion-strip',
    ...(still ? { backgroundPosition: '0 0' } : {}),
  } as CSSProperties} />
}
