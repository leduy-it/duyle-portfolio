'use client'

import { motion, useReducedMotion } from 'motion/react'
import BlogPostCard from '@/components/blog/blog-post-card'
import { useLocale } from '@/lib/i18n'

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

interface BlogListStaggerProps {
  posts: BlogPost[]
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export default function BlogListStagger({ posts }: BlogListStaggerProps) {
  const shouldReduceMotion = useReducedMotion()
  const { locale } = useLocale()

  return (
    <div className="relative mx-auto max-w-[1080px] space-y-14 md:space-y-20">
      <div className="pointer-events-none absolute bottom-12 left-[11px] top-5 hidden w-px bg-[rgb(var(--border))] md:block" aria-hidden="true" />
      {posts.map((post, index) => (
        <motion.div
          key={post.slug}
          className="relative grid gap-4 md:grid-cols-[156px_minmax(0,1fr)] md:gap-8"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={
            shouldReduceMotion
              ? undefined
              : { once: true, amount: 0.2, margin: '0px 0px -10% 0px' }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: 0.52,
                  delay: index * 0.08,
                  ease: EASE_OUT_EXPO,
                }
          }
        >
          <div className="relative flex items-start gap-4 pt-1 font-mono text-xs uppercase text-[rgb(var(--text-muted))] md:pt-8">
            <span className="relative z-10 hidden h-[23px] w-[23px] shrink-0 rounded-full border border-[rgb(var(--accent)/0.55)] bg-[rgb(var(--background))] shadow-[0_0_0_5px_rgb(var(--background))] md:block">
              <span className="absolute left-[8px] top-[8px] h-[5px] w-[5px] rounded-full bg-[rgb(var(--accent))]" />
            </span>
            <time dateTime={post.date} className="flex items-baseline gap-2 pt-1 leading-none md:flex-col md:gap-1">
              <span className="text-xl font-semibold tracking-tight text-[rgb(var(--text-primary))] md:text-[30px]">{post.date.slice(8, 10)}</span>
              <span className="whitespace-nowrap text-[10px] tracking-[0.1em] text-[rgb(var(--text-muted))]">
                {new Date(`${post.date}T12:00:00`).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' })}
              </span>
            </time>
          </div>
          <BlogPostCard post={post} />
        </motion.div>
      ))}
    </div>
  )
}
