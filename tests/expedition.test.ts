import test from "node:test";
import assert from "node:assert/strict";
import {
  createExpedition,
  EMPTY_INPUT,
  restoreRun,
  serializeRun,
  stepExpedition,
  upgrade,
  type Expedition,
} from "../src/lib/pets/expedition/engine";
import {
  BOSS_GROVE,
  CAMP,
  PATHS,
  SCENERY,
  SHRINES,
  WORLD,
  canStand,
  moveBody,
  riverX,
} from "../src/lib/pets/expedition/world";

test("expedition is a connected large world with walkable routes and blocked river banks", () => {
  assert.ok(WORLD.width > 2500 && WORLD.height > 2000);
  assert.ok(SCENERY.length > 500);
  for (const path of PATHS)
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1],
        b = path[i],
        steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8);
      for (let j = 0; j <= steps; j++)
        assert.ok(
          canStand({
            x: a.x + ((b.x - a.x) * j) / steps,
            y: a.y + ((b.y - a.y) * j) / steps,
          }),
          `blocked route ${i} at ${j}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`,
        );
    }
  assert.equal(canStand({ x: riverX(1000), y: 1000 }), false);
  assert.equal(canStand({ x: riverX(650), y: 650 }), true);
});
test("movement, dash and terrain collision are real simulation rules", () => {
  const s = { ...createExpedition("gracie"), status: "running" as const };
  let a: Expedition = s,
    b: Expedition = s;
  for (let i = 0; i < 60; i++)
    a = stepExpedition(a, { ...EMPTY_INPUT, y: -1 }, 1 / 60);
  for (let i = 0; i < 30; i++)
    b = stepExpedition(b, { ...EMPTY_INPUT, y: -1 }, 1 / 30);
  assert.ok(Math.abs(a.player.y - b.player.y) < 0.001);
  const d = stepExpedition(s, { ...EMPTY_INPUT, dash: true, y: -1 }, 1 / 60);
  assert.ok(d.player.invincible > 0 && d.player.dashCooldown > 0);
  assert.ok(d.player.y < s.player.y - 5);
  const river = { x: riverX(1000) - 120, y: 1000 };
  moveBody(river, 250, 0);
  assert.ok(river.x < riverX(1000) - 60);
});
test("attacks combine, skills cooldown and warnings give time to dodge", () => {
  const s = { ...createExpedition("gracie"), status: "running" as const };
  s.enemies = [
    {
      ...s.enemies[0],
      x: CAMP.x + 60,
      y: CAMP.y,
      hp: 100,
      maxHp: 100,
      kind: "charger",
      cooldown: 0,
    },
  ];
  const a = stepExpedition(s, { ...EMPTY_INPUT, attack: true }, 1 / 60);
  assert.ok(a.enemies[0].hp < 100);
  assert.ok(a.enemies[0].warning > 0);
  const held = stepExpedition(a, { ...EMPTY_INPUT, attack: true }, 1 / 60);
  assert.equal(held.enemies[0].hp, a.enemies[0].hp);
  const burst = stepExpedition(a, { ...EMPTY_INPUT, burst: true }, 1 / 60);
  assert.ok(burst.player.burstCooldown > 7);
  const again = stepExpedition(burst, { ...EMPTY_INPUT, burst: true }, 1 / 60);
  assert.equal(again.enemies[0].hp, burst.enemies[0].hp);
});
test("guardians gate shrines, all three summon boss, one terminal win", () => {
  let s: Expedition = {
    ...createExpedition("inko"),
    status: "running" as const,
  };
  s.player = { ...s.player, ...SHRINES[0] };
  s = stepExpedition(s, EMPTY_INPUT, 1 / 60);
  assert.equal(s.shrines[0], false);
  s.enemies = [];
  for (const shrine of SHRINES) {
    s.player = { ...s.player, ...shrine };
    s = stepExpedition(s, EMPTY_INPUT, 1 / 60);
  }
  assert.deepEqual(s.shrines, [true, true, true]);
  assert.equal(s.bossSpawned, true);
  assert.equal(s.enemies[0].kind, "warden");
  s.player = { ...s.player, ...BOSS_GROVE };
  s.enemies[0].hp = 1;
  const won = stepExpedition(s, { ...EMPTY_INPUT, burst: true }, 1 / 60);
  assert.equal(won.status, "won");
  assert.equal(stepExpedition(won, EMPTY_INPUT, 1), won);
});
test("upgrade pauses combat and saved runs preserve progress and pet identity", () => {
  const s = {
    ...createExpedition("gracie", 1, "run-test"),
    status: "running" as const,
    choice: true,
  };
  assert.equal(stepExpedition(s, { ...EMPTY_INPUT, x: 1 }, 1), s);
  const upgraded = upgrade(s, "power");
  assert.equal(upgraded.power, 1);
  assert.equal(upgraded.choice, false);
  assert.equal(
    restoreRun(serializeRun(upgraded), "gracie", 1)?.run,
    "run-test",
  );
  assert.equal(restoreRun(serializeRun(upgraded), "inko", 1), null);
  assert.equal(restoreRun("{broken", "gracie", 1), null);
  assert.equal(
    restoreRun(
      JSON.stringify({ ...upgraded, player: { x: null } }),
      "gracie",
      1,
    ),
    null,
  );
});

test("malformed nested checkpoint entries fail closed, evolution preserves the run", () => {
  const s = {
    ...createExpedition("gracie", 0, "same-run"),
    status: "running" as const,
  };
  for (const corrupted of [
    { ...s, pickups: [null] },
    { ...s, projectiles: [null] },
    { ...s, enemies: [{ ...s.enemies[0], home: undefined }] },
    { ...s, player: { ...s.player, dashCooldown: undefined } },
  ])
    assert.equal(restoreRun(JSON.stringify(corrupted), "gracie", 0), null);
  const evolved = restoreRun(serializeRun(s), "gracie", 1)!;
  assert.equal(evolved.run, "same-run");
  assert.equal(evolved.stage, 1);
  assert.equal(evolved.player.maxHp, s.player.maxHp + 2);
});
