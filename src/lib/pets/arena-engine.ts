import { PETS, type Species } from '@/data/pets/catalog'
export const ARENA_WIDTH = 640,
  ARENA_HEIGHT = 360
export interface Enemy {
  id: number
  x: number
  y: number
  hp: number
  flash: number
  kind?: 'slime' | 'brute' | 'wisp'
  shotCooldown?: number
}
export interface ArenaState {
  player: {
    x: number
    y: number
    hp: number
    maxHp: number
    invincible: number
  }
  enemies: Enemy[]
  projectiles: { x: number; y: number; vx: number; vy: number; life: number }[]
  wave: number
  kills: number
  time: number
  cooldown: number
  slash: number
  status: 'ready' | 'running' | 'won' | 'lost'
  species: Species
  stage: number
  seed: number
}
export interface ArenaInput {
  x: number
  y: number
  attack: boolean
}
function enemies(wave: number, seed: number): Enemy[] {
  return Array.from({ length: wave + 2 }, (_, i) => ({
    id: wave * 10 + i,
    x: i % 2 ? ARENA_WIDTH - 25 : 25,
    y: 35 + ((i * 83 + seed) % 280),
    hp: wave > 1 && i % 3 === 1 ? 5 + wave : 2 + (wave === 3 ? 1 : 0),
    flash: 0,
    kind: wave > 1 && i % 3 === 2 ? 'wisp' : wave > 1 && i % 3 === 1 ? 'brute' : 'slime',
    shotCooldown: 1.2 + i * 0.25,
  }))
}
export function createArena(species: Species, stage = 0, seed = 0): ArenaState {
  const hp = PETS[species].hp + stage * 2
  return {
    player: { x: 320, y: 180, hp, maxHp: hp, invincible: 0 },
    enemies: enemies(1, seed),
    projectiles: [],
    wave: 1,
    kills: 0,
    time: 0,
    cooldown: 0,
    slash: 0,
    status: 'ready',
    species,
    stage,
    seed,
  }
}
export function stepArena(state: ArenaState, input: ArenaInput, delta: number): ArenaState {
  if (state.status !== 'running') return state
  const dt = Math.min(1 / 20, Math.max(0, Number.isFinite(delta) ? delta : 0))
  const s = {
    ...state,
    player: { ...state.player },
    enemies: state.enemies.map((e) => ({ ...e })),
    projectiles: state.projectiles.map((p) => ({ ...p })),
    time: state.time + dt,
    cooldown: Math.max(0, state.cooldown - dt),
    slash: Math.max(0, state.slash - dt),
  }
  const norm = Math.max(1, Math.hypot(input.x, input.y)),
    speed = PETS[s.species].speed + s.stage * 8
  s.player.x = Math.max(20, Math.min(620, s.player.x + (input.x / norm) * speed * dt))
  s.player.y = Math.max(28, Math.min(338, s.player.y + (input.y / norm) * speed * dt))
  s.player.invincible = Math.max(0, s.player.invincible - dt)
  const attack = input.attack && s.cooldown === 0
  if (attack) {
    s.cooldown = 0.42
    s.slash = 0.22
  }
  for (const e of s.enemies) {
    e.flash = Math.max(0, e.flash - dt)
    const dx = s.player.x - e.x,
      dy = s.player.y - e.y,
      d = Math.hypot(dx, dy)
    if (attack && d < 70) {
      e.hp -= PETS[s.species].power + s.stage
      e.flash = 0.15
      e.x -= (dx / Math.max(1, d)) * 18
      e.y -= (dy / Math.max(1, d)) * 18
    }
    if (e.hp <= 0) continue
    const direction = e.kind === 'wisp' ? (d < 95 ? -1 : d > 160 ? 1 : 0) : 1
    const v = (e.kind === 'brute' ? 80 + s.wave * 7 : 38 + s.wave * 9) * dt * direction
    if (d > 1) {
      e.x = Math.max(20, Math.min(620, e.x + (dx / d) * v))
      e.y = Math.max(22, Math.min(338, e.y + (dy / d) * v))
    }
    if (e.kind === 'wisp') {
      e.shotCooldown = (e.shotCooldown ?? 1.5) - dt
      if (e.shotCooldown <= 0 && d > 1) {
        s.projectiles.push({ x: e.x, y: e.y, vx: (dx / d) * 130, vy: (dy / d) * 130, life: 4 })
        e.shotCooldown = 1.8
      }
    }
    if (d < 23 && s.player.invincible === 0) {
      s.player.hp -= 1
      s.player.invincible = 1.1
    }
  }
  for (const p of s.projectiles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.life -= dt
    if (Math.hypot(p.x - s.player.x, p.y - s.player.y) < 18) {
      p.life = 0
      if (s.player.invincible === 0) {
        s.player.hp -= 1
        s.player.invincible = 1.1
      }
    }
  }
  s.projectiles = s.projectiles.filter(
    (p) => p.life > 0 && p.x > 0 && p.x < 640 && p.y > 0 && p.y < 360
  )
  const live = s.enemies.filter((e) => e.hp > 0)
  s.kills += s.enemies.length - live.length
  s.enemies = live
  if (s.player.hp <= 0) s.status = 'lost'
  else if (!live.length) {
    if (s.wave >= 3) s.status = 'won'
    else {
      s.projectiles = []
      s.wave += 1
      s.enemies = enemies(s.wave, s.seed)
      s.player.invincible = 1.5
      s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1)
    }
  }
  return s
}
