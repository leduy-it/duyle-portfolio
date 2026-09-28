import { EGGS, EVOLUTION, type EggTier } from '@/data/pets/catalog'
import type { PetWorldSaveV1 } from './save'
export const FACTORY_CAP_MS = 8 * 3600_000
const clamp = (n: number) => Math.min(999_999_999, Math.max(0, n))
export function factoryYield(s: PetWorldSaveV1, now: number) {
  const minutes = Math.floor(Math.min(FACTORY_CAP_MS, Math.max(0, now - s.factoryAt)) / 60_000)
  return {
    minutes,
    coins: minutes * s.pets.reduce((n, p) => n + 2 + p.stage, 0),
    materials: minutes * s.pets.length,
  }
}
export function collectFactory(s: PetWorldSaveV1, now: number): PetWorldSaveV1 {
  const yieldNow = factoryYield(s, now)
  if (!yieldNow.minutes) return s
  return {
    ...s,
    coins: clamp(s.coins + yieldNow.coins),
    materials: clamp(s.materials + yieldNow.materials),
    factoryAt: now - s.factoryAt >= FACTORY_CAP_MS ? now : s.factoryAt + yieldNow.minutes * 60_000,
  }
}
export function buyEgg(s: PetWorldSaveV1, tier: EggTier, now: number): PetWorldSaveV1 {
  const egg = EGGS[tier]
  if (!egg || s.coins < egg.price || s.eggs.length >= 12 || s.pets.length + s.eggs.length >= 36)
    return s
  const serial = s.serial + 1
  return {
    ...s,
    serial,
    coins: s.coins - egg.price,
    eggs: [
      ...s.eggs,
      {
        id: `egg-${serial}`,
        tier,
        seed: serial * 7919,
        readyAt: now + egg.wait,
      },
    ],
  }
}
export function warmEgg(s: PetWorldSaveV1, id: string, now: number): PetWorldSaveV1 {
  if (now - s.boostAt < 750) return s
  const egg = s.eggs.find((e) => e.id === id)
  if (!egg || egg.readyAt <= now) return s
  return {
    ...s,
    boostAt: now,
    eggs: s.eggs.map((e) => (e.id === id ? { ...e, readyAt: Math.max(now, e.readyAt - 8000) } : e)),
  }
}
export function hatchEgg(s: PetWorldSaveV1, id: string, now: number): PetWorldSaveV1 {
  const egg = s.eggs.find((e) => e.id === id)
  if (!egg || egg.readyAt > now || s.pets.length >= 36) return s
  const pool = EGGS[egg.tier].roster
  const species = pool[egg.seed % pool.length]
  const settled = collectFactory(s, now)
  const pet = {
    id: `pet-${s.serial + 1}`,
    species,
    stage: 0 as const,
    xp: 10,
    slot: s.pets.length % 12,
  }
  return {
    ...settled,
    serial: s.serial + 1,
    eggs: s.eggs.filter((e) => e.id !== id),
    pets: [...s.pets, pet],
    selected: pet.id,
  }
}
export function placePet(s: PetWorldSaveV1, id: string, slot: number): PetWorldSaveV1 {
  if (!Number.isInteger(slot) || slot < 0 || slot >= 12 || !s.pets.some((p) => p.id === id))
    return s
  return { ...s, pets: s.pets.map((p) => (p.id === id ? { ...p, slot } : p)) }
}
export function evolvePet(s: PetWorldSaveV1, id: string): PetWorldSaveV1 {
  const pet = s.pets.find((p) => p.id === id)
  if (!pet || pet.stage >= 2) return s
  const cost = EVOLUTION[pet.stage]
  if (!cost || pet.xp < cost.xp || s.materials < cost.materials || s.coins < cost.coins) return s
  return {
    ...s,
    coins: s.coins - cost.coins,
    materials: s.materials - cost.materials,
    pets: s.pets.map((p) => (p.id === id ? { ...p, stage: (p.stage + 1) as 1 | 2 } : p)),
  }
}
export function cheerPet(s: PetWorldSaveV1, id: string, now: number): PetWorldSaveV1 {
  if (now - s.boostAt < 1000 || !s.pets.some((p) => p.id === id)) return s
  return {
    ...s,
    boostAt: now,
    coins: clamp(s.coins + 2),
    materials: clamp(s.materials + 1),
    pets: s.pets.map((p) => (p.id === id ? { ...p, xp: clamp(p.xp + 3) } : p)),
  }
}
export function awardArenaWin(s: PetWorldSaveV1, id: string, run: string): PetWorldSaveV1 {
  if (!run || run.length > 90 || s.runs.includes(run) || !s.pets.some((p) => p.id === id)) return s
  return {
    ...s,
    coins: clamp(s.coins + 90),
    materials: clamp(s.materials + 12),
    pets: s.pets.map((p) => (p.id === id ? { ...p, xp: clamp(p.xp + 25) } : p)),
    runs: [...s.runs, run].slice(-50),
  }
}
