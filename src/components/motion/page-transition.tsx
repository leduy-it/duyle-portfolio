'use client'

import { useHomeMotionPreferences } from '@/components/home/home-motion'

import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect,useState,type PropsWithChildren } from 'react'
import { MotionSeedContext,entrancePose,nextMotionSeed,motionPattern } from './entrance-patterns'
import { easeInOutQuart, easeOutExpo, motionDurations } from './easings'

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const { prefersReducedMotion: reducedMotion } = useHomeMotionPreferences()

  const [seed,setSeed]=useState(0)
  useEffect(()=>{const frame=requestAnimationFrame(()=>setSeed(previous=>nextMotionSeed(previous)));return()=>cancelAnimationFrame(frame)},[pathname])
  const pose=entrancePose(seed)
  const x=pose.x*.25,y=pose.y*.25

  return (
    <MotionSeedContext.Provider value={seed}><AnimatePresence initial={false} mode="wait">
      <motion.div data-motion-pattern={motionPattern(seed)}
        key={pathname}
        initial={reducedMotion ? false : { opacity: 0, x, y }}
        animate={{
          opacity: 1,
          y: 0,
          x: 0,
          transition: {
            duration: reducedMotion ? motionDurations.instant : motionDurations.standard,
            ease: easeOutExpo,
          },
        }}
        exit={
          reducedMotion
            ? { opacity: 1, x: 0, y: 0 }
            : {
                opacity: 0,
                x: 0,
                y: 0,
                transition: {
                  duration: motionDurations.exit,
                  ease: easeInOutQuart,
                },
              }
        }
        style={{ willChange: reducedMotion ? 'auto' : 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence></MotionSeedContext.Provider>
  )
}
