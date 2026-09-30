'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { useLocale } from '@/lib/i18n'
import { pickLocalized } from '@/lib/i18n'

interface BlogPost {
  title: string
  title_vi?: string
  slug: string
  date: string
  excerpt: string
  excerpt_vi?: string
  image?: string
  imageAlt?: string
  imageAlt_vi?: string
  tags?: string[]
  readingMinutes?: number
}

interface BlogPostCardProps {
  post: BlogPost
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const { locale, t } = useLocale()
  const shouldReduceMotion = useReducedMotion()
  const title = pickLocalized(post as unknown as Record<string, unknown>, 'title', locale)
  const excerpt = pickLocalized(post as unknown as Record<string, unknown>, 'excerpt', locale)
  const imageAlt = pickLocalized(post as unknown as Record<string, unknown>, 'imageAlt', locale) || title
  const visibleTags = post.tags?.slice(0, 3) ?? []

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full"
    >
      <motion.article
        className="blog-card relative flex h-full flex-col overflow-hidden rounded-3xl border border-[rgb(var(--border)/0.6)] bg-[rgb(var(--surface-card)/0.72)] backdrop-blur-md"
        style={{
          boxShadow: 'var(--shadow-card)',
        }}
        initial={false}
        animate="rest"
        whileHover={shouldReduceMotion ? undefined : 'hover'}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
        variants={{
          rest: { y: 0, scale: 1 },
          hover: {
            y: -2,
            scale: 1,
            transition: {
              y: {
                type: 'spring',
                stiffness: 140,
                damping: 22,
              },
            },
          },
        }}
        transition={{
          type: 'spring',
          stiffness: 140,
          damping: 22,
        }}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[rgb(var(--accent)/0.35)]"
          variants={{
            rest: { opacity: 0 },
            hover: {
              opacity: 1,
              transition: {
                duration: 0.18,
                ease: EASE_OUT_EXPO,
              },
            },
          }}
        />

        {/* Cover image */}
        {post.image && (
          <div className="relative aspect-[16/10] overflow-hidden border-b border-[rgb(var(--border)/0.5)]">
            <motion.div
              className="absolute inset-0"
              variants={
                shouldReduceMotion
                  ? undefined
                  : {
                      rest: { scale: 1 },
                      hover: {
                        scale: 1.03,
                        transition: {
                          duration: 0.6,
                          ease: EASE_OUT_QUART,
                        },
                      },
                    }
              }
            >
              <Image
                src={post.image}
                alt={imageAlt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(var(--surface-card))] via-transparent to-transparent opacity-60" />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col p-7 sm:p-8">
          {/* Meta row */}
          <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs text-[rgb(var(--text-muted))]">
            {post.readingMinutes ? (
              <span>{post.readingMinutes} {t('blog.minRead')}</span>
            ) : null}
          </div>

          {/* Title */}
          <h3 className="mb-3 text-xl font-semibold leading-snug text-[rgb(var(--text-primary))] transition-colors duration-200 group-hover:text-[rgb(var(--accent))] sm:text-2xl">
            {title}
          </h3>

          {/* Tag pills */}
          {visibleTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[rgb(var(--accent)/0.25)] bg-[rgb(var(--accent)/0.08)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[rgb(var(--accent))]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Excerpt */}
          <p className="mb-6 flex-1 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
            {excerpt}
          </p>

          {/* CTA */}
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1 font-mono text-sm text-[rgb(var(--accent))]">
              {t('blog.readMore')}
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
