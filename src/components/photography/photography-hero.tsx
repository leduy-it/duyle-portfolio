'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'motion/react'
import { useLocale } from '@/lib/i18n'
import { APPLE_EASE_OUT_EXPO } from './gallery-reveal'

const CinemaThreeCanvas = dynamic(
  () => import('@/components/photography/cinema-three-canvas'),
  { ssr: false }
)

interface Intro {
  eyebrow: string
  title: string
  body: string
}

const INTROS_EN: Intro[] = [
  {
    eyebrow: 'cinema · pinned',
    title: 'A small wall of films I cannot un-see',
    body: 'Eight movies that lodged themselves in the way I think about pacing, restraint, and the cost of saying too much. They do not need rewatching to keep working — they keep humming in the background while I write code.',
  },
  {
    eyebrow: 'cinema',
    title: 'Films that taught me how to pay attention',
    body: 'Half of these I love for what they show. The other half for what they refuse to show. Both halves keep teaching me how to engineer with a little more patience and a little less ego.',
  },
  {
    eyebrow: 'cinema · loop',
    title: 'On rotation in my head',
    body: 'These are not the best films of all time. They are the ones I notice myself thinking about at 11pm on a Tuesday — when a deploy is creeping past midnight and I need a different kind of room to be in.',
  },
  {
    eyebrow: 'cinema',
    title: 'Eight rooms I keep walking back into',
    body: 'Each of these films is less a story I remember and more a room I keep entering — the light, the sound, the silence between cuts. Engineering would be lonelier without them.',
  },
]

const INTROS_VI: Intro[] = [
  {
    eyebrow: 'điện ảnh · ghim',
    title: 'Một bức tường nhỏ gồm những bộ phim tôi không thể un-see',
    body: 'Tám bộ phim đã cắm rễ vào cách tôi nghĩ về nhịp điệu, sự kiềm chế, và cái giá của việc nói quá nhiều. Chúng không cần xem lại để tiếp tục hoạt động — chúng cứ ngân nga trong đầu trong khi tôi viết code.',
  },
  {
    eyebrow: 'điện ảnh',
    title: 'Những bộ phim dạy tôi cách chú ý',
    body: 'Một nửa tôi yêu vì những gì chúng hiện ra. Nửa còn lại vì những gì chúng từ chối hiện ra. Cả hai nửa đều tiếp tục dạy tôi cách làm kỹ thuật với nhiều kiên nhẫn hơn và ít cái tôi hơn.',
  },
  {
    eyebrow: 'điện ảnh · lặp',
    title: 'Đang trong vòng quay trong đầu tôi',
    body: 'Đây không phải những bộ phim hay nhất mọi thời đại. Đây là những bộ phim tôi bắt gặp mình đang nghĩ đến lúc 11 giờ đêm thứ Ba — khi một lần deploy đang bò qua nửa đêm và tôi cần một căn phòng khác để ở.',
  },
  {
    eyebrow: 'điện ảnh',
    title: 'Tám căn phòng tôi cứ bước vào lại',
    body: 'Mỗi bộ phim này ít là một câu chuyện tôi nhớ mà hơn là một căn phòng tôi cứ bước vào — ánh sáng, âm thanh, sự im lặng giữa các cú cắt. Làm kỹ thuật sẽ cô đơn hơn nếu thiếu chúng.',
  },
]

export default function PhotographyHero() {
  const { locale, t } = useLocale()
  const prefersReducedMotion = useReducedMotion()
  // Index into the locale-specific extras list (index 0 means "use t() defaults")
  const [extraIdx, setExtraIdx] = useState<number | null>(null)

  useEffect(() => {
    // 50% chance to show the t()-driven default, 50% to show a rotation variant
    const extras = locale === 'vi' ? INTROS_VI : INTROS_EN
    const roll = Math.floor(Math.random() * (extras.length + 1))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExtraIdx(roll === extras.length ? null : roll)
  }, [locale])

  const extras = locale === 'vi' ? INTROS_VI : INTROS_EN
  const intro: Intro =
    extraIdx !== null && extraIdx < extras.length
      ? extras[extraIdx]
      : {
          eyebrow: t('cinema.eyebrow'),
          title: t('cinema.title'),
          body: t('cinema.body'),
        }

  const contentKey = `${locale}-${extraIdx ?? 'default'}`
  const contentVariants = prefersReducedMotion
    ? undefined
    : {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }
  const itemVariants = prefersReducedMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.56,
            ease: APPLE_EASE_OUT_EXPO,
          },
        },
      }

  return (
    <section className="relative overflow-hidden border-b border-[rgb(var(--border))] bg-[rgb(var(--surface-page))]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at top, rgb(var(--accent) / 0.18), transparent 45%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgb(var(--border)) 1px, transparent 1px), linear-gradient(rgb(var(--border)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative mx-auto flex min-h-[44vh] max-w-[1440px] flex-col items-center gap-10 px-6 py-20 sm:px-8 lg:flex-row lg:px-12">
        {/* Left: text column */}
        <motion.div
          key={contentKey}
          className="flex flex-1 flex-col justify-center"
          animate={prefersReducedMotion ? undefined : 'visible'}
          initial={prefersReducedMotion ? false : 'hidden'}
          variants={contentVariants}
        >
          <motion.p
            className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-[rgb(var(--accent))]"
            variants={itemVariants}
          >
            {intro.eyebrow}
          </motion.p>
          <motion.h1
            className="max-w-4xl text-4xl font-semibold text-[rgb(var(--text-primary))] sm:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            {intro.title}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-3xl font-mono text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base"
            variants={itemVariants}
          >
            {intro.body}
          </motion.p>
        </motion.div>

        {/* Right: cinema Three.js canvas */}
        <div
          className="relative w-full shrink-0 overflow-hidden rounded-2xl lg:w-[420px] lg:self-stretch"
          style={{
            minHeight: '260px',
            boxShadow: '0 0 80px -24px rgb(var(--accent) / 0.18)',
          }}
          aria-hidden="true"
        >
          <CinemaThreeCanvas />
        </div>
      </div>
    </section>
  )
}
