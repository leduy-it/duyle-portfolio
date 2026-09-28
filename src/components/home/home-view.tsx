'use client'

import { motion } from 'motion/react'
import { HeroSection } from '@/components/home/hero-section'
import { HomeBackgroundWrapper } from '@/components/home/home-background-wrapper'
import { SuggestionPills } from '@/components/home/suggestion-pills'
import { TerminalChat } from '@/components/home/terminal-chat'
import { APPLE_EASE_OUT_EXPO, APPLE_EASE_OUT_QUART, useHomeMotionPreferences } from './home-motion'

export function HomeView() {
  const { prefersReducedMotion } = useHomeMotionPreferences()

  const revealInitial = prefersReducedMotion ? false : { opacity: 0, y: 12 }
  const revealAnimate = { opacity: 1, y: 0 }

  return (
    <div className="relative min-h-[calc(100vh-120px)] overflow-hidden">
      <HomeBackgroundWrapper />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(var(--background))_82%)]"
        style={{ zIndex: 5 }}
      />
      <div
        className="relative mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pt-14"
        style={{ zIndex: 10 }}
      >
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
          <motion.div
            className="flex w-full flex-col items-center lg:w-1/3"
            initial={revealInitial}
            animate={revealAnimate}
            transition={
              prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: APPLE_EASE_OUT_EXPO }
            }
          >
            <HeroSection />
          </motion.div>

          <motion.div
            id="terminal-chat"
            className="w-full flex-1 scroll-mt-24"
            initial={revealInitial}
            animate={revealAnimate}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.5, delay: 0.08, ease: APPLE_EASE_OUT_EXPO }
            }
          >
            <TerminalChat />
            <motion.div
              initial={revealInitial}
              animate={revealAnimate}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.45, delay: 0.16, ease: APPLE_EASE_OUT_QUART }
              }
              className={[
                '[&_button]:shadow-none',
                '[&_button]:transition-[transform,box-shadow,background-color,border-color,color]',
                '[&_button]:duration-200',
                '[&_button]:ease-[cubic-bezier(0.25,1,0.5,1)]',
                prefersReducedMotion
                  ? ''
                  : '[&_button:hover]:-translate-y-px [&_button:hover]:shadow-[0_10px_24px_rgba(0,0,0,0.16)] [&_button:active]:scale-[0.97]',
              ].join(' ')}
            >
              <SuggestionPills />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
