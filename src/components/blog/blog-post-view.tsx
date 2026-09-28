'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useLocale } from '@/lib/i18n'
import { pickLocalized } from '@/lib/i18n'

interface ChartMeta {
  id: string
  filename: string
  alt_en?: string
  alt_vi?: string
  caption_en?: string
  caption_vi?: string
}

interface Reference {
  key: string
  title: string
  authors: string
  year: number | string
  venue?: string
  url?: string
  note_en?: string
  note_vi?: string
}

interface BlogPost {
  title: string
  title_vi?: string
  slug: string
  date: string
  excerpt: string
  excerpt_vi?: string
  content: string
  content_vi?: string
  image?: string
  imageAlt?: string
  imageAlt_vi?: string
  tags?: string[]
  readingMinutes?: number
  charts?: ChartMeta[]
  references?: Reference[]
  key_takeaways_en?: string[]
  key_takeaways_vi?: string[]
}

interface Props {
  post: BlogPost
  prevPost: BlogPost | null
  nextPost: BlogPost | null
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
const HERO_TRANSITION = {
  duration: 0.52,
  ease: EASE_OUT_EXPO,
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'chart'; id: string; isDiagram: boolean }
  | { kind: 'references' }

const ANCHOR_RE = /^\[\[(CHART|DIAGRAM|REFERENCES)(?::([a-z0-9-]+))?\]\]$/i

function parseBlocks(content: string): Block[] {
  const raw = content
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
  const out: Block[] = []
  for (const para of raw) {
    const anchor = para.match(ANCHOR_RE)
    if (anchor) {
      const kind = anchor[1].toUpperCase()
      if (kind === 'REFERENCES') {
        out.push({ kind: 'references' })
      } else if (anchor[2]) {
        out.push({ kind: 'chart', id: anchor[2], isDiagram: kind === 'DIAGRAM' })
      }
      continue
    }
    if (para.startsWith('### ')) {
      out.push({ kind: 'h3', text: para.slice(4).trim() })
      continue
    }
    if (para.startsWith('## ')) {
      out.push({ kind: 'h2', text: para.slice(3).trim() })
      continue
    }
    out.push({ kind: 'p', text: para })
  }
  return out
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr)
  if (locale === 'vi') {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BlogPostView({ post, prevPost, nextPost }: Props) {
  const { locale, t } = useLocale()
  const shouldReduceMotion = useReducedMotion()
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const proseRef = useRef<HTMLDivElement>(null)

  const title = pickLocalized(post as unknown as Record<string, unknown>, 'title', locale)
  const content = pickLocalized(post as unknown as Record<string, unknown>, 'content', locale)
  const imageAlt = pickLocalized(post as unknown as Record<string, unknown>, 'imageAlt', locale) || title

  const blocks = useMemo(() => parseBlocks(content), [content])

  const chartsBySlug = useMemo(() => {
    const map = new Map<string, ChartMeta>()
    for (const c of post.charts ?? []) map.set(c.id, c)
    return map
  }, [post.charts])

  const takeaways = (locale === 'vi' && post.key_takeaways_vi?.length
    ? post.key_takeaways_vi
    : post.key_takeaways_en) ?? []

  const refs = post.references ?? []

  useEffect(() => {
    if (shouldReduceMotion) return

    const prose = proseRef.current
    if (!prose) return

    const nodes = Array.from(
      prose.querySelectorAll<HTMLElement>('[data-prose-reveal]')
    )
    if (nodes.length === 0) return

    const revealed = new WeakSet<HTMLElement>()
    const viewportCutoff = window.innerHeight * 0.92

    const animateNode = (node: HTMLElement, delay: number) => {
      if (revealed.has(node)) return
      revealed.add(node)

      const animation = node.animate(
        [
          { opacity: 0, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ],
        {
          duration: 520,
          delay,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      )

      animation.addEventListener(
        'finish',
        () => {
          node.style.opacity = ''
          node.style.transform = ''
        },
        { once: true }
      )
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const aIndex = Number((a.target as HTMLElement).dataset.revealIndex ?? 0)
            const bIndex = Number((b.target as HTMLElement).dataset.revealIndex ?? 0)
            return aIndex - bIndex
          })

        visibleEntries.forEach((entry, batchIndex) => {
          const node = entry.target as HTMLElement
          observer.unobserve(node)
          animateNode(node, batchIndex * 60)
        })
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.18,
      }
    )

    for (const node of nodes) {
      const rect = node.getBoundingClientRect()
      if (rect.top > viewportCutoff) {
        node.style.opacity = '0'
        node.style.transform = 'translateY(16px)'
        observer.observe(node)
      } else {
        revealed.add(node)
      }
    }

    return () => {
      observer.disconnect()
      for (const node of nodes) {
        node.style.opacity = ''
        node.style.transform = ''
      }
    }
  }, [blocks, shouldReduceMotion])

  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-8 md:py-16 lg:px-12">
        {/* Article column — narrow for readability */}
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumbs */}
          <motion.nav
            className="mb-8 flex flex-wrap items-center gap-2 font-mono text-xs text-[rgb(var(--text-muted))]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={HERO_TRANSITION}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-[rgb(var(--accent))] transition-colors duration-200 hover:text-[rgb(var(--accent-hover))]"
            >
              <motion.span
                className="inline-flex items-center gap-1"
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                transition={{
                  type: 'spring',
                  stiffness: 140,
                  damping: 22,
                }}
              >
                <span>←</span>
                <span>{t('blog.cdBack')}</span>
              </motion.span>
            </Link>
            <span aria-hidden>·</span>
            <span>{formatDate(post.date, locale)}</span>
            {post.readingMinutes ? (
              <>
                <span aria-hidden>·</span>
                <span>{post.readingMinutes} {t('blog.minRead')}</span>
              </>
            ) : null}
            {post.tags?.length ? (
              <>
                <span aria-hidden>·</span>
                <span className="text-[rgb(var(--accent))]">#{post.tags[0]}</span>
              </>
            ) : null}
          </motion.nav>

          <article>
            <motion.div
              className="mb-3 flex flex-wrap items-center gap-3 font-mono text-xs text-[rgb(var(--text-muted))]"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...HERO_TRANSITION,
                delay: shouldReduceMotion ? 0 : 0.06,
              }}
            >
              {post.tags?.length ? (
                <span className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      className="inline-flex text-[rgb(var(--accent))]"
                      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                      transition={{
                        type: 'spring',
                        stiffness: 140,
                        damping: 22,
                      }}
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </span>
              ) : null}
            </motion.div>

            <motion.h1
              className="mb-6 text-3xl font-bold leading-tight text-[rgb(var(--text-primary))] sm:text-4xl"
              style={{ textShadow: '2px 2px 0 rgb(var(--accent) / 0.12)' }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...HERO_TRANSITION,
                delay: shouldReduceMotion ? 0 : 0.12,
              }}
            >
              {title}
            </motion.h1>

            {post.image && (
              <motion.div
                className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-[rgb(var(--border))]"
                style={{
                  boxShadow: '0 0 80px -20px rgb(var(--accent) / 0.25)',
                }}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...HERO_TRANSITION,
                  delay: shouldReduceMotion ? 0 : 0.18,
                }}
              >
                <Image
                  src={post.image}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
                {hasHydrated && !shouldReduceMotion ? (
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{
                      duration: 0.7,
                      ease: EASE_OUT_EXPO,
                    }}
                  >
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      aria-hidden="true"
                      className="scale-[1.02] object-cover blur-[8px]"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </motion.div>
                ) : null}
              </motion.div>
            )}

            {/* Key Takeaways callout — appears above the body when present */}
            {takeaways.length > 0 && (
              <motion.aside
                className="mb-10 rounded-2xl border border-[rgb(var(--accent)/0.35)] bg-[rgb(var(--surface-card)/0.6)] p-6 backdrop-blur-md"
                style={{
                  boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.04), 0 0 60px -24px rgb(var(--accent) / 0.4)',
                }}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...HERO_TRANSITION,
                  delay: shouldReduceMotion ? 0 : 0.22,
                }}
              >
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.32em] text-[rgb(var(--accent))]">
                  {locale === 'vi' ? 'Tóm tắt nhanh' : 'Key takeaways'}
                </p>
                <ul className="space-y-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
                  {takeaways.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.aside>
            )}

            <div
              ref={proseRef}
              className="prose dark:prose-invert prose-lg max-w-none prose-p:mb-5 prose-p:leading-relaxed prose-p:text-[rgb(var(--text-secondary))] prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-[rgb(var(--text-primary))] prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl prose-h3:font-semibold prose-h3:text-[rgb(var(--text-primary))]"
            >
              {blocks.map((block, index) => {
                if (block.kind === 'h2') {
                  return (
                    <h2
                      key={index}
                      data-prose-reveal
                      data-reveal-index={index}
                      className="border-l-2 border-[rgb(var(--accent))] pl-4"
                    >
                      {block.text}
                    </h2>
                  )
                }
                if (block.kind === 'h3') {
                  return (
                    <h3 key={index} data-prose-reveal data-reveal-index={index}>
                      {block.text}
                    </h3>
                  )
                }
                if (block.kind === 'chart') {
                  const meta = chartsBySlug.get(block.id)
                  if (!meta) return null
                  const alt = (locale === 'vi' && meta.alt_vi ? meta.alt_vi : meta.alt_en) || block.id
                  const caption = locale === 'vi' && meta.caption_vi ? meta.caption_vi : meta.caption_en
                  const src = `/images/blog/charts/${post.slug}/${meta.filename}`
                  return (
                    <figure
                      key={index}
                      data-prose-reveal
                      data-reveal-index={index}
                      className="not-prose my-10 overflow-hidden rounded-2xl border border-[rgb(var(--border)/0.7)] bg-[rgb(var(--surface-card)/0.6)] backdrop-blur-md"
                      style={{
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.04), 0 12px 40px -16px rgb(0 0 0 / 0.6)',
                      }}
                    >
                      <div className="relative aspect-[2/1] w-full bg-[rgb(8_14_22)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={alt}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {caption && (
                        <figcaption className="border-t border-[rgb(var(--border)/0.5)] px-5 py-3 font-mono text-xs leading-relaxed text-[rgb(var(--text-muted))]">
                          <span className="mr-2 text-[rgb(var(--accent))]">
                            {block.isDiagram ? 'fig' : 'chart'} ·
                          </span>
                          {caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                }
                if (block.kind === 'references') {
                  if (refs.length === 0) return null
                  return (
                    <section
                      key={index}
                      data-prose-reveal
                      data-reveal-index={index}
                      className="not-prose my-12 rounded-2xl border border-[rgb(var(--border)/0.7)] bg-[rgb(var(--surface-card)/0.5)] p-6 backdrop-blur-md"
                    >
                      <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-[rgb(var(--accent))]">
                        {locale === 'vi' ? 'Tham khảo' : 'References'}
                      </h2>
                      <ol className="space-y-4 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                        {refs.map((r, i) => {
                          const note = locale === 'vi' && r.note_vi ? r.note_vi : r.note_en
                          return (
                            <li key={r.key ?? i} className="flex gap-3">
                              <span className="mt-0.5 inline-block w-6 shrink-0 font-mono text-[11px] text-[rgb(var(--text-muted))]">
                                [{i + 1}]
                              </span>
                              <span className="flex-1">
                                <span className="text-[rgb(var(--text-primary))]">
                                  {r.authors}
                                </span>{' '}
                                <span className="text-[rgb(var(--text-muted))]">({r.year}).</span>{' '}
                                {r.url ? (
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[rgb(var(--accent))] underline-offset-2 hover:underline"
                                  >
                                    {r.title}
                                  </a>
                                ) : (
                                  <span className="text-[rgb(var(--accent))]">{r.title}</span>
                                )}
                                {r.venue ? (
                                  <span className="text-[rgb(var(--text-muted))]"> · {r.venue}</span>
                                ) : null}
                                {note ? (
                                  <span className="mt-1 block text-xs text-[rgb(var(--text-muted))]">
                                    {note}
                                  </span>
                                ) : null}
                              </span>
                            </li>
                          )
                        })}
                      </ol>
                    </section>
                  )
                }
                // default paragraph
                return (
                  <p key={index} data-prose-reveal data-reveal-index={index}>
                    {block.text}
                  </p>
                )
              })}
            </div>
          </article>

          {/* Divider + next/prev navigation */}
          <div className="mt-16 border-t border-[rgb(var(--border))] pt-8">
            <div className="flex items-center justify-between gap-4 font-mono text-sm">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group flex max-w-[45%] flex-col gap-1 text-[rgb(var(--text-muted))] transition-colors duration-200 hover:text-[rgb(var(--accent))]"
                >
                  <motion.div
                    className="flex flex-col gap-1"
                    whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                    transition={{
                      type: 'spring',
                      stiffness: 140,
                      damping: 22,
                    }}
                  >
                    <span className="text-xs uppercase tracking-wider">← prev post</span>
                    <span className="line-clamp-2 text-xs leading-snug text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--accent))]">
                      {pickLocalized(prevPost as unknown as Record<string, unknown>, 'title', locale)}
                    </span>
                  </motion.div>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group flex max-w-[45%] flex-col items-end gap-1 text-right text-[rgb(var(--text-muted))] transition-colors duration-200 hover:text-[rgb(var(--accent))]"
                >
                  <motion.div
                    className="flex flex-col gap-1"
                    whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                    transition={{
                      type: 'spring',
                      stiffness: 140,
                      damping: 22,
                    }}
                  >
                    <span className="text-xs uppercase tracking-wider">next post →</span>
                    <span className="line-clamp-2 text-xs leading-snug text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--accent))]">
                      {pickLocalized(nextPost as unknown as Record<string, unknown>, 'title', locale)}
                    </span>
                  </motion.div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Back link */}
          <div className="mt-8 font-mono text-xs text-[rgb(var(--text-muted))]">
            <Link
              href="/blog"
              className="transition-colors hover:text-[rgb(var(--accent))]"
            >
              <motion.span
                className="inline-flex"
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                transition={{
                  type: 'spring',
                  stiffness: 140,
                  damping: 22,
                }}
              >
                {t('blog.backAll')}
              </motion.span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
