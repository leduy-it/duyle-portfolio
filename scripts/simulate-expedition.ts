import {
  createExpedition,
  stepExpedition,
  upgrade,
  EMPTY_INPUT,
  type Expedition,
} from "../src/lib/pets/expedition/engine";
import {
  SHRINES,
  BOSS_GROVE,
  PATHS,
  distance,
} from "../src/lib/pets/expedition/world";
// A deterministic player using the real route, movement, damage, cooldowns and upgrades.
let s: Expedition = {
  ...createExpedition("gracie", 0, "simulation"),
  status: "running" as const,
};
const route = [
  ...PATHS[0].slice(1),
  ...PATHS[1].slice(1),
  ...PATHS[2].slice(1),
  ...PATHS[3].slice(1, 4).reverse(),
];
// First three paths lead to all shrines. Return via southern bridge then north to boss.
route.splice(
  9,
  route.length,
  { x: 2540, y: 1450 },
  { x: 2560, y: 1120 },
  SHRINES[1],
  { x: 1740, y: 650 },
  { x: 1330, y: 650 },
  BOSS_GROVE,
);
let waypoint = 0;
for (let step = 0; step < 60 * 600 && s.status === "running"; step++) {
  if (s.choice) s = upgrade(s, s.player.hp < 6 ? "vitality" : "power");
  const nearest = [...s.enemies]
    .filter((e) => distance(e, s.player) < 260)
    .sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
  const target =
    s.bossSpawned && waypoint >= route.length
      ? BOSS_GROVE
      : route[Math.min(waypoint, route.length - 1)];
  const camp = SHRINES.findIndex((p) => distance(p, target) < 10);
  if (distance(s.player, target) < 35 && (camp < 0 || s.shrines[camp]))
    waypoint++;
  let dx = target.x - s.player.x,
    dy = target.y - s.player.y;
  if (nearest && distance(nearest, s.player) < 180) {
    dx = nearest.x - s.player.x;
    dy = nearest.y - s.player.y;
    if (distance(nearest, s.player) < 80) {
      dx = 0;
      dy = 0;
    }
  }
  const danger = s.enemies.some(
    (e) =>
      e.warning > 0 && e.warning < 0.25 && distance(e.target, s.player) < 135,
  );
  if (danger) {
    dx = -(nearest?.y ?? 0) + s.player.y;
    dy = (nearest?.x ?? 0) - s.player.x;
    if (Math.hypot(dx, dy) < 1) dx = 1;
  }
  const norm = Math.max(1, Math.hypot(dx, dy));
  s = stepExpedition(
    s,
    {
      ...EMPTY_INPUT,
      x: dx / norm,
      y: dy / norm,
      attack: !!nearest,
      burst: !!nearest && distance(nearest, s.player) < 210,
      dash: danger,
    },
    1 / 60,
  );
  if (step % 3600 === 0)
    console.log({
      seconds: step / 60,
      waypoint,
      hp: s.player.hp,
      kills: s.kills,
      pos: [Math.round(s.player.x), Math.round(s.player.y)],
      shrines: s.shrines,
    });
}
console.log({
  status: s.status,
  time: Math.round(s.time),
  hp: s.player.hp,
  kills: s.kills,
  shrines: s.shrines,
  boss: s.bossSpawned,
  waypoint,
  pos: s.player,
});
if (s.status !== "won") process.exitCode = 1;
