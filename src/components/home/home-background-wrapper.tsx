'use client'

import { useSyncExternalStore } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useTheme } from 'next-themes'
import { SOFT_SPRING, useHomeMotionPreferences } from './home-motion'
import { GameOfLifeBackground } from './game-of-life-background'

interface HomeBackgroundWrapperProps {
  active?: boolean
}

// Media query store for mobile detection
function createMediaQueryStore(query: string) {
  return {
    subscribe: (cb: () => void) => {
      const mql = window.matchMedia(query)
      if (mql.addEventListener) {
        mql.addEventListener('change', cb)
        return () => mql.removeEventListener('change', cb)
      } else {
        // Legacy Safari
        mql.addListener(cb)
        return () => mql.removeListener(cb)
      }
    },
    getSnapshot: () => window.matchMedia(query).matches,
    getServerSnapshot: () => false,
  }
}

const mobileStore = createMediaQueryStore('(max-width: 1023px)')

export function HomeBackgroundWrapper({ active = false }: HomeBackgroundWrapperProps) {
  const { resolvedTheme } = useTheme()
  const { prefersReducedMotion } = useHomeMotionPreferences()
  const isMobile = useSyncExternalStore(
    mobileStore.subscribe,
    mobileStore.getSnapshot,
    mobileStore.getServerSnapshot
  )
  const { scrollYProgress } = useScroll()
  const backgroundOffset = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 30])
  const backgroundY = useSpring(backgroundOffset, SOFT_SPRING)
  const color = resolvedTheme && typeof window !== 'undefined'
    ? `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()})`
    : ''

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, y: prefersReducedMotion ? 0 : backgroundY }}
    >
      <GameOfLifeBackground
        color={color}
        active={active}
        mobileLite={isMobile}
        pauseWhenHidden
        reducedMotion={prefersReducedMotion}
      />
    </motion.div>
  )
}
