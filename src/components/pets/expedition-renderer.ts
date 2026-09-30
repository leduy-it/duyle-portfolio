import {
  BOSS_GROVE,
  CAMP,
  PATHS,
  SCENERY,
  SHRINES,
  WORLD,
  bridges,
  distance,
  nearPath,
  random,
  riverX,
  type Scenery,
} from "@/lib/pets/expedition/world";
import type { Enemy, Expedition } from "@/lib/pets/expedition/engine";
import { petAppearance } from "@/lib/pets/appearance";
import { motionCatalog } from "./motion-pet";

type Ctx = CanvasRenderingContext2D;
function ellipse(
  c: Ctx,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}
function line(
  c: Ctx,
  points: { x: number; y: number }[],
  color: string,
  width: number,
) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  points.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
  c.stroke();
}
function terrain() {
  const canvas = document.createElement("canvas");
  canvas.width = WORLD.width;
  canvas.height = WORLD.height;
  const c = canvas.getContext("2d")!,
    rng = random(87231);
  c.fillStyle = "#233f35";
  c.fillRect(0, 0, canvas.width, canvas.height);
  for (const [x, y, color] of [
    [2420, 640, "#24566b"],
    [2410, 1860, "#71563a"],
  ] as const) {
    const g = c.createRadialGradient(x, y, 50, x, y, 950);
    g.addColorStop(0, color);
    g.addColorStop(1, "#233f3500");
    c.fillStyle = g;
    c.fillRect(x - 950, y - 950, 1900, 1900);
  }
  for (let i = 0; i < 750; i++) {
    const x = rng() * WORLD.width,
      y = rng() * WORLD.height,
      r = 40 + rng() * 180;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, ["#50734845", "#71835530", "#122e3345"][i % 3]);
    g.addColorStop(1, "#34544100");
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (const path of PATHS) {
    line(c, path, "#556249", 114);
    line(c, path, "#7b7e55", 85);
    line(c, path, "#99946555", 56);
  }
  for (let i = 0; i < 37000; i++) {
    const x = rng() * WORLD.width,
      y = rng() * WORLD.height;
    c.fillStyle = ["#adc17b24", "#081e2024", "#9db87a30", "#7a956b50"][i % 4];
    c.fillRect(x, y, 2 + rng() * 5, 1 + rng() * 3);
  }
  for (let i = 0; i < 7000; i++) {
    const p = { x: rng() * WORLD.width, y: rng() * WORLD.height };
    if (!nearPath(p, 40)) continue;
    ellipse(c, p.x + 2, p.y + 2, 4 + rng() * 6, 2 + rng() * 3, "#343d3040");
    ellipse(
      c,
      p.x,
      p.y,
      3 + rng() * 6,
      2 + rng() * 3,
      ["#b6ac7b77", "#d1c18a66", "#7b896855"][i % 3],
    );
  }
  const river = Array.from({ length: 101 }, (_, i) => ({
    x: riverX(i * 24),
    y: i * 24,
  }));
  line(c, river, "#9aab8355", 172);
  line(c, river, "#274d53", 146);
  line(c, river, "#427e7b", 120);
  line(
    c,
    river.map((p) => ({ x: p.x - 16, y: p.y })),
    "#75ae9c36",
    60,
  );
  for (const y of bridges) {
    const x = riverX(y);
    c.fillStyle = "#203b37";
    c.fillRect(x - 116, y - 53, 232, 112);
    for (let k = -11; k < 12; k++) {
      c.fillStyle = k % 2 ? "#978568" : "#ad9875";
      c.fillRect(x + k * 10, y - 45, 9, 90);
      c.fillStyle = "#493f34";
      c.fillRect(x + k * 10 + 3, y - 39, 2, 2);
      c.fillRect(x + k * 10 + 3, y + 38, 2, 2);
    }
    line(
      c,
      [
        { x: x - 120, y: y - 50 },
        { x: x + 120, y: y - 50 },
      ],
      "#d5be86",
      5,
    );
    line(
      c,
      [
        { x: x - 120, y: y + 49 },
        { x: x + 120, y: y + 49 },
      ],
      "#705e46",
      5,
    );
  }
  for (const [index, shrine] of [...SHRINES, BOSS_GROVE].entries()) {
    ellipse(
      c,
      shrine.x,
      shrine.y,
      index === 3 ? 190 : 150,
      index === 3 ? 145 : 112,
      "#334e44",
    );
    for (let ring = 2; ring < 5; ring++)
      for (let i = 0; i < ring * 10; i++) {
        const a = (i / (ring * 10)) * Math.PI * 2;
        c.save();
        c.translate(
          shrine.x + Math.cos(a) * ring * 29,
          shrine.y + Math.sin(a) * ring * 22,
        );
        c.rotate(a);
        c.fillStyle = ["#7b887050", "#8a927452", "#425f52"][i % 3];
        c.fillRect(-10, -8, 21, 15);
        c.restore();
      }
  }
  ellipse(c, CAMP.x, CAMP.y, 135, 100, "#7d78554a");
  return canvas;
}
function tree(variant: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 240;
  const c = canvas.getContext("2d")!,
    rng = random(340 + variant * 43);
  ellipse(c, 107, 214, 67, 18, "#061e2266");
  line(
    c,
    [
      { x: 92, y: 215 },
      { x: 87, y: 150 },
      { x: 104, y: 85 },
    ],
    "#3e4431",
    23,
  );
  line(
    c,
    [
      { x: 85, y: 211 },
      { x: 85, y: 150 },
      { x: 101, y: 85 },
    ],
    "#777453",
    7,
  );
  for (let i = 0; i < 7; i++)
    line(
      c,
      [
        { x: 92, y: 207 },
        { x: 68 + i * 8, y: 222 - (i % 3) * 4 },
      ],
      "#4d5038",
      5,
    );
  for (let i = 0; i < 9; i++) {
    const x = 36 + rng() * 115,
      y = 35 + rng() * 113;
    line(
      c,
      [
        { x: 94, y: 164 },
        { x, y },
      ],
      "#626044",
      7,
    );
  }
  const colors =
    variant >= 10
      ? ["#333c32", "#56573a", "#787444", "#99925a", "#c4ae6c"]
      : variant >= 5
        ? ["#173d3f", "#2a5955", "#417c6d", "#629783", "#89af8a"]
        : ["#143a30", "#2b5035", "#44663c", "#638248", "#9bab60"];
  for (let layer = 0; layer < 5; layer++) {
    for (let i = 0; i < [38, 34, 28, 18, 10][layer]; i++) {
      const a = rng() * Math.PI * 2,
        r = Math.sqrt(rng()) * (65 - layer * 5),
        x = 94 + Math.cos(a) * r - layer * 3,
        y = 111 + Math.sin(a) * r * 0.95 - layer * 7;
      c.fillStyle = colors[layer];
      c.beginPath();
      for (let k = 0; k < 7; k++) {
        const theta = (k / 7) * Math.PI * 2,
          size = 9 + rng() * 10;
        const px = x + Math.cos(theta) * size,
          py = y + Math.sin(theta) * size * 0.75;
        if (!k) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
      if (layer > 2) {
        c.fillStyle = "#c1c67e42";
        c.fillRect(x - 5, y - 4, 7, 3);
      }
    }
  }
  c.save();
  c.globalCompositeOperation = "source-atop";
  for (let i = 0; i < 1800; i++) {
    const x = 20 + rng() * 155,
      y = 22 + rng() * 139;
    c.fillStyle = ["#d7dea037", "#031e1d40", "#bdd08535", "#91b7784a"][i % 4];
    c.fillRect(x, y, 1 + rng() * 4, 1 + rng() * 3);
  }
  c.restore();
  for (let i = 0; i < 7; i++)
    line(
      c,
      [
        { x: 46 + i * 14, y: 136 },
        { x: 43 + i * 14, y: 168 + (i % 3) * 8 },
      ],
      "#74886866",
      2,
    );
  return canvas;
}
export class ExpeditionRenderer {
  private ground = terrain();
  private trees = Array.from({ length: 15 }, (_, i) => tree(i));
  private atlas = new Image();
  private paintedTrees = new Image();
  private walks = new Map<string, HTMLImageElement>();
  private camera = { x: CAMP.x, y: CAMP.y };
  private appearance: ReturnType<typeof petAppearance>;
  constructor(s: Expedition) {
    this.paintedTrees.src =
      "/_next/image?url=%2Fpets%2Fwildwood%2Ftrees.png&w=1920&q=90";
    this.appearance = petAppearance(s.species, s.stage);
    this.atlas.src = `/pets/hatch-pet-plus/${this.appearance.pet}/${this.appearance.file}`;
    for (const [name, clip] of Object.entries(
      motionCatalog[this.appearance.pet] || {},
    ))
      if (name.startsWith("walk-")) {
        const img = new Image();
        img.src = `/pets/hatch-pet-plus/${this.appearance.pet}/motion/${clip.file}`;
        this.walks.set(name, img);
      }
  }
  draw(
    c: Ctx,
    s: Expedition,
    width: number,
    height: number,
    still: boolean,
    vi: boolean,
    dt: number,
  ) {
    const zoom = width < 600 ? 0.78 : 1.05,
      vw = width / zoom,
      vh = height / zoom;
    const target = {
      x: Math.max(vw / 2, Math.min(WORLD.width - vw / 2, s.player.x)),
      y: Math.max(vh / 2, Math.min(WORLD.height - vh / 2, s.player.y)),
    };
    const follow = still ? 1 : 1 - Math.exp(-dt * 8);
    this.camera.x += (target.x - this.camera.x) * follow;
    this.camera.y += (target.y - this.camera.y) * follow;
    const shake = still ? 0 : s.shake * 12,
      ox = this.camera.x - vw / 2 + Math.sin(s.time * 100) * shake,
      oy = this.camera.y - vh / 2 + Math.cos(s.time * 87) * shake;
    c.save();
    c.scale(zoom, zoom);
    c.translate(-ox, -oy);
    c.imageSmoothingEnabled = true;
    c.drawImage(this.ground, 0, 0);
    // Water highlights move independently of the world geometry.
    for (let i = 0; i < 90; i++) {
      const y = (i * 31 + (still ? 0 : s.time * 12)) % WORLD.height;
      if (y < oy - 20 || y > oy + vh + 20) continue;
      if (bridges.some((b) => Math.abs(y - b) < 54)) continue;
      const x = riverX(y) + Math.sin(i * 6) * 45;
      line(
        c,
        [
          { x, y },
          { x: x + 14 + (i % 13), y: y - 2 },
        ],
        "#d0efcf4a",
        1.5,
      );
    }
    // Camp and resting point.
    ellipse(c, CAMP.x - 75, CAMP.y + 5, 60, 16, "#11292377");
    c.fillStyle = "#aa9870";
    c.beginPath();
    c.moveTo(CAMP.x - 130, CAMP.y);
    c.lineTo(CAMP.x - 72, CAMP.y - 91);
    c.lineTo(CAMP.x - 14, CAMP.y);
    c.closePath();
    c.fill();
    c.fillStyle = "#596b53";
    c.beginPath();
    c.moveTo(CAMP.x - 72, CAMP.y - 91);
    c.lineTo(CAMP.x - 64, CAMP.y);
    c.lineTo(CAMP.x - 14, CAMP.y);
    c.fill();
    c.fillStyle = "#273f35";
    c.beginPath();
    c.moveTo(CAMP.x - 84, CAMP.y - 52);
    c.lineTo(CAMP.x - 107, CAMP.y);
    c.lineTo(CAMP.x - 61, CAMP.y);
    c.fill();
    const fireX = CAMP.x + 82,
      fireY = CAMP.y - 30,
      glow = c.createRadialGradient(fireX, fireY, 0, fireX, fireY, 100);
    glow.addColorStop(0, "#f8c26c40");
    glow.addColorStop(1, "#f8c26c00");
    c.fillStyle = glow;
    c.fillRect(fireX - 100, fireY - 100, 200, 200);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ellipse(
        c,
        fireX + Math.cos(a) * 19,
        fireY + Math.sin(a) * 10,
        7,
        5,
        "#7a8170",
      );
    }
    ellipse(
      c,
      fireX,
      fireY - 8,
      12,
      19 + (still ? 0 : Math.sin(s.time * 12) * 3),
      "#e4a55e",
    );
    ellipse(c, fireX, fireY - 6, 6, 12, "#f9e0a0");
    for (const [i, shrine] of SHRINES.entries()) {
      const active = s.shrines[i],
        near = distance(shrine, s.player) < 500;
      if (
        !near &&
        (shrine.x < ox - 200 ||
          shrine.x > ox + vw + 200 ||
          shrine.y < oy - 200 ||
          shrine.y > oy + vh + 200)
      )
        continue;
      ellipse(c, shrine.x, shrine.y, 54, 27, "#102e34aa");
      ellipse(c, shrine.x, shrine.y - 7, 49, 26, "#7d8a79");
      ellipse(c, shrine.x, shrine.y - 11, 39, 20, "#acb298");
      for (let pillar = -1; pillar <= 1; pillar += 2) {
        c.fillStyle = "#4d695d";
        c.fillRect(shrine.x + pillar * 95 - 13, shrine.y - 86, 26, 86);
        c.fillStyle = "#87947b";
        c.fillRect(shrine.x + pillar * 95 - 18, shrine.y - 90, 36, 9);
        c.fillStyle = "#365f44";
        c.fillRect(shrine.x + pillar * 95 - 15, shrine.y - 75, 10, 31);
      }
      const by = shrine.y - 40 + (still ? 0 : Math.sin(s.time * 2 + i) * 4);
      c.shadowColor = active ? shrine.color : "#c782a3";
      c.shadowBlur = active ? 28 : 12;
      c.fillStyle = active ? shrine.color : "#8f6b88";
      c.beginPath();
      c.moveTo(shrine.x, by - 30);
      c.lineTo(shrine.x + 16, by);
      c.lineTo(shrine.x, by + 18);
      c.lineTo(shrine.x - 16, by);
      c.closePath();
      c.fill();
      c.shadowBlur = 0;
      c.textAlign = "center";
      c.font = "12px Georgia";
      c.fillStyle = "#e1e5cb";
      c.fillText(vi ? shrine.vi : shrine.name, shrine.x, shrine.y + 56);
      c.font = "10px monospace";
      c.fillStyle = active ? "#c1e9af" : "#c8cdb7";
      c.fillText(
        active
          ? vi
            ? "ĐÃ THỨC TỈNH"
            : "AWAKENED"
          : `${s.enemies.filter((e) => e.shrine === i).length} ${vi ? "vệ binh" : "guardians"}`,
        shrine.x,
        shrine.y + 73,
      );
    }
    for (const drop of s.pickups) {
      const bob = still ? 0 : Math.sin(s.time * 5 + drop.id) * 3;
      c.save();
      c.translate(drop.x, drop.y + bob);
      c.rotate(Math.PI / 4);
      c.shadowColor = drop.kind === "heart" ? "#efaca8" : "#b9e2a4";
      c.shadowBlur = 13;
      c.fillStyle = drop.kind === "heart" ? "#efb5a9" : "#cfedac";
      c.fillRect(-4, -4, 8, 8);
      c.restore();
    }
    for (const e of s.enemies)
      if (e.warning > 0) {
        c.save();
        c.strokeStyle = "#f5b38dcc";
        c.fillStyle = "#d8585538";
        c.lineWidth = 2;
        c.setLineDash([7, 5]);
        if (e.kind === "charger") {
          line(c, [e, e.target], "#e5aa6655", 32);
          line(c, [e, e.target], "#f5c393", 2);
        } else if (e.kind === "warden") {
          const center = e.phase % 2 === 0 ? e.target : e;
          c.beginPath();
          c.arc(center.x, center.y, 130, 0, Math.PI * 2);
          c.fill();
          c.stroke();
        } else {
          line(c, [e, e.target], "#edbdda99", 2);
        }
        c.restore();
      }
    const visible = SCENERY.filter(
      (o) =>
        o.x > ox - 160 &&
        o.x < ox + vw + 160 &&
        o.y > oy - 20 &&
        o.y < oy + vh + 250,
    );
    const actors: { y: number; draw: () => void }[] = visible.map((o) => ({
      y: o.y,
      draw: () => this.scenery(c, o, s, still),
    }));
    for (const e of s.enemies)
      if (
        e.x > ox - 100 &&
        e.x < ox + vw + 100 &&
        e.y > oy - 100 &&
        e.y < oy + vh + 100
      )
        actors.push({ y: e.y, draw: () => this.enemy(c, e, s.time, still) });
    actors.push({ y: s.player.y, draw: () => this.player(c, s, still) });
    actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
    for (const shot of s.projectiles) {
      c.shadowBlur = 12;
      c.shadowColor = "#d9a3dc";
      ellipse(c, shot.x, shot.y, shot.radius, shot.radius, "#efc8eb");
      c.shadowBlur = 0;
    }
    for (const particle of s.particles) {
      c.globalAlpha = particle.life / particle.maxLife;
      c.fillStyle = particle.color;
      c.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    c.globalAlpha = 1;
    if (s.burst > 0) {
      c.strokeStyle = `rgba(177,241,218,${s.burst / 0.65})`;
      c.lineWidth = 4;
      c.beginPath();
      c.arc(s.player.x, s.player.y, (1 - s.burst / 0.65) * 230, 0, Math.PI * 2);
      c.stroke();
    }
    // Canopy light, pollen and a soft vignette stay in screen space.
    c.restore();
    c.save();
    c.globalCompositeOperation = "screen";
    for (let beam = 0; beam < 3; beam++) {
      const bx =
        ((beam * 480 - this.camera.x * 0.22 + width * 4) % (width + 600)) - 300;
      const gradient = c.createLinearGradient(bx, 0, bx + 200, height);
      gradient.addColorStop(0, "#d5e7b512");
      gradient.addColorStop(1, "#d5e7b500");
      c.fillStyle = gradient;
      c.beginPath();
      c.moveTo(bx, 0);
      c.lineTo(bx + 32, 0);
      c.lineTo(bx + height * 0.45 + 130, height);
      c.lineTo(bx + height * 0.45, height);
      c.fill();
    }
    c.restore();
    if (!still)
      for (let i = 0; i < 24; i++) {
        const x =
            (i * 137 +
              Math.sin(s.time * 0.3 + i) * 30 -
              this.camera.x * 0.1 +
              width * 5) %
            width,
          y = (i * 73 - s.time * 7 + height * 100) % height;
        c.globalAlpha = 0.15 + Math.sin(s.time * 2 + i) ** 2 * 0.4;
        ellipse(c, x, y, 1.5, 1.5, "#e9e5ae");
      }
    c.globalAlpha = 1;
    const shade = c.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.18,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.68,
    );
    shade.addColorStop(0, "#061b2300");
    shade.addColorStop(1, "#051921b0");
    c.fillStyle = shade;
    c.fillRect(0, 0, width, height);
    this.minimap(c, s, width, height, vi);
  }
  private scenery(c: Ctx, o: Scenery, s: Expedition, still: boolean) {
    if (o.kind === "tree") {
      const behind =
        Math.abs(s.player.x - o.x) < 145 * o.size &&
        s.player.y < o.y + 35 &&
        s.player.y > o.y - 220 * o.size;
      c.globalAlpha = behind ? 0.12 : 1;
      c.save();
      c.translate(o.x, o.y);
      if (!still) c.rotate(Math.sin(s.time * 0.6 + o.id) * 0.004);
      if (this.paintedTrees.complete && this.paintedTrees.naturalWidth) {
        const index =
            o.variant === 4 ? 3 : o.x > 1950 ? (o.y > 1300 ? 2 : 1) : 0,
          sw = this.paintedTrees.naturalWidth / 2,
          sh = this.paintedTrees.naturalHeight / 2;
        c.drawImage(
          this.paintedTrees,
          (index % 2) * sw,
          Math.floor(index / 2) * sh,
          sw,
          sh,
          -150 * o.size,
          -195 * o.size,
          300 * o.size,
          200 * o.size,
        );
      } else
        c.drawImage(
          this.trees[o.variant + (o.x > 1950 ? (o.y > 1300 ? 10 : 5) : 0)],
          -96 * o.size,
          -214 * o.size,
          192 * o.size,
          240 * o.size,
        );
      c.restore();
      c.globalAlpha = 1;
    } else if (o.kind === "rock") {
      ellipse(c, o.x + 8, o.y + 4, 28 * o.size, 13 * o.size, "#102a2c66");
      c.fillStyle = "#657e70";
      c.beginPath();
      c.moveTo(o.x - 26, o.y);
      c.lineTo(o.x - 21, o.y - 26);
      c.lineTo(o.x + 8, o.y - 38);
      c.lineTo(o.x + 27, o.y - 12);
      c.lineTo(o.x + 21, o.y + 4);
      c.fill();
      c.fillStyle = "#98a18a";
      c.beginPath();
      c.moveTo(o.x - 21, o.y - 26);
      c.lineTo(o.x + 8, o.y - 38);
      c.lineTo(o.x + 14, o.y - 22);
      c.fill();
      ellipse(c, o.x - 12, o.y - 18, 14, 7, "#557347");
    } else
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        line(
          c,
          [
            { x: o.x, y: o.y },
            { x: o.x + Math.cos(a) * 23, y: o.y + Math.sin(a) * 11 - 10 },
          ],
          i % 2 ? "#789768" : "#3e714f",
          3,
        );
      }
  }
  private enemy(c: Ctx, e: Enemy, time: number, still: boolean) {
    const scale = e.kind === "warden" ? 2.1 : e.kind === "charger" ? 1.25 : 1,
      bob = still ? 0 : Math.sin(time * 5 + e.id) * (e.kind === "wisp" ? 6 : 2);
    c.save();
    c.translate(e.x, e.y);
    c.scale(scale, scale);
    ellipse(c, 0, 4, 23, 9, "#0d242e88");
    c.translate(0, bob);
    if (e.kind === "wisp") {
      c.shadowBlur = 20;
      c.shadowColor = "#c291dd";
      ellipse(c, 0, -22, 13, 18, e.flash ? "#fff1d8" : "#9f88c1");
      c.shadowBlur = 0;
      ellipse(c, -3, -26, 8, 10, "#d2b9de");
      line(
        c,
        [
          { x: -8, y: -9 },
          { x: -12 + Math.sin(time * 4) * 6, y: 8 },
        ],
        "#ae97c866",
        4,
      );
    } else {
      for (let i = -1; i <= 1; i += 2) {
        line(
          c,
          [
            { x: i * 12, y: -8 },
            { x: i * 21, y: 1 },
            { x: i * 26, y: -2 },
          ],
          "#737d56",
          6,
        );
        line(
          c,
          [
            { x: i * 13, y: -17 },
            { x: i * 26, y: -9 },
          ],
          "#445842",
          7,
        );
      }
      ellipse(
        c,
        0,
        -18,
        23,
        24,
        e.flash ? "#fff3d3" : e.kind === "warden" ? "#645879" : "#56694c",
      );
      ellipse(
        c,
        -5,
        -26,
        15,
        13,
        e.flash ? "#fff3d3" : e.kind === "warden" ? "#a18bab" : "#8d9c65",
      );
      line(
        c,
        [
          { x: -14, y: -32 },
          { x: -20, y: -54 },
          { x: -28, y: -57 },
        ],
        "#bbc094",
        4,
      );
      line(
        c,
        [
          { x: 14, y: -32 },
          { x: 20, y: -52 },
          { x: 29, y: -62 },
        ],
        "#bbc094",
        4,
      );
      if (e.kind === "warden") {
        c.strokeStyle = "#c6a1dc";
        c.lineWidth = 2;
        c.beginPath();
        c.arc(0, -22, 37, 0, Math.PI * 2);
        c.stroke();
      }
    }
    ellipse(c, -6, -23, 3, 4, "#f5d399");
    ellipse(c, 7, -23, 3, 4, "#f5d399");
    c.restore();
    if (e.hp < e.maxHp || e.kind === "warden") {
      c.fillStyle = "#0c2028";
      c.fillRect(e.x - 23 * scale, e.y - 71 * scale, 46 * scale, 4);
      c.fillStyle = "#d7b29f";
      c.fillRect(
        e.x - 23 * scale,
        e.y - 71 * scale,
        (46 * scale * e.hp) / e.maxHp,
        4,
      );
    }
  }
  private player(c: Ctx, s: Expedition, still: boolean) {
    const p = s.player;
    ellipse(c, p.x, p.y + 7, 21, 8, "#061e2877");
    c.globalAlpha =
      p.invincible && !still ? 0.5 + Math.abs(Math.sin(s.time * 24)) * 0.5 : 1;
    const direction = ["s", "sw", "w", "nw", "n", "ne", "e", "se"][
      (Math.round((p.facing - Math.PI / 2) / (Math.PI / 4)) + 16) % 8
    ];
    const walk = this.walks.get(`walk-${direction}`),
      sprite =
        p.moving && walk?.complete && walk.naturalWidth ? walk : this.atlas;
    if (sprite.complete && sprite.naturalWidth) {
      const lane =
          sprite === walk ? 0 : p.slash > 0 ? 4 : s.status === "lost" ? 5 : 0,
        frames = sprite === walk ? 8 : lane === 4 ? 5 : lane === 5 ? 8 : 6,
        frame = still ? 0 : Math.floor(s.time * (p.moving ? 9 : 6)) % frames;
      c.imageSmoothingEnabled = false;
      c.drawImage(
        sprite,
        frame * 192,
        lane * 208,
        192,
        208,
        p.x - 39,
        p.y - 68,
        78,
        84,
      );
      c.imageSmoothingEnabled = true;
    }
    c.globalAlpha = 1;
    if (p.slash > 0) {
      const t = 1 - p.slash / 0.23,
        radius = p.combo === 3 ? 115 : 95;
      c.save();
      c.translate(p.x, p.y - 8);
      c.rotate(p.facing);
      c.strokeStyle = `rgba(238,239,192,${1 - t})`;
      c.lineWidth = 10 * (1 - t) + 2;
      c.beginPath();
      c.arc(0, 0, radius * (0.7 + 0.3 * t), -1.5 + t, 0.7 + t);
      c.stroke();
      c.strokeStyle = `rgba(165,232,197,${(1 - t) * 0.6})`;
      c.lineWidth = 22;
      c.stroke();
      c.restore();
    }
  }
  private minimap(
    c: Ctx,
    s: Expedition,
    width: number,
    height: number,
    vi: boolean,
  ) {
    const w = width < 600 ? 102 : 150,
      h = w * 0.75,
      x = width - w - 18,
      y = height - h - 18,
      sx = w / WORLD.width,
      sy = h / WORLD.height;
    c.fillStyle = "#092326dd";
    c.fillRect(x - 5, y - 5, w + 10, h + 10);
    c.strokeStyle = "#cfdbb644";
    c.lineWidth = 1;
    c.strokeRect(x - 5, y - 5, w + 10, h + 10);
    c.save();
    c.translate(x, y);
    c.scale(sx, sy);
    for (const path of PATHS) line(c, path, "#bbc69b65", 25);
    for (const [i, shrine] of SHRINES.entries())
      ellipse(
        c,
        shrine.x,
        shrine.y,
        65,
        65,
        s.shrines[i] ? "#b9e3a1" : "#ac80a8",
      );
    if (s.bossSpawned)
      ellipse(c, BOSS_GROVE.x, BOSS_GROVE.y, 85, 85, "#eda28c");
    ellipse(c, CAMP.x, CAMP.y, 50, 50, "#e8c78a");
    ellipse(c, s.player.x, s.player.y, 60, 60, "#fffde6");
    c.restore();
    c.font = "9px monospace";
    c.fillStyle = "#c8d6bd";
    c.textAlign = "right";
    c.fillText(vi ? "RỪNG HOANG" : "THE WILDWOOD", x + w, y - 13);
    const target = s.bossSpawned
      ? BOSS_GROVE
      : SHRINES.find((_, i) => !s.shrines[i]);
    if (target && distance(target, s.player) > 260 && s.status === "running") {
      const a = Math.atan2(target.y - s.player.y, target.x - s.player.x),
        px = width / 2 + Math.cos(a) * Math.min(width * 0.35, 240),
        py = height / 2 + Math.sin(a) * Math.min(height * 0.3, 165);
      c.save();
      c.translate(px, py);
      c.rotate(a);
      c.fillStyle = "#e8dfad";
      c.beginPath();
      c.moveTo(9, 0);
      c.lineTo(-5, -5);
      c.lineTo(-5, 5);
      c.fill();
      c.restore();
      c.textAlign = "center";
      c.fillStyle = "#e0dec3";
      c.font = "10px monospace";
      c.fillText(
        `${Math.round(distance(target, s.player) / 10)}m`,
        px,
        py + 22,
      );
    }
  }
}
