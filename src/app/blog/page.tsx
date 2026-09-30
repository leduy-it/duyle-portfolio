import type { Metadata } from 'next'
import blogPosts from '@/data/blog-posts.json'
import BlogHero from '@/components/blog/blog-hero'
import BlogListStagger from '@/components/blog/blog-list-stagger'
import { buildMetadataOg } from '@/lib/og-meta'

export const metadata: Metadata = buildMetadataOg({
  title: 'Research — long-form notes from the production floor',
  description: 'Agentic gates, evaluation economics, OCR backbones, and field notes from shipping AI in Vietnam.',
  route: 'blog',
})

export default function BlogPage() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <BlogHero />
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-8 md:py-16 lg:px-12">
        <BlogListStagger posts={posts} />
      </div>
    </main>
  )
}
