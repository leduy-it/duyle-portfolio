import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import filmsData from '@/data/films.json'
import { buildMetadataOg } from '@/lib/og-meta'

export const metadata: Metadata = buildMetadataOg({
  title: 'Cinema — films I keep returning to',
  description: 'Multi-angle notes on the films that lodged themselves in how I think about pacing, restraint, and the cost of saying too much.',
  route: 'cinema',
})
import PhotographyHero from '@/components/photography/photography-hero'

const PhotoGallery = dynamic(
  () => import('@/components/photography/photo-gallery'),
  { loading: () => <div className="max-w-7xl mx-auto px-4 py-12 h-96 animate-pulse" /> }
)

export default function PhotographyPage() {
  return (
    <main className="min-h-screen bg-[rgb(var(--background))]">
      <PhotographyHero />
      <PhotoGallery films={filmsData} />
    </main>
  )
}
