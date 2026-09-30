# Wildwood Expedition implementation plan

User authorizes direct implementation, image generation, public repository research/cloning,
and deployment. Continue the existing Pets game improvement without another approval loop.

**Goal:** Replace the small static three-wave arena with a visually rich, explorable pet action adventure.
**Architecture:** Deterministic simulation/world geometry separate from Canvas renderer and React input/HUD.
**Constraints:** Keep original pet atlas/motion identity, bilingual UI, keyboard/touch, reduced motion,
real collision and traversable paths, explicit sound opt-in, local run checkpoint, once-only Pets reward.
**References:** Understory live visual inspection; SURGE-for-Oinja; awesome-gpt-6-astra, cloned under reference/checkouts.

- [x] Research reference games, record provenance/licenses; generate original cover art.
- [x] World: 3200×2400 forest, stream/bridges, 3 guarded shrines and boss grove; collision, pickups.
- [x] Combat: combo slash, dash invulnerability, radial skill, varied enemies with warning attacks, upgrades.
- [x] Renderer: following camera, depth-sorted forest/ruins, water, light/fog/particles, minimap.
- [x] UI: title screen, objective HUD, responsive fullscreen, touch joystick/actions, pause/save/resume.
- [x] Verify simulation/completion, browser combat/controls/save, screenshots desktop/mobile; final review.
- [x] Merge and deploy; exercise the production game.

Success means the player travels beyond the viewport through meaningful destinations and can complete
an expedition, make combat decisions, see attacks coming, collect growth and resume after reload.
References inform design; unlicensed source/art is not redistributed. No unrelated hosted game replaces Pets combat.

## Verification evidence

- 38 unit tests pass, including connected traversal, water/trunk collision, damage/cooldown,
  shrine gates, terminal boss win, malformed nested save rejection and evolution migration.
- `scripts/simulate-expedition.ts` completed all shrines and boss with normal Gracie stats,
  real path movement and cooldowns: 16 kills, 2 health remaining. This is a deterministic
  control simulation, not a claim of a human playthrough.
- `scripts/verify-expedition.ts` passed 390×844 and 1440×1000 browser flows: movement,
  dash, resume from checkpoint, actual enemy defeats, fullscreen visibility, reduced-motion
  and animated rendering, memory-only preference-change retention, no page errors/overflow.
- Existing six desktop/tablet/mobile light/dark Pets flows still pass hatch and growth.
- Independent source review findings fixed: stage migration, joystick multitouch release,
  checkpoint schema validation, immutable reward run ID, timer domain and memory fallback.
- Screenshot inspection caught normal-motion ancestor transforms clipping fixed fullscreen:
  replaced expansion with a native modal dialog top layer and rechecked actual visibility.
- Generated cover and four-tree RGBA atlas are originals. Alpha samples verified; original
  assets remain intact and Next image optimization delivers the runtime versions.

## Production delivery

- PR #5 merged: https://github.com/leduy-it/duyle-portfolio/pull/5
- Implementation commit `9176829`; main merge `de3ae80`.
- Vercel deployment `dpl_9BHnDNXntuK4trBQhyNA8ZPNW4kE` reached READY.
- Explicitly assigned `https://leduy.vercel.app` to this deployment.
- Production browser verification passed at 390×844 and 1440×1000: movement,
  dash, checkpoint resume, combat, expanded viewport and no JavaScript errors.
- Production screenshots inspected at `/tmp/wildwood-production/`.
