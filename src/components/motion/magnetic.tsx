'use client'

import { useHomeMotionPreferences } from '@/components/home/home-motion'

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { easeSpringSoft } from './easings'

type MagneticProps = PropsWithChildren<{
  className?: string
  disabled?: boolean
  strength?: number
}>

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function Magnetic({
  children,
  className,
  disabled = false,
  strength = 6,
}: MagneticProps) {
  const { prefersReducedMotion: reducedMotion } = useHomeMotionPreferences()
  const [coarsePointer, setCoarsePointer] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, easeSpringSoft)
  const springY = useSpring(y, easeSpringSoft)

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

  const enabled = !disabled && !reducedMotion && !coarsePointer

  return (
    <motion.div
      className={className ? `inline-block ${className}` : 'inline-block'}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      onPointerMove={(event) => {
        if (!enabled) {
          return
        }

        const rect = event.currentTarget.getBoundingClientRect()
        const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * strength * 2
        const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * strength * 2

        x.set(clamp(offsetX, -strength, strength))
        y.set(clamp(offsetY, -strength, strength))
      }}
      style={enabled ? { x: springX, y: springY, willChange: 'transform' } : undefined}
    >
      {children}
    </motion.div>
  )
}
