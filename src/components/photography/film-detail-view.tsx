'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { useLocale } from '@/lib/i18n'
import { pickLocalized } from '@/lib/i18n'
import { PixelDivider } from '@/components/pixel-divider'
import {
  APPLE_EASE_OUT_EXPO,
  SOFT_SPRING,
} from './gallery-reveal'

interface Perspective {
  title: string
  title_vi?: string
  body: string
  body_vi?: string
}

// perspectives_vi entries in films.json use title_vi/body_vi as their only keys
interface PerspectiveVi {
  title_vi: string
  body_vi: string
}

interface FilmData {
  title: string
  title_vi?: string
  slug: string
  director: string
  year: string
  runtime: string
  runtime_vi?: string
  letterboxdRating: string
  tagline: string
  tagline_vi?: string
  story: string
  story_vi?: string
  hook?: string
  hook_vi?: string
  lesson?: string
  lesson_vi?: string
  tags: string[]
  image: string
  alt: string
  alt_vi?: string
  perspectives?: Perspective[]
  perspectives_vi?: PerspectiveVi[]
}

interface Props {
  film: FilmData
}

export function FilmDetailView({ film }: Props) {
  const { locale, t } = useLocale()
  const prefersReducedMotion = useReducedMotion()
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const title = pickLocalized(film as unknown as Record<string, unknown>, 'title', locale)
  const tagline = pickLocalized(film as unknown as Record<string, unknown>, 'tagline', locale)
  const story = pickLocalized(film as unknown as Record<string, unknown>, 'story', locale)
  const hook = pickLocalized(film as unknown as Record<string, unknown>, 'hook', locale)
  const lesson = pickLocalized(film as unknown as Record<string, unknown>, 'lesson', locale)
  const runtime = pickLocalized(film as unknown as Record<string, unknown>, 'runtime', locale)
  const alt = pickLocalized(film as unknown as Record<string, unknown>, 'alt', locale)

  // perspectives_vi entries use title_vi/body_vi keys directly; normalise to {title,body}
  const perspectivesToShow: Array<{ title: string; body: string }> =
    locale === 'vi' && film.perspectives_vi && film.perspectives_vi.length > 0
      ? film.perspectives_vi.map((p) => ({ title: p.title_vi, body: p.body_vi }))
      : (film.perspectives ?? []).map((p) => ({ title: p.title, body: p.body }))

  const detailVariants = prefersReducedMotion
    ? undefined
    : {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.12,
          },
        },
      }
  const detailItemVariants = prefersReducedMotion
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
  const linkVariants = prefersReducedMotion
    ? undefined
    : {
        hover: { x: -5 },
      }

  return (
    <main className="min-h-screen bg-[rgb(var(--background))] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="mb-8 inline-flex w-fit"
          initial={false}
          whileHover={prefersReducedMotion ? undefined : 'hover'}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
        >
          <Link
            href="/movie"
            className="inline-flex items-center gap-2 font-mono text-xs text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
          >
            <motion.span
              aria-hidden
              transition={prefersReducedMotion ? { duration: 0 } : SOFT_SPRING}
              variants={linkVariants}
            >
              ←
            </motion.span>
            <span>{t('cinema.cdBack')}</span>
          </Link>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <motion.div
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-page))]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            style={{ viewTransitionName: `cinema-${film.slug}` }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              ease: APPLE_EASE_OUT_EXPO,
            }}
          >
            <motion.div
              animate={
                prefersReducedMotion || isImageLoaded
                  ? { opacity: 1, filter: 'blur(0px)' }
                  : { opacity: 0, filter: 'blur(12px)' }
              }
              className="absolute inset-0"
              initial={false}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.7,
                ease: APPLE_EASE_OUT_EXPO,
              }}
            >
              <Image
                src={film.image}
                alt={alt}
                fill
                className="object-cover"
                onLoad={() => setIsImageLoaded(true)}
                sizes="280px"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            animate={prefersReducedMotion ? undefined : 'visible'}
            className="flex flex-col justify-center"
            initial={prefersReducedMotion ? false : 'hidden'}
            variants={detailVariants}
          >
            <motion.p
              className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--accent))]"
              variants={detailItemVariants}
            >
              {film.director}
            </motion.p>
            <motion.h1
              className="text-3xl sm:text-4xl font-bold text-[rgb(var(--text-primary))] mb-3 leading-tight"
              style={{ textShadow: '2px 2px 0 rgb(var(--accent) / 0.12)' }}
              variants={detailItemVariants}
            >
              {title}
            </motion.h1>
            <motion.div
              className="mb-4 flex flex-wrap items-center gap-3 font-mono text-xs text-[rgb(var(--text-muted))]"
              variants={detailItemVariants}
            >
              <span>{film.year}</span>
              <span aria-hidden>•</span>
              <span>{runtime}</span>
              <span aria-hidden>•</span>
              <span className="rounded-sm border border-[rgb(var(--accent))] px-2 py-0.5 text-[rgb(var(--accent))]">
                {film.letterboxdRating}
              </span>
            </motion.div>
            <motion.p className="mb-3 italic text-[rgb(var(--accent))]" variants={detailItemVariants}>
              {tagline}
            </motion.p>
            {hook && (
              <motion.p
                className="mb-5 text-base leading-relaxed text-[rgb(var(--text-secondary))]"
                variants={detailItemVariants}
              >
                {hook}
              </motion.p>
            )}
            <motion.div className="flex flex-wrap gap-2" variants={detailItemVariants}>
              {film.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm border border-[rgb(var(--border))] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--text-muted))]"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <PixelDivider className="mt-10 mb-8" />

        {story && (
          <section className="mb-10">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-[rgb(var(--text-muted))]">
              <span className="text-[rgb(var(--accent))]">##</span> {t('cinema.notes')}
            </h2>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-card))] p-6 sm:p-8">
              <p className="text-base leading-relaxed text-[rgb(var(--text-secondary))]">
                {story}
              </p>
            </div>
          </section>
        )}

        {perspectivesToShow.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-[rgb(var(--text-muted))]">
              <span className="text-[rgb(var(--accent))]">##</span> {t('cinema.multiAngle')}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {perspectivesToShow.map((p, idx) => (
                <article
                  key={idx}
                  className="flex flex-col rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-card))] p-5 transition-colors hover:border-[rgb(var(--accent))]/60"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--accent))] mb-3">
                    {String(idx + 1).padStart(2, '0')} · {p.title}
                  </p>
                  <p className="text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                    {p.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {lesson && (
          <section className="mb-12">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-[rgb(var(--text-muted))]">
              <span className="text-[rgb(var(--accent))]">##</span> {t('cinema.takeaway')}
            </h2>
            <blockquote className="rounded-2xl border-l-2 border-[rgb(var(--accent))] bg-[rgb(var(--surface-overlay))] py-5 pl-6 pr-5 text-base leading-relaxed text-[rgb(var(--text-primary))]">
              {lesson}
            </blockquote>
          </section>
        )}

        <div className="mt-12 flex items-center justify-between font-mono text-xs text-[rgb(var(--text-muted))]">
          <motion.div
            className="w-fit"
            initial={false}
            whileHover={prefersReducedMotion ? undefined : 'hover'}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            <Link
              href="/movie"
              className="transition-colors hover:text-[rgb(var(--accent))]"
            >
              <motion.span
                className="inline-block"
                transition={prefersReducedMotion ? { duration: 0 } : SOFT_SPRING}
                variants={linkVariants}
              >
                {t('cinema.backToCinema')}
              </motion.span>
            </Link>
          </motion.div>
          <span>{t('brand.lower')} / cinema / {film.slug}</span>
        </div>
      </div>
    </main>
  )
}
