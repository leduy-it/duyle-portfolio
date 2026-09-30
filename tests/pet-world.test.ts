import test from 'node:test'
import assert from 'node:assert/strict'
import { createStarterSave, parsePetSave, serializePetSave } from '../src/lib/pets/save'
import { collectFactory, hatchEgg, evolvePet, awardArenaWin } from '../src/lib/pets/progression'
const now = 1_000_000

test('new world is furnished, playable, and saved progression round trips', () => {
  const seed = createStarterSave(now)
  assert.equal(seed.pets.length, 4)
  assert.ok(seed.furniture.length >= 4)
  assert.ok(seed.eggs[0].readyAt <= now)
  assert.deepEqual(parsePetSave(serializePetSave(seed), now), seed)
  assert.equal(parsePetSave('{broken', now).version, 2)
  assert.equal(parsePetSave(JSON.stringify({ ...seed, coins: -100 }), now).coins, seed.coins)
})
test('hatching consumes one egg, never repeats, and rejects early hatches', () => {
  const s = createStarterSave(now),
    egg = s.eggs[0]
  assert.equal(
    hatchEgg({ ...s, eggs: [{ ...egg, readyAt: now + 1000 }] }, egg.id, now).pets.length,
    4
  )
  const hatched = hatchEgg(s, egg.id, now)
  assert.equal(hatched.pets.length, 5)
  assert.equal(hatched.eggs.length, 0)
  assert.deepEqual(hatchEgg(hatched, egg.id, now), hatched)
})
test('factory caps offline production and collecting twice never pays twice', () => {
  const s = createStarterSave(now)
  const once = collectFactory(s, now)
  assert.ok(once.coins > s.coins)
  assert.deepEqual(collectFactory(once, now), once)
  const capped = collectFactory(s, now + 8 * 3600_000),
    longAway = collectFactory(s, now + 80 * 3600_000)
  assert.equal(capped.coins, longAway.coins)
  assert.equal(capped.materials, longAway.materials)
})
test('evolution charges exact resources and arena rewards are once per run', () => {
  const s = createStarterSave(now),
    id = s.pets[0].id
  const next = evolvePet(s, id, s.factoryAt)
  assert.equal(next.pets[0].stage, 1)
  assert.equal(next.materials, s.materials - 12)
  assert.deepEqual(evolvePet(next, id, s.factoryAt), next)
  const won = awardArenaWin(s, id, 'run-1')
  assert.ok(won.coins > s.coins)
  assert.ok(won.pets[0].xp > s.pets[0].xp)
  assert.deepEqual(awardArenaWin(won, id, 'run-1'), won)
})


test('evolution settles completed batches at the old rate', () => {
  const s = createStarterSave(now)
  const settled = collectFactory(s, now)
  const evolved = evolvePet(s, s.pets[0].id, now)
  assert.equal(evolved.coins, settled.coins - 60)
  assert.equal(evolved.materials, settled.materials - 12)
  assert.equal(evolved.factoryAt, now)
  assert.equal(collectFactory(evolved, now).coins, evolved.coins)
})

test('hatching discovers an unseen species before a duplicate', () => {
  const s = createStarterSave(now)
  const hatched = hatchEgg(s, s.eggs[0].id, now)
  assert.ok(!s.pets.some(p => p.species === hatched.pets.at(-1)!.species))
})

test('v1 migration preserves owned pets and adds Inko exactly once', () => {
  const original = createStarterSave(now)
  const v1 = { ...original, version: 1, pets: original.pets.filter(p => p.species !== 'inko') }
  const migrated = parsePetSave(JSON.stringify(v1), now)
  assert.equal(migrated.version, 2)
  assert.equal(migrated.pets.filter(p => p.species === 'inko').length, 1)
  assert.deepEqual(migrated.pets.slice(0, v1.pets.length), v1.pets)
  assert.deepEqual(parsePetSave(serializePetSave(migrated), now), migrated)
})
