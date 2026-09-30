import { EGGS, EVOLUTION, type EggTier } from '@/data/pets/catalog'
import type { PetWorldSave } from './save'
export const FACTORY_CAP_MS = 8 * 3600_000
const clamp = (n: number) => Math.min(999_999_999, Math.max(0, n))
export function factoryYield(s: PetWorldSave, now: number) {
  const minutes = Math.floor(Math.min(FACTORY_CAP_MS, Math.max(0, now - s.factoryAt)) / 60_000)
  return {
    minutes,
    coins: minutes * s.pets.reduce((n, p) => n + 2 + p.stage, 0),
    materials: minutes * s.pets.length,
  }
}
export function collectFactory(s: PetWorldSave, now: number): PetWorldSave {
  const yieldNow = factoryYield(s, now)
  if (!yieldNow.minutes) return s
  return {
    ...s,
    coins: clamp(s.coins + yieldNow.coins),
    materials: clamp(s.materials + yieldNow.materials),
    factoryAt: now - s.factoryAt >= FACTORY_CAP_MS ? now : s.factoryAt + yieldNow.minutes * 60_000,
  }
}
/** Settle fractional work before changing the crew/rate; carry sub-coin credit. */
export function settleFactoryChange(s: PetWorldSave, now: number): PetWorldSave {
  const minutes = Math.min(FACTORY_CAP_MS, Math.max(0, now - s.factoryAt)) / 60_000
  const coins = minutes * s.pets.reduce((n, p) => n + 2 + p.stage, 0) + s.factoryRemainder.coins
  const materials = minutes * s.pets.length + s.factoryRemainder.materials
  return {
    ...s,
    coins: clamp(s.coins + Math.floor(coins)),
    materials: clamp(s.materials + Math.floor(materials)),
    factoryAt: Math.max(now, s.factoryAt),
    factoryRemainder: { coins: coins - Math.floor(coins), materials: materials - Math.floor(materials) },
  }
}
export function buyEgg(s: PetWorldSave, tier: EggTier, now: number): PetWorldSave {
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
export function warmEgg(s: PetWorldSave, id: string, now: number): PetWorldSave {
  if (now - s.boostAt < 750) return s
  const egg = s.eggs.find((e) => e.id === id)
  if (!egg || egg.readyAt <= now) return s
  return {
    ...s,
    boostAt: now,
    eggs: s.eggs.map((e) => (e.id === id ? { ...e, readyAt: Math.max(now, e.readyAt - 8000) } : e)),
  }
}
export function hatchEgg(s: PetWorldSave, id: string, now: number): PetWorldSave {
  const egg = s.eggs.find((e) => e.id === id)
  if (!egg || egg.readyAt > now || s.pets.length >= 36) return s
  const pool = EGGS[egg.tier].roster
  const unseen = pool.filter(species => !s.pets.some(p => p.species === species))
  const candidates = unseen.length ? unseen : pool
  const species = candidates[egg.seed % candidates.length]
  const settled = settleFactoryChange(s, now)
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
export function placePet(s: PetWorldSave, id: string, slot: number, position?: { x: number; y: number }): PetWorldSave {
  if (!Number.isInteger(slot) || slot < 0 || slot >= 12 || !s.pets.some((p) => p.id === id))
    return s
  if (position && (!Number.isFinite(position.x) || !Number.isFinite(position.y) || position.x < 14 || position.x > 84 || position.y < 46 || position.y > 85)) return s
  return { ...s, pets: s.pets.map((p) => (p.id === id ? { ...p, slot, position } : p)) }
}
export function evolvePet(s: PetWorldSave, id: string, now = Date.now()): PetWorldSave {
  const pet = s.pets.find((p) => p.id === id)
  if (!pet || pet.stage >= 2) return s
  const cost = EVOLUTION[pet.stage]
  if (!cost || pet.xp < cost.xp || s.materials < cost.materials || s.coins < cost.coins) return s
  const settled = settleFactoryChange(s, now)
  return {
    ...settled,
    factoryAt: now,
    coins: settled.coins - cost.coins,
    materials: settled.materials - cost.materials,
    pets: s.pets.map((p) => (p.id === id ? { ...p, stage: (p.stage + 1) as 1 | 2 } : p)),
  }
}
export function cheerPet(s: PetWorldSave, id: string, now: number): PetWorldSave {
  if (now - s.boostAt < 1000 || !s.pets.some((p) => p.id === id)) return s
  return {
    ...s,
    boostAt: now,
    coins: clamp(s.coins + 2),
    materials: clamp(s.materials + 1),
    pets: s.pets.map((p) => (p.id === id ? { ...p, xp: clamp(p.xp + 3) } : p)),
  }
}
export function awardArenaWin(s: PetWorldSave, id: string, run: string): PetWorldSave {
  if (!run || run.length > 90 || s.runs.includes(run) || !s.pets.some((p) => p.id === id)) return s
  return {
    ...s,
    coins: clamp(s.coins + 90),
    materials: clamp(s.materials + 12),
    pets: s.pets.map((p) => (p.id === id ? { ...p, xp: clamp(p.xp + 25) } : p)),
    runs: [...s.runs, run].slice(-50),
  }
}
