import test from 'node:test'
import assert from 'node:assert/strict'
import { createStarterSave, parsePetSave, serializePetSave } from '../src/lib/pets/save'
import { collectFactory, hatchEgg, evolvePet, awardArenaWin } from '../src/lib/pets/progression'
const now = 1_000_000

test('new world is furnished, playable, and saved progression round trips', () => {
  const seed = createStarterSave(now)
  assert.equal(seed.pets.length, 2)
  assert.ok(seed.furniture.length >= 4)
  assert.ok(seed.eggs[0].readyAt <= now)
  assert.deepEqual(parsePetSave(serializePetSave(seed), now), seed)
  assert.equal(parsePetSave('{broken', now).version, 1)
  assert.equal(parsePetSave(JSON.stringify({ ...seed, coins: -100 }), now).coins, seed.coins)
})
test('hatching consumes one egg, never repeats, and rejects early hatches', () => {
  const s = createStarterSave(now),
    egg = s.eggs[0]
  assert.equal(
    hatchEgg({ ...s, eggs: [{ ...egg, readyAt: now + 1000 }] }, egg.id, now).pets.length,
    2
  )
  const hatched = hatchEgg(s, egg.id, now)
  assert.equal(hatched.pets.length, 3)
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
  const next = evolvePet(s, id)
  assert.equal(next.pets[0].stage, 1)
  assert.equal(next.materials, s.materials - 12)
  assert.deepEqual(evolvePet(next, id), next)
  const won = awardArenaWin(s, id, 'run-1')
  assert.ok(won.coins > s.coins)
  assert.ok(won.pets[0].xp > s.pets[0].xp)
  assert.deepEqual(awardArenaWin(won, id, 'run-1'), won)
})
