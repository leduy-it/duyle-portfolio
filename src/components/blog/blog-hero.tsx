'use client'

import dynamic from 'next/dynamic'
import { useMemo, useSyncExternalStore } from 'react'
import { useLocale } from '@/lib/i18n'

const BlogThreeCanvas = dynamic(
  () => import('@/components/blog/blog-three-canvas'),
  { ssr: false }
)

interface Intro {
  eyebrow: string
  title: string
  body: string
}

const INTROS_EN: Intro[] = [
  {
    eyebrow: 'research · long-form notes',
    title: 'Notes from the production floor',
    body: 'Long-form writing on AI engineering, production systems, and the honest gap between a benchmark and a bank customer counting seconds.',
  },
  {
    eyebrow: 'research · field notes',
    title: 'What ships, what breaks, what teaches',
    body: 'OCR backbones, Text-to-SQL agents, latency war stories — the parts of the job that never make the demo reel but always make the difference.',
  },
  {
    eyebrow: 'notes · published slowly',
    title: 'Long-form on AI that has to actually work',
    body: 'Less hot-takes, more late-night pattern recognition. Each post earns its keep by being the thing I wish someone had written before I learned it the hard way.',
  },
  {
    eyebrow: 'production diaries',
    title: 'Field notes from shipping AI in Vietnam',
    body: 'Saigon late nights, bank customers counting seconds out loud, models that look fine until the document arrives crooked. The honest middle of production.',
  },
  {
    eyebrow: 'engineering reflections',
    title: 'Things production AI keeps teaching me',
    body: 'On retraining instead of fine-tuning. On agents that know when to say less. On latency as empathy with a stopwatch. On the moments engineering becomes a moral choice.',
  },
  {
    eyebrow: 'research · in the open',
    title: 'Lessons I had to live to learn',
    body: 'Notes I keep writing because the same instincts keep proving wrong, the same systems keep needing better spines, and the work keeps being more honest than the demo.',
  },
]

const INTROS_VI: Intro[] = [
  {
    eyebrow: 'nghiên cứu · ghi chú dài',
    title: 'Ghi chú từ tầng sản xuất',
    body: 'Văn dài về kỹ thuật AI, hệ thống production, và khoảng cách thật thà giữa một benchmark và một khách hàng ngân hàng đang đếm từng giây.',
  },
  {
    eyebrow: 'nghiên cứu · field notes',
    title: 'Cái gì ship, cái gì vỡ, cái gì dạy mình',
    body: 'OCR backbone, agent Text-to-SQL, những trận chiến latency — phần của công việc không bao giờ lên demo reel nhưng luôn tạo ra khác biệt.',
  },
  {
    eyebrow: 'ghi chú · xuất bản chậm',
    title: 'Văn dài về AI thực sự phải hoạt động',
    body: 'Ít hot-take, nhiều nhận diện pattern lúc nửa đêm. Mỗi bài kiếm chỗ đứng vì nó là thứ tôi ước có ai đó viết trước khi tôi học bằng cách khó.',
  },
  {
    eyebrow: 'nhật ký production',
    title: 'Field notes từ ship AI ở Việt Nam',
    body: 'Đêm muộn Sài Gòn, khách hàng ngân hàng đếm giây ra tiếng, model trông ổn cho đến khi tài liệu đến lệch trang. Phần lưng chừng thật thà của production.',
  },
  {
    eyebrow: 'suy ngẫm kỹ thuật',
    title: 'Những điều AI production cứ dạy tôi',
    body: 'Về retrain thay vì fine-tune. Về agent biết khi nào nên nói ít hơn. Về latency như sự đồng cảm với đồng hồ bấm giờ. Về khoảnh khắc kỹ thuật trở thành lựa chọn đạo đức.',
  },
  {
    eyebrow: 'nghiên cứu · viết công khai',
    title: 'Bài học tôi phải sống mới hiểu',
    body: 'Ghi chú tôi cứ viết vì cùng một bản năng cứ chứng minh là sai, cùng những hệ thống cứ cần một xương sống tốt hơn, và công việc cứ thật hơn demo.',
  },
]

export default function BlogHero() {
  const { t, locale } = useLocale()
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const pool = locale === 'vi' ? INTROS_VI : INTROS_EN
  const introIndex = useMemo(() => {
    const seed = `${locale}:${t('blog.heading')}:${pool.length}`
    return Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % pool.length
  }, [locale, pool.length, t])
  const intro = useMemo<Intro>(() => {
    if (!hasHydrated) {
      return {
        eyebrow: t('blog.eyebrow'),
        title: t('blog.heading'),
        body: t('blog.intro'),
      }
    }

    return pool[introIndex] ?? pool[0]
  }, [hasHydrated, introIndex, pool, t])

  return (
    <section className="relative overflow-hidden border-b border-[rgb(var(--border))] bg-[rgb(var(--surface-page))]">
      {/* Ambient glow backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 70% at 80% 50%, rgb(var(--accent) / 0.08), transparent 55%)',
        }}
      />
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgb(var(--border)) 1px, transparent 1px), linear-gradient(rgb(var(--border)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto flex min-h-[48vh] max-w-[1440px] flex-col items-center gap-10 px-6 py-16 sm:px-8 lg:flex-row lg:px-12 lg:py-20">
        {/* Left: text column */}
        <div className="flex flex-1 flex-col justify-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-[rgb(var(--accent))]">
            {intro.eyebrow}
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[rgb(var(--text-primary))] sm:text-5xl lg:text-6xl">
            {intro.title}
          </h1>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
            {intro.body}
          </p>
        </div>

        {/* Right: Three.js canvas */}
        <div
          className="relative w-full shrink-0 overflow-hidden rounded-2xl lg:w-[420px] lg:self-stretch"
          style={{
            minHeight: '260px',
            boxShadow: '0 0 80px -24px rgb(var(--accent) / 0.18)',
          }}
          aria-hidden="true"
        >
          <BlogThreeCanvas />
        </div>
      </div>
    </section>
  )
}
