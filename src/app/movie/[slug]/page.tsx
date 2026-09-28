import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FilmDetailView } from '@/components/photography/film-detail-view'
import { buildMetadataOg } from '@/lib/og-meta'
import films from '@/data/films.json'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return films.map((film) => ({ slug: film.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const film = films.find((f) => f.slug === slug)
  if (!film) return { title: 'Not found — leduy.py' }
  return buildMetadataOg({
    title: `${film.title} (${film.year}) — leduy.py / cinema`,
    description: film.tagline,
    route: 'cinema-detail',
  })
}

export default async function FilmDetailPage({ params }: PageProps) {
  const { slug } = await params
  const film = films.find((f) => f.slug === slug)
  if (!film) notFound()

  return <FilmDetailView film={film} />
}
