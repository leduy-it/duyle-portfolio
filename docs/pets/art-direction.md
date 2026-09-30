# Pocket World art direction

2026-09-29: continuous scroll journey through the habitat, greenhouse hatchery,
workshop, arena and collection. Backgrounds use a consistent sage/cream/amber
pixel-art environment; original character atlas styles are preserved.

## Generated background assets

Built-in imagegen was used. No external image API or credentials were used.

- `public/pets/pixel-garden-v2.webp`: alpine meadow, cottage left, stream and bridge
  right, open central clearing, warm morning light; no baked characters or UI.
- `public/pets/pixel-hatchery-v2.webp`: botanical greenhouse, cream stone arches,
  timber side benches, vines, open moss-green tiled floor; no eggs or characters.

Source generation dimensions: 1536×1024. WebP quality 90, Pillow 11.1.0.
Scene artwork stays separate from pet atlases. Twilight uses an overlay rather
than rotating the palette of the whole scene. Backgrounds do not move under
pointer input; motion is reserved for living characters and small ambient details.

## Interaction and performance

- All chapters remain mounted; navigation scrolls to a chapter.
- Below-fold chapters reveal once; reduced-motion users see them immediately.
- Atlas playback pauses off-screen. Arena pauses when it leaves the viewport.
- A companion retains its own global selection across the site.
- Original source atlases keep their 8×11 geometry and aspect ratio.
- Motion extensions are accepted independently before use.

## Verification evidence

Initial production build and 28 tests passed. Local browser checks at 390, 768
and 1440px showed no horizontal overflow or page errors. Additional asset and
final deployment verification is tracked in `../superpowers/plans/pets-v2-execution.md`.

- `public/pets/pixel-workshop-v2.webp`: cozy timber inventors' workshop, arched
  mountain-view windows, cream walls, sage drawers, copper pipes and empty wooden
  floor. Runtime machines and pets are layered separately over the scene.

- `public/pets/pixel-arena-v2.webp`: moonlit forest courtyard, clear mossy stone
  fighting area with border lanterns and blue flowers. Arena movement now chooses
  approved directional motion strips where available.

Reproduce the asset sync with `node scripts/sync-pet-motion.mjs ../hatch-pet-plus`
after committing the accepted source assets. It records the exact source commit
and SHA-256 digests, and refuses uncommitted motion packs.

## Wildwood expedition — original generated illustration

Built-in imagegen, 2026-09-30. Saved `public/pets/wildwood/cover.png`.
Prompt: original premium indie fantasy action adventure title-screen illustration; tiny moon-blue
rabbit seen from behind entering a vast ancient forest; colossal twisted trees, moss, ferns,
winding amber-lit stone path toward a distant ruined moon shrine and turquoise crystal;
petrol green, olive, ivory light shafts, blue mist; painterly pixel-dither texture, cinematic
depth; subdued center-left for HTML title; no words, UI, logos or borders.

The playable map is separate original procedural geometry. Collision uses the same forest,
rock, path and river coordinates as rendering. Trees fade when obscuring the player.

Environment sprite sheet: `public/pets/wildwood/trees.png`, built-in imagegen, RGBA 1536×1024,
2×2 equal cells. Prompt: four isolated full ancient trees, emerald oak, cool moon forest,
amber ancient tree, dark conifer; elevated top-down view, fine painterly pixel-dither leaf
clusters, rooted trunks, moss, dappled upper-left light; transparent background, no ground,
labels or dividers. Original source alpha verified (background samples 0–1); render crops
cells directly without modifying source pixels. Procedural trees remain loading fallback.

## Pocket World arrival scene

Built-in imagegen, 2026-09-30. Saved `public/pets/world-arrival.webp` (WebP quality 90,
608 KB); generated source
`/home/duyle/.codex/generated_images/01a0e8c1-2d4e-7d80-b088-b5989eab92a6/exec-a2bb270f-8a75-4eea-ae84-a7aabb74ab26.png`.
Prompt: original wide dreamlike meadow bordering a huge living forest, warm cottage at the
left, greenhouse at the right, stepping-stone path toward misty sapphire mountains and
observatory, flowers and mushrooms, morning shafts, hand-painted depth with subtle
pixel-art edges, dark quiet title zone on the left and clear foreground for the selected
pet on the right, no characters, animals, text, logo or UI. The actual pet uses the existing
source atlas and motion strips layered in HTML so its identity and animation stay exact.
