'use client'

import { useHomeMotionPreferences } from '@/components/home/home-motion'

import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { easeOutExpo, motionDurations } from './easings'

type Ripple = {
  id: number
  left: number
  top: number
  size: number
}

type RippleButtonProps = {
  children: ReactNode
  className?: string
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function RippleButton({ children, className }: RippleButtonProps) {
  const { prefersReducedMotion: reducedMotion } = useHomeMotionPreferences()
  const nextRippleId = useRef(0)
  const [ripples, setRipples] = useState<Ripple[]>([])

  if (reducedMotion) {
    return children
  }

  const addRipple = (element: HTMLElement, clientX?: number, clientY?: number) => {
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.4
    const x = clientX ?? rect.left + rect.width / 2
    const y = clientY ?? rect.top + rect.height / 2
    const ripple = {
      id: nextRippleId.current++,
      left: x - rect.left - size / 2,
      top: y - rect.top - size / 2,
      size,
    }

    setRipples((current) => [...current, ripple])

    window.setTimeout(() => {
      setRipples((current) => current.filter((entry) => entry.id !== ripple.id))
    }, motionDurations.ripple * 1000)
  }

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.defaultPrevented) {
      return
    }

    addRipple(event.currentTarget, event.clientX, event.clientY)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      addRipple(event.currentTarget)
    }
  }

  return (
    <span
      className={joinClasses('relative isolate inline-flex', className)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
    >
      {children}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <AnimatePresence initial={false}>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full"
              initial={{ scale: 0, opacity: 0.22 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionDurations.ripple, ease: easeOutExpo }}
              style={{
                left: ripple.left,
                top: ripple.top,
                width: ripple.size,
                height: ripple.size,
                background:
                  'radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 72%)',
              }}
            />
          ))}
        </AnimatePresence>
      </span>
    </span>
  )
}
