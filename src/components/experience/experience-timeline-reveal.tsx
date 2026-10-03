'use client'

import { entrancePose,settledPose,useMotionSeed,motionPattern } from '@/components/motion/entrance-patterns'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const SPRING_SOFT = {
  type: 'spring',
  stiffness: 140,
  damping: 22,
} as const

interface ExperienceRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  x?: number
  y?: number
  duration?: number
  amount?: number
  index?: number
}

export function ExperienceReveal({
  children,
  className,
  delay = 0,
  index=0,
  x,
  y,
  duration = 0.58,
  amount = 0.25,
}: ExperienceRevealProps) {
  const seed=useMotionSeed()
  const pose={...entrancePose(seed,index),...(x===undefined ? {} : {x}),...(y===undefined ? {} : {y})}
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className} data-entrance-pattern={motionPattern(seed)}
      initial={pose}
      whileInView={settledPose}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}

interface ExperienceTimelineRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'left' | 'right'
}

export function ExperienceTimelineReveal({
  children,
  className,
  delay = 0,
  direction = 'left',
}: ExperienceTimelineRevealProps) {
  return (
    <ExperienceReveal
      className={className}
      delay={delay}
      index={Math.round(delay*20)+(direction==='right' ? 1 : 0)}
      duration={0.45}
      amount={0.18}
    >
      {children}
    </ExperienceReveal>
  )
}
