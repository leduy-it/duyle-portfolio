import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isAdminRequest } from '@/lib/tracking/admin-auth'
import { buildSummary, recentEvents } from '@/lib/tracking/aggregate'
import { AdminDashboard } from './dashboard'
import { trackingStorageKind } from '@/lib/tracking/store'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Not Found',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  if (!(await isAdminRequest())) {
    notFound()
  }
  const result = await Promise.all([buildSummary({ range: '7d' }), recentEvents(50)]).catch(
    () => null
  )
  if (!result) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-2xl">Analytics storage is unavailable</h1>
        <p className="mt-5 leading-relaxed text-[rgb(var(--text-secondary))]">
          Your login worked. Visitor counts cannot be loaded right now; this does not mean there
          were zero visitors.
        </p>
        <p className="mt-4 text-sm text-[rgb(var(--text-muted))]">
          Check the Redis integration and environment variables on this Vercel deployment, then
          refresh.
        </p>
        <Link href="/admin" className="mt-6 inline-block text-[rgb(var(--accent))] underline">
          Try again
        </Link>
      </section>
    )
  }
  return (
    <AdminDashboard
      initialSummary={result[0]}
      initialEvents={result[1]}
      storageKind={trackingStorageKind()}
    />
  )
}
