'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { lifeStories, type LifeStory } from '@/data/life-stories'
import { useLocale } from '@/lib/i18n'
import styles from './life-page.module.css'

const words = {
  en: {
    eyebrow: 'THE PERSONAL ARCHIVE / 2021 — NOW',
    title: 'Life, in frames.',
    intro: 'Little days, places, and passing thoughts. A visual diary that keeps growing alongside the work.',
    start: 'Scroll through the days',
    index: 'THE TIMELINE',
    indexTitle: 'The days between everything else.',
    indexBody: 'Photos and short moments, newest first. The original posts are always one click away.',
    watch: 'Watch on Facebook',
    source: 'Open original post',
    storyNote: 'Facebook Stories are temporary. The link may expire.',
    social: 'More in the moment',
    socialBody: 'Follow along where the days happen first.',
    back: 'Back to the portfolio',
    video: 'VIDEO STORY',
  },
  vi: {
    eyebrow: 'NHẬT KÝ CÁ NHÂN / 2021 — NAY',
    title: 'Cuộc sống qua khung hình.',
    intro: 'Những ngày bình thường, nơi đã đi qua và suy nghĩ thoáng chốc. Một nhật ký hình ảnh lớn dần cùng công việc.',
    start: 'Cuộn qua từng ngày',
    index: 'DÒNG THỜI GIAN',
    indexTitle: 'Những ngày giữa mọi hành trình.',
    indexBody: 'Ảnh và khoảnh khắc ngắn, mới nhất ở trên. Mỗi bài đều dẫn về bài đăng gốc.',
    watch: 'Xem trên Facebook',
    source: 'Mở bài đăng gốc',
    storyNote: 'Facebook Story chỉ hiển thị tạm thời. Liên kết có thể hết hạn.',
    social: 'Theo dõi những ngày tiếp theo',
    socialBody: 'Gặp nhau ở nơi những khoảnh khắc xuất hiện đầu tiên.',
    back: 'Về trang portfolio',
    video: 'VIDEO STORY',
  },
} as const

function SlicedMedia({ story }: { story: LifeStory }) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'start 25%'] })
  const topX = useTransform(scrollYProgress, [0, 0.55, 1], [-44, 0, 0])
  const middleX = useTransform(scrollYProgress, [0, 0.55, 1], [48, 0, 0])
  const bottomX = useTransform(scrollYProgress, [0, 0.55, 1], [-28, 0, 0])
  const slicesOpacity = useTransform(scrollYProgress, [0, 0.52, 0.8], [1, 1, 0])

  if (!story.image || !story.imageAlt) return null

  return (
    <div ref={ref} className={styles.photoStage}>
      <div className={styles.photoFull}>
        {story.kind === 'video' && story.video ? (
          <video className={styles.localVideo} src={story.video} poster={story.image} controls playsInline preload="metadata" aria-label={story.imageAlt} />
        ) : (
          <Image src={story.image} alt={story.imageAlt} fill sizes="(max-width: 780px) 100vw, 58vw" />
        )}
      </div>
      {!reducedMotion && [topX, middleX, bottomX].map((x, index) => (
        <motion.div
          key={index}
          aria-hidden="true"
          className={styles.photoSlice}
          style={{ x, opacity: slicesOpacity, clipPath: `inset(${index * 33.333}% 0 ${100 - (index + 1) * 33.333}% 0)` }}
        >
          <Image src={story.image!} alt="" fill sizes="(max-width: 780px) 100vw, 58vw" />
        </motion.div>
      ))}
      <span className={styles.frameCorner} aria-hidden="true" />
    </div>
  )
}

function StoryRow({ story, index, locale }: { story: LifeStory; index: number; locale: 'en' | 'vi' }) {
  const copy = words[locale]
  return (
    <article className={styles.storyRow} data-life-entry id={story.id}>
      <div className={styles.railCell}>
        <span className={styles.railNumber}>{String(index + 1).padStart(2, '0')}</span>
        <span className={styles.railDot} aria-hidden="true" />
      </div>
      <div className={styles.storyContent}>
        <div className={styles.storyMeta}>
          <time dateTime={story.date}>{story.displayDate}</time>
          <span>{story.source}</span>
        </div>
        <h3>{story.title[locale]}</h3>
        <p>{story.summary[locale]}</p>
        {story.kind === 'photo' || story.kind === 'video' ? (
          <SlicedMedia story={story} />
        ) : (
          <a className={styles.videoFrame} href={story.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${copy.watch}: ${story.title[locale]}`}>
            <span className={styles.videoOrnament} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
            <span className={styles.videoPlay} aria-hidden="true">▶</span>
            <span className={styles.videoLabel}>{copy.video} <span>↗</span></span>
          </a>
        )}
        <div className={styles.storyFooter}>
          <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
            {story.kind === 'external-video' ? copy.watch : copy.source} <span aria-hidden="true">↗</span>
          </a>
          {story.kind === 'external-video' && <small>{copy.storyNote}</small>}
        </div>
      </div>
    </article>
  )
}

export function LifePage() {
  const { locale } = useLocale()
  const copy = words[locale]

  return (
    <div className={styles.lifePage}>
      <section className={styles.hero} aria-labelledby="life-title">
        <div className={styles.heroImage}>
          <Image src="/images/life/instagram-leaf-portrait-2021.jpg" alt="Duy holding a leaf in a black-and-white portrait" fill priority sizes="(max-width: 780px) 100vw, 50vw" />
        </div>
        <div className={styles.heroVeil} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}><span aria-hidden="true">✳</span> {copy.eyebrow}</p>
          <h1 id="life-title">{copy.title}</h1>
          <p className={styles.heroIntro}>{copy.intro}</p>
          <a className={styles.scrollLink} href="#timeline">{copy.start} <span aria-hidden="true">↓</span></a>
        </div>
        <div className={styles.heroIndex} aria-hidden="true"><span>LEDUY.PY</span><span>01 / LIFE</span></div>
      </section>

      <section className={styles.timelineSection} id="timeline" aria-labelledby="timeline-title">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>{copy.index}</p>
          <h2 id="timeline-title">{copy.indexTitle}</h2>
          <p>{copy.indexBody}</p>
        </div>
        <div className={styles.timeline}>
          {lifeStories.map((story, index) => <StoryRow story={story} index={index} locale={locale} key={story.id} />)}
        </div>
      </section>

      <section className={styles.outro}>
        <div>
          <Image className={styles.outroPortrait} src="/images/life/linkedin-portrait.jpeg" width={64} height={64} alt="Duy at a lakeside" />
          <p className={styles.eyebrow}>KEEP IN TOUCH</p>
          <h2>{copy.social}</h2>
          <p>{copy.socialBody}</p>
        </div>
        <div className={styles.socials}>
          <a href="https://www.instagram.com/leduy.py/" target="_blank" rel="noopener noreferrer">Instagram <span>↗</span></a>
          <a href="https://fb.com/duyekko" target="_blank" rel="noopener noreferrer">Facebook <span>↗</span></a>
          <a href="https://www.linkedin.com/in/leduy-it/" target="_blank" rel="noopener noreferrer">LinkedIn <span>↗</span></a>
        </div>
      </section>
      <div className={styles.back}><Link href="/">← {copy.back}</Link></div>
    </div>
  )
}
