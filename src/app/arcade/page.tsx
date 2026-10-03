import type { Metadata } from 'next'
import { ArcadeHub } from '@/components/arcade/arcade-hub'

export const metadata: Metadata = {
  title: 'Arcade — Duy Le',
  description: 'A collection of playable worlds, from quiet flights to tactical battles. Play inside the portfolio.',
}

export default async function ArcadePage({searchParams}: {searchParams: Promise<{game?:string}>}) {
  const {game} = await searchParams
  return <ArcadeHub key={game || 'all'} initialGame={game} />
}
