import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { LocaleProvider } from '@/lib/i18n'
import { Header } from '@/components/header'
import { CursorGlow, PageTransition } from '@/components/motion'
import { VisitorTracker } from '@/components/visitor-tracker'
import { MysteryBox } from '@/components/mystery-box'
import { GracieCompanion } from '@/components/pets/gracie-companion'
import { PetSaveProvider } from '@/lib/pets/pet-save-provider'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

import { buildMetadataOg } from '@/lib/og-meta'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3008")),
  ...buildMetadataOg({
  title: 'Duy Le — AI Engineer, OCR & agents',
  description: 'Personal portfolio of Duy Le — AI Engineer working across OCR, Document AI, and LLM agents in Ho Chi Minh City.',
  route: 'home',
  }),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LocaleProvider>
            <PetSaveProvider>
            <CursorGlow />
            <Header />
            <main className="min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <VisitorTracker />
            <MysteryBox />
            <GracieCompanion />
          </PetSaveProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
