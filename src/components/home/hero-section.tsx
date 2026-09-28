'use client'

import { useEffect, useRef } from 'react'
import { motion, useSpring } from 'motion/react'
import Image from 'next/image'
import { SocialLinks } from '@/components/social-links'
import { NOW_STATUS } from '@/data/now'
import { useLocale } from '@/lib/i18n'
import {
  APPLE_EASE_OUT_EXPO,
  APPLE_EASE_OUT_QUART,
  SOFT_SPRING,
  useHomeMotionPreferences,
} from './home-motion'

export function HeroSection() {
  const { locale, t } = useLocale()
  const { isCoarsePointer, prefersReducedMotion } = useHomeMotionPreferences()
  const portraitX = useSpring(0, SOFT_SPRING)
  const portraitY = useSpring(0, SOFT_SPRING)
  const socialLinksRef = useRef<HTMLDivElement | null>(null)

  function pickField<K extends string>(
    obj: Record<string, unknown>,
    key: K,
    loc: typeof locale
  ): string {
    if (loc === 'vi') {
      const viKey = `${key}_vi`
      const viVal = obj[viKey]
      if (typeof viVal === 'string' && viVal.trim().length > 0) return viVal
    }
    const val = obj[key]
    return typeof val === 'string' ? val : ''
  }

  useEffect(() => {
    const root = socialLinksRef.current
    if (!root || prefersReducedMotion || isCoarsePointer) return

    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('a'))
    const cleanups = links.map((link) => {
      const handlePointerMove = (event: PointerEvent) => {
        const rect = link.getBoundingClientRect()
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5
        const pullX = Math.max(-5, Math.min(5, offsetX * 10))
        const pullY = Math.max(-5, Math.min(5, offsetY * 10))

        link.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`
      }

      const handlePointerLeave = () => {
        link.style.transform = 'translate3d(0px, 0px, 0)'
      }

      link.addEventListener('pointermove', handlePointerMove)
      link.addEventListener('pointerleave', handlePointerLeave)

      return () => {
        link.removeEventListener('pointermove', handlePointerMove)
        link.removeEventListener('pointerleave', handlePointerLeave)
        link.style.transform = 'translate3d(0px, 0px, 0)'
      }
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [isCoarsePointer, prefersReducedMotion])

  function handlePortraitMove(event: React.PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || isCoarsePointer) return

    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5

    portraitX.set(Math.max(-4, Math.min(4, offsetX * 8)))
    portraitY.set(Math.max(-4, Math.min(4, offsetY * 8)))
  }

  function resetPortraitOffset() {
    portraitX.set(0)
    portraitY.set(0)
  }

  const heroStackVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { staggerChildren: 0.06, delayChildren: 0.04 },
    },
  }

  const heroItemVariants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0.12 }
        : { duration: 0.6, ease: APPLE_EASE_OUT_EXPO },
    },
  }

  return (
    <motion.div
      className="flex w-full flex-col items-center gap-5"
      initial="hidden"
      animate="visible"
      variants={heroStackVariants}
    >
      {/* Profile image — pixel-art portrait */}
      <motion.div className="mb-1 flex flex-col items-center" variants={heroItemVariants}>
        <div
          onPointerMove={handlePortraitMove}
          onPointerLeave={resetPortraitOffset}
          className="relative h-28 w-28 overflow-hidden rounded-3xl border border-[rgb(var(--accent))] bg-[rgb(var(--surface-overlay))] md:h-36 md:w-36 lg:h-40 lg:w-40"
          style={{
            boxShadow:
              '0 0 0 6px rgb(var(--surface-page)), 0 0 0 7px rgb(var(--accent) / .25), 0 12px 45px rgb(var(--accent) / .08)',
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={
              prefersReducedMotion || isCoarsePointer ? undefined : { x: portraitX, y: portraitY }
            }
          >
            <Image
              src="/images/profile/duy-camera.png"
              alt="Duy Le — pixel-art self-portrait holding a camera"
              fill
              quality={90}
              sizes="(max-width: 768px) 112px, (max-width: 1024px) 144px, 160px"
              className="scale-[1.04] object-contain"
              style={{ imageRendering: 'pixelated' }}
              priority
            />
          </motion.div>
        </div>
        <motion.p
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--text-muted))]"
          variants={heroItemVariants}
        >
          {t('hero.pixelCaption')}
        </motion.p>
      </motion.div>

      <motion.div variants={heroItemVariants} className="text-center">
        <p className="mb-2 text-[9px] uppercase tracking-[.24em] text-[rgb(var(--text-muted))]">
          AI ENGINEER / HO CHI MINH CITY
        </p>
        <h1 className="text-4xl font-semibold tracking-[-.06em] text-[rgb(var(--text-primary))] lg:text-5xl">
          Duy Le<span className="text-[rgb(var(--accent))]">.</span>
        </h1>
        <p className="mt-3 max-w-xs text-xs leading-relaxed text-[rgb(var(--text-secondary))]">
          {locale === 'vi'
            ? 'Biến tài liệu và ý tưởng thành những hệ thống chạy được.'
            : 'Turning documents and ideas into systems that work.'}
        </p>
      </motion.div>

      {/* Social links */}
      <motion.div
        ref={socialLinksRef}
        variants={heroItemVariants}
        className={[
          '[&_a]:will-change-transform',
          '[&_a]:transition-[transform,color]',
          '[&_a]:duration-200',
          '[&_a]:ease-[cubic-bezier(0.25,1,0.5,1)]',
          '[&_a>div]:transition-[border-color,box-shadow]',
          '[&_a>div]:duration-200',
          '[&_a>div]:ease-[cubic-bezier(0.25,1,0.5,1)]',
          prefersReducedMotion ? '' : '[&_a:hover>div]:shadow-[0_14px_30px_rgba(0,0,0,0.14)]',
        ].join(' ')}
      >
        <SocialLinks />
      </motion.div>

      <motion.div
        className="max-w-md rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-overlay)/0.7)] px-4 py-3 font-mono text-xs leading-relaxed text-[rgb(var(--text-muted))]"
        variants={heroItemVariants}
      >
        <motion.div variants={heroItemVariants}>
          <span className="text-[rgb(var(--accent))]">&gt;</span>{' '}
          <span className="text-[rgb(var(--accent))]">{t('hero.now.currently')}:</span>{' '}
          {pickField(NOW_STATUS as unknown as Record<string, unknown>, 'currently', locale)}
        </motion.div>
        <details className="mt-3 group">
          <summary className="cursor-pointer text-[10px] text-[rgb(var(--accent))] list-none flex items-center justify-between">
            {locale === 'vi'
              ? 'Hiện tại, sở thích & công cụ'
              : 'The now, the interests & the tools'}{' '}
            <span className="transition-transform group-open:rotate-45">＋</span>
          </summary>
          <div className="mt-3 space-y-2">
            <motion.div className="mt-1" variants={heroItemVariants}>
              <span className="text-[rgb(var(--accent))]">&gt;</span>{' '}
              <span className="text-[rgb(var(--accent))]">{t('hero.now.previously')}:</span>{' '}
              {pickField(NOW_STATUS as unknown as Record<string, unknown>, 'previously', locale)}
            </motion.div>
            <motion.div className="mt-1" variants={heroItemVariants}>
              <span className="text-[rgb(var(--accent))]">&gt;</span>{' '}
              <span className="text-[rgb(var(--accent))]">{t('hero.now.reading')}:</span>{' '}
              {pickField(NOW_STATUS as unknown as Record<string, unknown>, 'reading', locale)}
            </motion.div>
            <motion.div className="mt-1" variants={heroItemVariants}>
              <span className="text-[rgb(var(--accent))]">&gt;</span>{' '}
              <span className="text-[rgb(var(--accent))]">{t('hero.now.openTo')}:</span>{' '}
              {pickField(NOW_STATUS as unknown as Record<string, unknown>, 'openTo', locale)}
            </motion.div>
            <motion.div className="mt-1" variants={heroItemVariants}>
              <span className="text-[rgb(var(--accent))]">&gt;</span>{' '}
              <span className="text-[rgb(var(--accent))]">{t('hero.now.workingModes')}:</span>{' '}
              {pickField(NOW_STATUS as unknown as Record<string, unknown>, 'workingModes', locale)}
            </motion.div>
            <motion.div
              className="mt-2 flex flex-wrap items-center gap-1.5"
              variants={heroItemVariants}
              transition={
                prefersReducedMotion
                  ? { duration: 0.12 }
                  : { duration: 0.4, ease: APPLE_EASE_OUT_QUART }
              }
            >
              <span className="text-[rgb(var(--accent))]">&gt;</span>
              <span className="text-[rgb(var(--accent))]">{t('hero.now.buildHarness')}:</span>
              {NOW_STATUS.buildingWith.map((tool) => (
                <motion.span
                  key={tool}
                  className="rounded-sm border border-[rgb(var(--accent))] bg-[rgb(var(--surface-page))] px-1.5 py-0.5 text-[10px] tracking-wide text-[rgb(var(--text-secondary))]"
                  style={{ boxShadow: '2px 2px 0 rgb(var(--accent) / 0.4)' }}
                  variants={heroItemVariants}
                >
                  {tool}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </details>
      </motion.div>
    </motion.div>
  )
}
