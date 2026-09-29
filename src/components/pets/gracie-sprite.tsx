'use client'
import { AtlasPet, type PetLane } from './atlas-pet'
export type GraciePose =
  'idle' | 'greeting' | 'thinking' | 'ready' | 'error' | 'left' | 'right' | 'waiting'
const lanes: Record<GraciePose, PetLane> = {
  idle: 'idle',
  greeting: 'waving',
  thinking: 'running',
  ready: 'review',
  error: 'failed',
  left: 'running-left',
  right: 'running-right',
  waiting: 'waiting',
}
export function GracieSprite({
  pose = 'idle',
  reducedMotion = false,
  className = '',
}: {
  pose?: GraciePose
  stage?: number
  reducedMotion?: boolean
  className?: string
}) {
  return (
    <AtlasPet
      pet="bunny"
      lane={lanes[pose]}
      reducedMotion={reducedMotion}
      follow
      className={`gracie-art ${className}`}
    />
  )
}
