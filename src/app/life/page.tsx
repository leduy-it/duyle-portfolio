import type { Metadata } from 'next'
import { LifePage } from '@/components/life/life-page'

export const metadata: Metadata = {
  title: 'Life, in frames — Duy Le',
  description: 'Everyday moments from Duy Le, collected as a visual timeline beyond the research blog.',
  openGraph: {
    title: 'Life, in frames — Duy Le',
    description: 'A visual timeline of ordinary days, photos, and stories.',
    images: [{ url: '/images/life/instagram-leaf-portrait-2021.jpg', width: 720, height: 900, alt: 'Duy holding a leaf' }],
  },
}

export default function Page() {
  return <LifePage />
}
