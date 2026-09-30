import { PETS, type Species } from "@/data/pets/catalog";
import {
  BOSS_GROVE,
  CAMP,
  SHRINES,
  distance,
  moveBody,
  random,
  type Point,
} from "./world";
export type EnemyKind = "crawler" | "charger" | "wisp" | "warden";
export interface Enemy extends Point {
  id: number;
  kind: EnemyKind;
  home: Point;
  shrine: number;
  hp: number;
  maxHp: number;
  cooldown: number;
  warning: number;
  target: Point;
  flash: number;
  phase: number;
}
export interface Particle extends Point {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}
export interface Pickup extends Point {
  id: number;
  kind: "xp" | "heart";
  value: number;
}
export interface Projectile extends Point {
  vx: number;
  vy: number;
  life: number;
  radius: number;
}
export interface Expedition {
  version: 1;
  run: string;
  species: Species;
  stage: number;
  time: number;
  status: "ready" | "running" | "won" | "lost";
  player: Point & {
    hp: number;
    maxHp: number;
    facing: number;
    moving: boolean;
    invincible: number;
    dash: number;
    dashCooldown: number;
    burstCooldown: number;
    attackCooldown: number;
    slash: number;
    combo: number;
    comboTime: number;
  };
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  pickups: Pickup[];
  shrines: boolean[];
  kills: number;
  xp: number;
  level: number;
  choice: boolean;
  power: number;
  haste: number;
  magnet: number;
  bossSpawned: boolean;
  shake: number;
  burst: number;
  message: "start" | "shrine" | "boss" | "upgrade" | "win" | "none";
  messageTime: number;
}
export interface Input {
  x: number;
  y: number;
  attack: boolean;
  dash: boolean;
  burst: boolean;
  aim?: number;
}
export const EMPTY_INPUT: Input = {
  x: 0,
  y: 0,
  attack: false,
  dash: false,
  burst: false,
};
export function createExpedition(
  species: Species,
  stage = 0,
  run = "preview",
): Expedition {
  const rng = random(921),
    enemies: Enemy[] = [];
  SHRINES.forEach((home, shrine) => {
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5,
        kind: EnemyKind = i === 4 ? "wisp" : i % 2 ? "charger" : "crawler",
        hp = kind === "charger" ? 14 : kind === "wisp" ? 9 : 8;
      enemies.push({
        id: enemies.length,
        kind,
        x: home.x + Math.cos(a) * 125,
        y: home.y + Math.sin(a) * 125,
        home,
        shrine,
        hp,
        maxHp: hp,
        cooldown: 1 + rng(),
        warning: 0,
        target: { ...home },
        flash: 0,
        phase: 0,
      });
    }
  });
  const maxHp = PETS[species].hp + stage * 2 + 4;
  return {
    version: 1,
    run,
    species,
    stage,
    time: 0,
    status: "ready",
    player: {
      ...CAMP,
      hp: maxHp,
      maxHp,
      facing: -Math.PI / 2,
      moving: false,
      invincible: 0,
      dash: 0,
      dashCooldown: 0,
      burstCooldown: 0,
      attackCooldown: 0,
      slash: 0,
      combo: 0,
      comboTime: 0,
    },
    enemies,
    projectiles: [],
    particles: [],
    pickups: [],
    shrines: [false, false, false],
    kills: 0,
    xp: 0,
    level: 1,
    choice: false,
    power: 0,
    haste: 0,
    magnet: 0,
    bossSpawned: false,
    shake: 0,
    burst: 0,
    message: "start",
    messageTime: 6,
  };
}
function sparks(s: Expedition, at: Point, color: string, count = 10) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + s.time,
      life = 0.3 + (i % 4) * 0.12;
    s.particles.push({
      ...at,
      vx: Math.cos(a) * (50 + (i % 3) * 40),
      vy: Math.sin(a) * (50 + (i % 3) * 40),
      life,
      maxLife: life,
      color,
      size: 2 + (i % 3),
    });
  }
}
function hurt(s: Expedition, damage = 1) {
  if (s.player.invincible > 0 || s.player.dash > 0) return;
  s.player.hp = Math.max(0, s.player.hp - damage);
  s.player.invincible = 0.95;
  s.shake = 0.2;
  sparks(s, s.player, "#e8a79a", 9);
}
export function upgrade(
  s: Expedition,
  pick: "power" | "haste" | "vitality",
): Expedition {
  if (!s.choice) return s;
  const next = {
    ...s,
    player: { ...s.player },
    choice: false,
    message: "upgrade" as const,
    messageTime: 2,
  };
  if (pick === "power") next.power += 1;
  else if (pick === "haste") {
    next.haste += 1;
    next.magnet += 25;
  } else {
    next.player.maxHp += 3;
    next.player.hp = Math.min(next.player.maxHp, next.player.hp + 5);
  }
  return next;
}
export function stepExpedition(
  original: Expedition,
  input: Input,
  delta: number,
): Expedition {
  if (original.status !== "running" || original.choice) return original;
  const dt = Math.min(0.035, Math.max(0, Number.isFinite(delta) ? delta : 0));
  const s: Expedition = {
    ...original,
    player: { ...original.player },
    enemies: original.enemies.map((e) => ({ ...e })),
    projectiles: original.projectiles.map((p) => ({ ...p })),
    particles: original.particles.map((p) => ({ ...p })),
    pickups: original.pickups.map((p) => ({ ...p })),
    shrines: [...original.shrines],
  };
  const p = s.player;
  s.time += dt;
  for (const key of [
    "invincible",
    "dash",
    "dashCooldown",
    "burstCooldown",
    "attackCooldown",
    "slash",
    "comboTime",
  ] as const)
    p[key] = Math.max(0, p[key] - dt);
  s.shake = Math.max(0, s.shake - dt);
  s.burst = Math.max(0, s.burst - dt);
  s.messageTime = Math.max(0, s.messageTime - dt);
  const norm = Math.max(1, Math.hypot(input.x, input.y)),
    moving = Math.hypot(input.x, input.y) > 0.12;
  p.moving = moving || p.dash > 0;
  if (p.dash <= 0 && moving) p.facing = Math.atan2(input.y, input.x);
  if (input.dash && p.dashCooldown <= 0) {
    p.dash = 0.2;
    p.dashCooldown = Math.max(0.7, 1.6 - s.haste * 0.14);
    p.invincible = 0.3;
    sparks(s, p, "#a8e5d9", 6);
  }
  const speed = 205 + PETS[s.species].speed * 0.12 + s.haste * 10;
  if (p.dash > 0)
    moveBody(p, Math.cos(p.facing) * 660 * dt, Math.sin(p.facing) * 660 * dt);
  else
    moveBody(p, (input.x / norm) * speed * dt, (input.y / norm) * speed * dt);
  const attack = input.attack && p.attackCooldown <= 0,
    burst = input.burst && p.burstCooldown <= 0;
  if (attack) {
    if (!p.comboTime) p.combo = 0;
    p.combo = (p.combo % 3) + 1;
    p.comboTime = 1.1;
    p.attackCooldown = Math.max(0.2, 0.4 - s.haste * 0.035);
    p.slash = 0.23;
    const nearest = s.enemies
      .filter((e) => distance(e, p) < 150)
      .sort((a, b) => distance(a, p) - distance(b, p))[0];
    p.facing =
      input.aim ??
      (nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.facing);
  }
  if (burst) {
    p.burstCooldown = Math.max(4, 8 - s.haste * 0.4);
    s.burst = 0.65;
    sparks(s, p, "#a8e8df", 36);
    s.shake = 0.16;
  }
  for (const e of s.enemies) {
    e.flash = Math.max(0, e.flash - dt);
    const d = distance(e, p),
      angle = Math.atan2(e.y - p.y, e.x - p.x),
      facingDiff = Math.atan2(
        Math.sin(angle - p.facing),
        Math.cos(angle - p.facing),
      );
    if (
      (attack &&
        d < (p.combo === 3 ? 125 : 108) &&
        Math.abs(facingDiff) < 1.8) ||
      (burst && d < 230)
    ) {
      e.hp -= burst
        ? 7 + s.power * 2
        : PETS[s.species].power + s.stage + s.power + (p.combo === 3 ? 3 : 1);
      e.flash = 0.13;
      sparks(s, e, e.kind === "warden" ? "#e3b0b9" : "#d5e6a7", 7);
      if (e.kind !== "warden")
        moveBody(e, Math.cos(angle) * 24, Math.sin(angle) * 24);
      s.shake = 0.08;
    }
    if (e.hp <= 0) {
      s.kills++;
      s.pickups.push({
        x: e.x,
        y: e.y,
        kind: "xp",
        value: e.kind === "warden" ? 12 : 3,
        id: e.id,
      });
      if (e.id % 3 === 1)
        s.pickups.push({
          x: e.x + 15,
          y: e.y + 10,
          kind: "heart",
          value: 2,
          id: e.id + 100,
        });
      sparks(s, e, "#d7e9ae", 16);
      if (e.kind === "warden") {
        s.status = "won";
        s.message = "win";
        s.messageTime = 10;
      }
      continue;
    }
    if (d > (e.kind === "warden" ? 850 : 470)) {
      if (distance(e, e.home) > 160) {
        const a = Math.atan2(e.home.y - e.y, e.home.x - e.x);
        moveBody(e, Math.cos(a) * 60 * dt, Math.sin(a) * 60 * dt);
      }
      continue;
    }
    if (e.warning > 0) {
      e.warning -= dt;
      if (e.warning <= 0) {
        if (e.kind === "charger") {
          const a = Math.atan2(e.target.y - e.y, e.target.x - e.x);
          for (let n = 0; n < 18; n++) {
            moveBody(e, Math.cos(a) * 10, Math.sin(a) * 10);
            if (distance(e, p) < 35) hurt(s, 2);
          }
          sparks(s, e, "#e5b08d", 10);
        } else if (e.kind === "warden") {
          if (e.phase % 2 === 0) {
            if (distance(e.target, p) < 130) hurt(s, 2);
            sparks(s, e.target, "#e2a2c1", 35);
          } else
            for (let i = 0; i < 12; i++) {
              const a = (i * Math.PI) / 6 + e.phase * 0.2;
              s.projectiles.push({
                x: e.x,
                y: e.y,
                vx: Math.cos(a) * 160,
                vy: Math.sin(a) * 160,
                life: 3,
                radius: 7,
              });
            }
          e.phase++;
        } else if (e.kind === "wisp") {
          const a = Math.atan2(e.target.y - e.y, e.target.x - e.x);
          s.projectiles.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(a) * 210,
            vy: Math.sin(a) * 210,
            life: 3,
            radius: 6,
          });
        }
        e.cooldown =
          e.kind === "warden" ? (e.hp < e.maxHp / 2 ? 1.1 : 1.8) : 1.7;
      }
    } else {
      e.cooldown = Math.max(0, e.cooldown - dt);
      if (
        e.cooldown <= 0 &&
        e.kind !== "crawler" &&
        d < (e.kind === "warden" ? 600 : 350)
      ) {
        e.warning = e.kind === "warden" ? 0.95 : 0.7;
        e.target = { x: p.x, y: p.y };
      } else {
        const a = Math.atan2(p.y - e.y, p.x - e.x),
          speed =
            e.kind === "warden"
              ? 70
              : e.kind === "wisp"
                ? d < 170
                  ? -65
                  : d > 270
                    ? 65
                    : 0
                : e.kind === "charger"
                  ? 76
                  : 92;
        moveBody(
          e,
          Math.cos(a) * speed * dt,
          Math.sin(a) * speed * dt,
          e.kind === "warden" ? 30 : 15,
        );
      }
    }
    if (distance(e, p) < (e.kind === "warden" ? 45 : 26)) hurt(s);
  }
  s.enemies = s.enemies.filter((e) => e.hp > 0);
  for (const shot of s.projectiles) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;
    if (distance(shot, p) < shot.radius + 15) {
      hurt(s);
      shot.life = 0;
    }
  }
  s.projectiles = s.projectiles.filter((shot) => shot.life > 0);
  s.pickups = s.pickups.filter((drop) => {
    const d = distance(drop, p);
    if (d < 28) {
      if (drop.kind === "heart") p.hp = Math.min(p.maxHp, p.hp + drop.value);
      else s.xp += drop.value;
      sparks(s, p, "#d7e9ae", 4);
      return false;
    }
    if (d < 125 + s.magnet) {
      drop.x += (p.x - drop.x) * dt * 7;
      drop.y += (p.y - drop.y) * dt * 7;
    }
    return true;
  });
  if (s.xp >= s.level * 9 && s.level < 6) {
    s.xp -= s.level * 9;
    s.level++;
    s.choice = true;
  }
  SHRINES.forEach((shrine, i) => {
    if (
      !s.shrines[i] &&
      distance(p, shrine) < 95 &&
      !s.enemies.some((e) => e.shrine === i)
    ) {
      s.shrines[i] = true;
      p.hp = Math.min(p.maxHp, p.hp + 3);
      s.message = "shrine";
      s.messageTime = 4;
      sparks(s, shrine, shrine.color, 40);
    }
  });
  if (s.shrines.every(Boolean) && !s.bossSpawned) {
    s.bossSpawned = true;
    s.message = "boss";
    s.messageTime = 6;
    s.enemies.push({
      ...BOSS_GROVE,
      id: 999,
      kind: "warden",
      home: BOSS_GROVE,
      shrine: -1,
      hp: 100 + s.stage * 10,
      maxHp: 100 + s.stage * 10,
      cooldown: 2,
      warning: 0,
      target: { ...p },
      flash: 0,
      phase: 0,
    });
  }
  for (const particle of s.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.97;
    particle.vy *= 0.97;
    particle.life -= dt;
  }
  s.particles = s.particles.filter((p) => p.life > 0).slice(-220);
  if (p.hp <= 0) s.status = "lost";
  return s;
}
export const RUN_KEY = "duy:wildwood:run:v1";
export function serializeRun(s: Expedition) {
  return JSON.stringify({ ...s, particles: [], shake: 0, burst: 0 });
}
function record(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function finite(v: unknown, min = 0, max = 1000000): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}
function point(v: unknown): boolean {
  return record(v) && finite(v.x, -1000, 4200) && finite(v.y, -1000, 3400);
}
function list(
  v: unknown,
  max: number,
  check: (item: unknown) => boolean,
): boolean {
  return Array.isArray(v) && v.length <= max && v.every(check);
}
export function restoreRun(
  raw: string | null,
  species: Species,
  stage: number,
): Expedition | null {
  if (!raw || raw.length > 200000) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (
      !record(v) ||
      v.version !== 1 ||
      v.species !== species ||
      !finite(v.stage, 0, 2) ||
      !Number.isInteger(v.stage) ||
      typeof v.run !== "string" ||
      !v.run.length ||
      v.run.length > 100 ||
      !["running", "won", "lost"].includes(String(v.status))
    )
      return null;
    const p = v.player;
    if (
      !record(p) ||
      !point(p) ||
      !finite(p.x, 35, 3165) ||
      !finite(p.y, 40, 2365) ||
      !finite(p.hp, 0, 500) ||
      !finite(p.maxHp, 1, 500) ||
      p.hp > p.maxHp ||
      !finite(p.facing, -100, 100) ||
      typeof p.moving !== "boolean"
    )
      return null;
    if (
      ![
        "invincible",
        "dash",
        "dashCooldown",
        "burstCooldown",
        "attackCooldown",
        "slash",
        "comboTime",
      ].every((k) => finite(p[k], 0, 100)) ||
      !finite(p.combo, 0, 3)
    )
      return null;
    if (
      !list(
        v.enemies,
        30,
        (e) =>
          record(e) &&
          point(e) &&
          point(e.home) &&
          point(e.target) &&
          finite(e.id) &&
          ["crawler", "charger", "wisp", "warden"].includes(String(e.kind)) &&
          finite(e.shrine, -1, 2) &&
          finite(e.hp, 0, 1000) &&
          finite(e.maxHp, 1, 1000) &&
          e.hp <= e.maxHp &&
          finite(e.cooldown, -100, 100) &&
          finite(e.warning, -1, 100) &&
          finite(e.flash, 0, 10) &&
          finite(e.phase, 0, 100000),
      )
    )
      return null;
    if (
      !list(
        v.pickups,
        100,
        (e) =>
          record(e) &&
          point(e) &&
          finite(e.id) &&
          ["xp", "heart"].includes(String(e.kind)) &&
          finite(e.value, 0, 100),
      )
    )
      return null;
    if (
      !list(
        v.projectiles,
        100,
        (e) =>
          record(e) &&
          point(e) &&
          finite(e.vx, -1000, 1000) &&
          finite(e.vy, -1000, 1000) &&
          finite(e.life, 0, 10) &&
          finite(e.radius, 1, 30),
      )
    )
      return null;
    if (
      !Array.isArray(v.shrines) ||
      v.shrines.length !== 3 ||
      !v.shrines.every((x) => typeof x === "boolean") ||
      typeof v.choice !== "boolean" ||
      typeof v.bossSpawned !== "boolean"
    )
      return null;
    if (
      ![
        "time",
        "kills",
        "xp",
        "level",
        "power",
        "haste",
        "magnet",
        "messageTime",
      ].every((k) => finite(v[k])) ||
      !finite(v.level, 1, 6) ||
      !["start", "shrine", "boss", "upgrade", "win", "none"].includes(
        String(v.message),
      )
    )
      return null;
    const s = v as unknown as Expedition;
    // Evolution between visits preserves the expedition and applies the new pet's health bonus.
    const healthDelta = (stage - s.stage) * 2;
    return {
      ...s,
      stage,
      player: {
        ...s.player,
        maxHp: Math.max(1, s.player.maxHp + healthDelta),
        hp: Math.min(
          Math.max(1, s.player.maxHp + healthDelta),
          Math.max(s.status === "lost" ? 0 : 1, s.player.hp + healthDelta),
        ),
      },
      particles: [],
      shake: 0,
      burst: 0,
    };
  } catch {
    return null;
  }
}
