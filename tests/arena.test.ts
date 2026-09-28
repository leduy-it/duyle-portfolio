import test from 'node:test'
import assert from 'node:assert/strict'
import { createArena, stepArena, type ArenaState } from '../src/lib/pets/arena-engine'
const idle = { x: 0, y: 0, attack: false }
test('arena movement is frame independent and pauses without advancing', () => {
  const seed = { ...createArena('gracie'), status: 'running' as const }
  let a: ArenaState = seed,
    b: ArenaState = seed
  for (let i = 0; i < 60; i++) a = stepArena(a, { ...idle, x: 1 }, 1 / 60)
  for (let i = 0; i < 30; i++) b = stepArena(b, { ...idle, x: 1 }, 1 / 30)
  assert.ok(a.player.x > seed.player.x)
  assert.ok(Math.abs(a.player.x - b.player.x) < 0.001)
  const paused = { ...a, status: 'ready' as const }
  assert.deepEqual(stepArena(paused, idle, 1), paused)
})
test('contact damage has invulnerability and attacks have a cooldown', () => {
  const seed = {
    ...createArena('gracie'),
    status: 'running' as const,
    enemies: [{ id: 1, x: 320, y: 180, hp: 20, flash: 0 }],
  }
  const hit = stepArena(seed, idle, 1 / 60),
    twice = stepArena(hit, idle, 1 / 60)
  assert.equal(hit.player.hp, seed.player.hp - 1)
  assert.equal(twice.player.hp, hit.player.hp)
  const attack = stepArena(seed, { ...idle, attack: true }, 1 / 60),
    held = stepArena(attack, { ...idle, attack: true }, 1 / 60)
  assert.ok(attack.enemies[0].hp < 20)
  assert.equal(held.enemies[0].hp, attack.enemies[0].hp)
})
test('final wave produces one terminal win and never continues combat', () => {
  const final = {
    ...createArena('gracie'),
    wave: 3,
    status: 'running' as const,
    enemies: [{ id: 1, x: 335, y: 180, hp: 1, flash: 0 }],
  }
  const won = stepArena(final, { ...idle, attack: true }, 1 / 60)
  assert.equal(won.status, 'won')
  assert.deepEqual(stepArena(won, idle, 1), won)
})

test('projectile hits are dodgable and share the contact invulnerability window', () => {
  const seed = {
    ...createArena('gracie'),
    status: 'running' as const,
    projectiles: [
      { x: 320, y: 180, vx: 0, vy: 0, life: 2 },
      { x: 320, y: 180, vx: 0, vy: 0, life: 2 },
    ],
  }
  const hit = stepArena(seed, idle, 1 / 60)
  assert.equal(hit.player.hp, seed.player.hp - 1)
})
