'use client'

import { useLocale } from '@/lib/i18n'
import PhotoCard from './photo-card'

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

interface PhotoGalleryProps {
  films: FilmData[]
}

export default function PhotoGallery({ films }: PhotoGalleryProps) {
  const { t } = useLocale()

  return (
    <section className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 py-16">
      <div className="mb-14 flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[rgb(var(--accent))]">
          {t('cinema.galleryEyebrow')}
        </p>
        <h2 className="text-3xl font-semibold text-[rgb(var(--text-primary))] sm:text-4xl lg:text-5xl">
          {t('cinema.galleryTitle')}
        </h2>
        <p className="max-w-3xl font-mono text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
          {t('cinema.galleryBody')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
        {films.map((film, index) => (
          <PhotoCard key={film.slug} film={film} index={index} />
        ))}
      </div>
    </section>
  )
}
