import { AREAS, EGGS, SPECIES, type Area, type EggTier, type Species } from '@/data/pets/catalog'
export const PET_SAVE_KEY = 'duy:pet-world:v1'
export interface OwnedPet {
  id: string
  species: Species
  stage: 0 | 1 | 2
  xp: number
  slot: number
}
export interface OwnedEgg {
  id: string
  tier: EggTier
  readyAt: number
  seed: number
}
export interface PetWorldSaveV1 {
  version: 1
  pets: OwnedPet[]
  eggs: OwnedEgg[]
  coins: number
  materials: number
  selected: string
  area: Area
  serial: number
  factoryAt: number
  boostAt: number
  runs: string[]
  furniture: string[]
}
export function createStarterSave(now = Date.now()): PetWorldSaveV1 {
  return {
    version: 1,
    pets: [
      { id: 'gracie-1', species: 'gracie', stage: 0, xp: 38, slot: 1 },
      { id: 'ember-2', species: 'ember', stage: 0, xp: 20, slot: 6 },
    ],
    eggs: [{ id: 'egg-3', tier: 'meadow', readyAt: now, seed: 2 }],
    coins: 320,
    materials: 24,
    selected: 'gracie-1',
    area: 'habitat',
    serial: 3,
    factoryAt: now - 180_000,
    boostAt: 0,
    runs: [],
    furniture: ['cottage', 'pond', 'orchard', 'garden'],
  }
}
export function readPetSave(raw: string | null, now = Date.now()): PetWorldSaveV1 | null {
  if (!raw) return null
  try {
    const s = JSON.parse(raw)
    const finite = (n: unknown, max = 1_000_000_000): n is number =>
      typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= max
    if (
      s.version !== 1 ||
      !Array.isArray(s.pets) ||
      !s.pets.length ||
      s.pets.length > 36 ||
      !Array.isArray(s.eggs) ||
      s.eggs.length > 12
    )
      throw Error()
    if (
      !s.pets.every(
        (p: OwnedPet) =>
          p &&
          typeof p.id === 'string' &&
          p.id.length <= 80 &&
          SPECIES.includes(p.species) &&
          [0, 1, 2].includes(p.stage) &&
          finite(p.xp) &&
          Number.isInteger(p.slot) &&
          p.slot >= 0 &&
          p.slot < 12
      )
    )
      throw Error()
    if (new Set(s.pets.map((p: OwnedPet) => p.id)).size !== s.pets.length) throw Error()
    if (
      !s.eggs.every(
        (e: OwnedEgg) =>
          e &&
          typeof e.id === 'string' &&
          e.id.length <= 80 &&
          Object.hasOwn(EGGS, e.tier) &&
          finite(e.readyAt, 1e15) &&
          finite(e.seed) &&
          Number.isInteger(e.seed)
      )
    )
      throw Error()
    if (new Set(s.eggs.map((e: OwnedEgg) => e.id)).size !== s.eggs.length) throw Error()
    if (
      !finite(s.coins) ||
      !finite(s.materials) ||
      !finite(s.factoryAt, 1e15) ||
      !finite(s.boostAt, 1e15) ||
      !Number.isSafeInteger(s.serial) ||
      s.serial < 3 ||
      s.serial > 1e9
    )
      throw Error()
    return {
      version: 1,
      pets: s.pets.map((p: OwnedPet) => ({
        id: p.id,
        species: p.species,
        stage: p.stage,
        xp: p.xp,
        slot: p.slot,
      })),
      eggs: s.eggs.map((e: OwnedEgg) => ({
        id: e.id,
        tier: e.tier,
        readyAt: e.readyAt,
        seed: e.seed,
      })),
      coins: s.coins,
      materials: s.materials,
      selected: s.pets.some((p: OwnedPet) => p.id === s.selected) ? s.selected : s.pets[0].id,
      area: AREAS.includes(s.area) ? s.area : 'habitat',
      serial: s.serial,
      factoryAt: Math.min(s.factoryAt, now),
      boostAt: Math.min(s.boostAt, now),
      runs: Array.isArray(s.runs)
        ? s.runs.filter((v: unknown) => typeof v === 'string' && v.length < 100).slice(-50)
        : [],
      furniture: ['cottage', 'pond', 'orchard', 'garden'],
    }
  } catch {
    return null
  }
}
export function parsePetSave(raw: string | null, now = Date.now()): PetWorldSaveV1 {
  return readPetSave(raw, now) || createStarterSave(now)
}
export const serializePetSave = (save: PetWorldSaveV1) => JSON.stringify(save)
