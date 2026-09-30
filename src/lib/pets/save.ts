import { AREAS, EGGS, SPECIES, type Area, type EggTier, type Species } from '@/data/pets/catalog'
export const PET_SAVE_KEY = 'duy:pet-world:v1'
export const PET_V1_BACKUP_KEY = 'duy:pet-world:backup:v1'
export interface OwnedPet {
  id: string
  species: Species
  stage: 0 | 1 | 2
  xp: number
  slot: number
  position?: { x: number; y: number }
}
export interface OwnedEgg {
  id: string
  tier: EggTier
  readyAt: number
  seed: number
}
export interface PetDecor { id: string; kind: 'bench' | 'lantern' | 'planter'; x: number; y: number }
export const STARTER_DECOR: PetDecor[] = [
  { id: 'bench-1', kind: 'bench', x: 28, y: 76 },
  { id: 'lantern-1', kind: 'lantern', x: 77, y: 56 },
  { id: 'planter-1', kind: 'planter', x: 72, y: 82 },
]
export interface PetWorldSave {
  version: 2
  pets: OwnedPet[]
  eggs: OwnedEgg[]
  coins: number
  materials: number
  selected: string
  area: Area
  serial: number
  factoryAt: number
  factoryRemainder: { coins: number; materials: number }
  boostAt: number
  runs: string[]
  furniture: string[]
  decor: PetDecor[]
}
export function createStarterSave(now = Date.now()): PetWorldSave {
  return {
    version: 2,
    pets: [
      { id: 'gracie-1', species: 'gracie', stage: 0, xp: 38, slot: 1 },
      { id: 'ember-2', species: 'ember', stage: 0, xp: 20, slot: 6 },
      { id: 'inko-4', species: 'inko', stage: 0, xp: 38, slot: 5 },
      { id: 'pip-5', species: 'pip', stage: 0, xp: 20, slot: 9 },
    ],
    eggs: [{ id: 'egg-3', tier: 'meadow', readyAt: now, seed: 2 }],
    coins: 320,
    materials: 24,
    selected: 'gracie-1',
    area: 'habitat',
    serial: 5,
    factoryAt: now - 180_000,
    factoryRemainder: { coins: 0, materials: 0 },
    boostAt: 0,
    runs: [],
    furniture: ['cottage', 'pond', 'orchard', 'garden'],
    decor: STARTER_DECOR.map(item => ({ ...item })),
  }
}
export function readPetSave(raw: string | null, now = Date.now()): PetWorldSave | null {
  if (!raw) return null
  try {
    const s = JSON.parse(raw)
    const finite = (n: unknown, max = 1_000_000_000): n is number =>
      typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= max
    if (
      ![1, 2].includes(s.version) ||
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
          p.slot < 12 &&
          (p.position === undefined || (p.position && finite(p.position.x, 84) && p.position.x >= 14 && finite(p.position.y, 85) && p.position.y >= 46))
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
    const migrated = s.version === 1 && !s.pets.some((p: OwnedPet) => p.species === 'inko') && s.pets.length + s.eggs.length < 36
    const elapsed = migrated ? Math.min(8 * 3600_000, Math.max(0, now - s.factoryAt)) / 60_000 : 0
    const earnedCoins = elapsed * s.pets.reduce((total: number, p: OwnedPet) => total + 2 + p.stage, 0)
    const earnedMaterials = elapsed * s.pets.length
    const serial = migrated ? s.serial + 1 : s.serial
    const pets: OwnedPet[] = migrated ? [...s.pets, { id: `inko-migration-${serial}`, species: 'inko', stage: 0, xp: 38, slot: 5 }] : s.pets
    if (s.version === 2 && (!s.factoryRemainder || !finite(s.factoryRemainder.coins, 1) || !finite(s.factoryRemainder.materials, 1))) throw Error()
    return {
      version: 2,
      pets: pets.map((p: OwnedPet) => ({
        id: p.id,
        species: p.species,
        stage: p.stage,
        xp: p.xp,
        slot: p.slot,
        ...(p.position ? { position: { x: p.position.x, y: p.position.y } } : {}),
      })),
      eggs: s.eggs.map((e: OwnedEgg) => ({
        id: e.id,
        tier: e.tier,
        readyAt: e.readyAt,
        seed: e.seed,
      })),
      coins: Math.min(999_999_999, s.coins + Math.floor(earnedCoins)),
      materials: Math.min(999_999_999, s.materials + Math.floor(earnedMaterials)),
      selected: s.pets.some((p: OwnedPet) => p.id === s.selected) ? s.selected : s.pets[0].id,
      area: AREAS.includes(s.area) ? s.area : 'habitat',
      serial,
      factoryAt: migrated ? now : Math.min(s.factoryAt, now),
      factoryRemainder: s.version === 2 ? s.factoryRemainder : { coins: earnedCoins % 1, materials: earnedMaterials % 1 },
      boostAt: Math.min(s.boostAt, now),
      runs: Array.isArray(s.runs)
        ? s.runs.filter((v: unknown) => typeof v === 'string' && v.length < 100).slice(-50)
        : [],
      furniture: Array.isArray(s.furniture) ? s.furniture.filter((item: unknown) => typeof item === 'string' && item.length <= 80).slice(0, 30) : ['cottage', 'pond', 'orchard', 'garden'],
      decor: Array.isArray(s.decor) && s.decor.length <= 12 && new Set(s.decor.map((item: PetDecor) => item?.id)).size === s.decor.length && s.decor.every((item: PetDecor) => item && typeof item.id === 'string' && item.id.length <= 80 && ['bench', 'lantern', 'planter'].includes(item.kind) && finite(item.x, 88) && item.x >= 12 && finite(item.y, 90) && item.y >= 45) ? s.decor.map((item: PetDecor) => ({ id: item.id, kind: item.kind, x: item.x, y: item.y })) : STARTER_DECOR.map(item => ({ ...item })),
    }
  } catch {
    return null
  }
}
export function parsePetSave(raw: string | null, now = Date.now()): PetWorldSave {
  return readPetSave(raw, now) || createStarterSave(now)
}
export const serializePetSave = (save: PetWorldSave) => JSON.stringify(save)
