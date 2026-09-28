'use client'

import { type MouseEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import { useLocale } from '@/lib/i18n'
import { pickLocalized } from '@/lib/i18n'
import {
  APPLE_EASE_OUT_EXPO,
  APPLE_EASE_OUT_QUART,
  GalleryReveal,
} from './gallery-reveal'

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
  tags: string[]
  image: string
  alt: string
  alt_vi?: string
}

interface PhotoCardProps {
  film: FilmData
  index: number
}

export default function PhotoCard({ film, index }: PhotoCardProps) {
  const { locale, t } = useLocale()
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [isLoaded, setIsLoaded] = useState(false)
  const navigationTimeoutRef = useRef<number | null>(null)
  const title = pickLocalized(film as unknown as Record<string, unknown>, 'title', locale)
  const tagline = pickLocalized(film as unknown as Record<string, unknown>, 'tagline', locale)
  const story = pickLocalized(film as unknown as Record<string, unknown>, 'story', locale)
  const runtime = pickLocalized(film as unknown as Record<string, unknown>, 'runtime', locale)
  const alt = pickLocalized(film as unknown as Record<string, unknown>, 'alt', locale)
  const hasCaption = Boolean(tagline)
  const href = `/movie/${film.slug}`

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current !== null) {
        window.clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [])

  const navigateToDetail = () => {
    if (!prefersReducedMotion && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => {
        router.push(href)
      })
      return
    }

    router.push(href)
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.currentTarget.target === '_blank'
    ) {
      return
    }

    event.preventDefault()

    if (navigationTimeoutRef.current !== null) {
      window.clearTimeout(navigationTimeoutRef.current)
    }

    navigationTimeoutRef.current = window.setTimeout(
      navigateToDetail,
      prefersReducedMotion ? 0 : 110
    )
  }

  return (
    <GalleryReveal
      className="h-full"
      delay={Math.min(index * 0.07, 0.49)}
      y={18}
    >
      <Link href={href} className="group block h-full" onClick={handleClick}>
        <motion.div
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-card))] transition-[border-color,box-shadow] duration-300 hover:border-[rgb(var(--accent))] hover:shadow-lg"
          initial={false}
          whileHover={prefersReducedMotion ? undefined : 'hover'}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
        >
          <div
            className="relative aspect-[2/3] overflow-hidden border-b border-[rgb(var(--border))] bg-[rgb(var(--surface-page))]"
            style={{ viewTransitionName: `cinema-${film.slug}` }}
          >
            <motion.div
              className="absolute inset-0"
              transition={{
                duration: prefersReducedMotion ? 0 : 0.7,
                ease: APPLE_EASE_OUT_QUART,
              }}
              variants={
                prefersReducedMotion
                  ? undefined
                  : {
                      hover: { scale: 1.04 },
                    }
              }
            >
              <motion.div
                animate={
                  prefersReducedMotion || isLoaded
                    ? { opacity: 1, filter: 'blur(0px)' }
                    : { opacity: 0, filter: 'blur(12px)' }
                }
                className="absolute inset-0"
                initial={false}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.5,
                  ease: APPLE_EASE_OUT_EXPO,
                }}
              >
                <Image
                  src={film.image}
                  alt={alt}
                  fill
                  className="object-cover object-center"
                  onLoad={() => setIsLoaded(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              </motion.div>
            </motion.div>

            {hasCaption ? (
              <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
                initial={false}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.35,
                  ease: APPLE_EASE_OUT_EXPO,
                }}
                variants={
                  prefersReducedMotion
                    ? undefined
                    : {
                        hover: { opacity: 0.5 },
                      }
                }
              />
            ) : null}
          </div>

          <article className="flex flex-1 flex-col p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--accent))]">
                  {film.director}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[rgb(var(--text-primary))] transition-colors duration-200 group-hover:text-[rgb(var(--accent))]">
                  {title}
                </h3>
              </div>
              <span
                className="rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{
                  borderColor: 'rgb(var(--accent-warm))',
                  color: 'rgb(var(--accent-warm))',
                }}
              >
                {film.letterboxdRating}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2 font-mono text-[11px] text-[rgb(var(--text-muted))]">
              <span>{film.year}</span>
              <span>•</span>
              <span>{runtime}</span>
            </div>

            <p className="mb-4 text-sm italic text-[rgb(var(--accent))]">{tagline}</p>
            <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
              {story}
            </p>

            <div className="mt-auto flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {film.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-[rgb(var(--border))] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--text-muted))]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[10px] text-[rgb(var(--accent))] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {t('cinema.viewNotes')}
              </span>
            </div>
          </article>
        </motion.div>
      </Link>
    </GalleryReveal>
  )
}
