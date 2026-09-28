import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  async redirects() {
    return [{ source: '/photography', destination: '/movie', permanent: true }, { source: '/photography/:slug', destination: '/movie/:slug', permanent: true }]
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
    ],
  },
}

export default nextConfig
