export const WORLD = { width: 3200, height: 2400 };
export type Point = { x: number; y: number };
export const CAMP = { x: 460, y: 1780 };
export const SHRINES = [
  { x: 800, y: 520, name: "Fernwatch", vi: "Đền Dương Xỉ", color: "#a4d69a" },
  {
    x: 2390,
    y: 620,
    name: "Moonwater",
    vi: "Đền Nguyệt Thủy",
    color: "#8ad6e3",
  },
  { x: 2340, y: 1820, name: "Emberfall", vi: "Đền Tàn Lửa", color: "#edb584" },
];
export const BOSS_GROVE = { x: 1260, y: 1050 };
export const PATHS: Point[][] = [
  [CAMP, { x: 600, y: 1350 }, { x: 660, y: 930 }, SHRINES[0]],
  [SHRINES[0], { x: 1180, y: 620 }, { x: 1740, y: 650 }, SHRINES[1]],
  [SHRINES[1], { x: 2560, y: 1120 }, { x: 2540, y: 1450 }, SHRINES[2]],
  [
    SHRINES[2],
    { x: 1860, y: 1650 },
    { x: 1480, y: 1650 },
    { x: 1050, y: 1720 },
    CAMP,
  ],
  [{ x: 650, y: 1100 }, BOSS_GROVE, { x: 1330, y: 650 }],
];
export const riverX = (y: number) => 1640 + Math.sin(y / 340) * 100;
export const bridges = [650, 1650];
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function segmentDistance(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    t = Math.max(
      0,
      Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)),
    );
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}
export const nearPath = (p: Point, radius = 82) =>
  PATHS.some((path) =>
    path.slice(1).some((b, i) => segmentDistance(p, path[i], b) < radius),
  );
export const inWater = (p: Point, margin = 0) =>
  Math.abs(p.x - riverX(p.y)) < 68 + margin &&
  !bridges.some((y) => Math.abs(p.y - y) < 52 - margin);
export interface Scenery extends Point {
  id: number;
  kind: "tree" | "rock" | "fern";
  size: number;
  variant: number;
}
function scenery(): Scenery[] {
  const rng = random(79136),
    result: Scenery[] = [];
  for (let y = 70; y < WORLD.height - 50; y += 74)
    for (let x = 70; x < WORLD.width - 50; x += 74) {
      const p = { x: x + rng() * 62 - 31, y: y + rng() * 62 - 31 };
      if (
        nearPath(p) ||
        [CAMP, ...SHRINES, BOSS_GROVE].some((c) => distance(p, c) < 190) ||
        inWater(p, 22)
      )
        continue;
      result.push({
        ...p,
        id: result.length,
        kind: rng() < 0.77 ? "tree" : rng() < 0.6 ? "rock" : "fern",
        size: 0.75 + rng() * 0.6,
        variant: Math.floor(rng() * 5),
      });
    }
  return result;
}
export const SCENERY = scenery();
export function canStand(p: Point, radius = 15) {
  return (
    p.x >= 35 &&
    p.x <= WORLD.width - 35 &&
    p.y >= 40 &&
    p.y <= WORLD.height - 35 &&
    !inWater(p, radius) &&
    !SCENERY.some(
      (o) =>
        o.kind !== "fern" &&
        Math.abs(o.x - p.x) < 40 &&
        Math.abs(o.y - p.y) < 40 &&
        distance(p, o) < radius + (o.kind === "tree" ? 13 : 23) * o.size,
    )
  );
}
export function moveBody<T extends Point>(
  body: T,
  dx: number,
  dy: number,
  radius = 15,
) {
  // Axis separation lets bodies slide around trunks and prevents high-speed tunnelling.
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 10));
  for (let i = 0; i < steps; i++) {
    if (canStand({ x: body.x + dx / steps, y: body.y }, radius))
      body.x += dx / steps;
    if (canStand({ x: body.x, y: body.y + dy / steps }, radius))
      body.y += dy / steps;
  }
}
