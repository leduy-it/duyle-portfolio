'use client'

import { useHomeMotionPreferences } from '@/components/home/home-motion'

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { easeSpringSoft } from './easings'

export function CursorGlow() {
  const { prefersReducedMotion: reducedMotion } = useHomeMotionPreferences()
  const [coarsePointer, setCoarsePointer] = useState(false)
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-999)
  const y = useMotionValue(-999)
  const springX = useSpring(x, easeSpringSoft)
  const springY = useSpring(y, easeSpringSoft)
  const springOpacity = useSpring(0, {
    stiffness: 160,
    damping: 24,
    mass: 0.7,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const updatePointerMode = () => setCoarsePointer(mediaQuery.matches)

    updatePointerMode()
    mediaQuery.addEventListener('change', updatePointerMode)

    return () => mediaQuery.removeEventListener('change', updatePointerMode)
  }, [])

  useEffect(() => {
    if (reducedMotion || coarsePointer || typeof window === 'undefined') {
      return
    }

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      setVisible(true)
      springOpacity.set(0.28)
    }

    const handleLeave = () => {
      setVisible(false)
      springOpacity.set(0)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerleave', handleLeave)
    window.addEventListener('blur', handleLeave)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerleave', handleLeave)
      window.removeEventListener('blur', handleLeave)
    }
  }, [coarsePointer, reducedMotion, springOpacity, x, y])

  if (reducedMotion || coarsePointer) {
    return null
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 hidden md:block"
      style={{ opacity: springOpacity }}
    >
      <motion.div
        className="absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          x: springX,
          y: springY,
          background:
            'radial-gradient(circle, rgba(102, 252, 241, 0.08) 0%, rgba(102, 252, 241, 0.04) 35%, rgba(102, 252, 241, 0) 72%)',
          willChange: visible ? 'transform, opacity' : 'auto',
        }}
      />
    </motion.div>
  )
}
