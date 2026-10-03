'use client'

import { entrancePose,settledPose,useMotionSeed,motionPattern } from '@/components/motion/entrance-patterns'
import type { HTMLMotionProps, Transition } from 'motion/react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { type ReactNode, useRef } from 'react'

export const APPLE_EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const APPLE_EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const SOFT_SPRING: Transition = {
  type: 'spring',
  stiffness: 140,
  damping: 22,
}
const REVEAL_MARGIN = '0px 0px -10% 0px' as const

interface GalleryRevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  index?: number
  amount?: number | 'some' | 'all'
  children: ReactNode
  delay?: number
  duration?: number
  once?: boolean
  x?: number
  y?: number
}

export function GalleryReveal({
  amount = 0.2,
  index=0,
  animate,
  children,
  delay = 0,
  duration = 0.56,
  initial,
  once = true,
  transition,
  x,
  y,
  ...rest
}: GalleryRevealProps) {
  const seed=useMotionSeed()
  const pose={...entrancePose(seed,index),...(x===undefined ? {} : {x}),...(y===undefined ? {} : {y})}
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isInView = useInView(ref, { amount, margin: REVEAL_MARGIN, once })
  const isRevealed = prefersReducedMotion || isInView

  return (
    <motion.div
      ref={ref} data-entrance-pattern={motionPattern(seed)}
      animate={animate ?? (isRevealed ? settledPose : pose)}
      initial={initial ?? (prefersReducedMotion ? false : pose)}
      transition={
        transition ?? {
          duration: prefersReducedMotion ? 0 : duration,
          ease: APPLE_EASE_OUT_EXPO,
          delay: prefersReducedMotion ? 0 : delay,
        }
      }
      {...rest}
    >
      {children}
    </motion.div>
  )
}
