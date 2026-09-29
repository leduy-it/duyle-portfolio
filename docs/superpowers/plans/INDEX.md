# Portfolio upgrade task index

Branch: `feat/gracie-companion` · Target: `leduy-it/duyle-portfolio:main`

This is the authoritative checklist for the complete request. Update a task only after recording its changed files, validation evidence, and remaining external dependencies. User corrections stay here and in the design spec, so a resumed session continues from the first unfinished task.

## Decisions and corrections

- Use the independent `duyle-portfolio` repository; preserve the original fork.
- Gracie is polished and smooth, defaults to visible, and has a persistent header switch plus a hide button. Audit light-mode contrast across the whole portfolio.
- Gracie appears throughout the public portfolio. `/pets` is its own hatchery/world page.
- Start with a furnished, active world and owned pets/eggs; keep all workflows available. Persist progress across visits; no forced tutorial or restart.
- Include hatching, housing/placement, item production, evolution, and one active combat mini-game.
- The supplied source reference is `leduy-it/portfolio-clone`. Its checked `main` has no bunny/pet assets; use original pixel art and an honest reference link.
- Chat: factual portfolio knowledge, funny Vietnamese/English banter, mild playful comeback, no invented relationship facts, political deflection, real free-model comparison.
- Keep the existing email recipient; change delivery provider.
- The owner corrected the login passphrase spelling. Keep its value out of committed notes. Current source accepts the corrected spelling; deployed auth failure still needs evidence.
- Requested deployment date: 2026-09-29, Asia/Ho_Chi_Minh. Continue overnight; publish only when ready.

## Indexed tasks

| ID | Task | Status | Dependency / evidence |
| --- | --- | --- | --- |
| T01 | Locate checkout, compare upstream/fork, preserve WIP | Done | canonical checkout identified; clean starting source |
| T02 | Create independent repository and populate `main` | Done | `origin/main` at `75872b5`; fork false |
| T03 | Inventory reference pet resources | Done | fresh GitHub tree has only `main`, no pet/bunny/shop assets |
| T04 | Master index, specs, execution ledger | Done | this index and linked plans |
| T05 | Baseline desktop/mobile screenshots | Done | old public homepage captured at desktop and mobile sizes; deployed app is older than source |
| T06 | Chat knowledge and playful bilingual persona | Implemented; live probe pending | [Chat plan](2026-09-28-gracie-and-chat.md) task 1 |
| T07 | Research and live-compare free models | Blocked externally | catalog researched; replacement OpenRouter key not confirmed |
| T08 | Global Gracie, quick-chat states, terminal handoff | Verified locally | visibility, gaze/states, draft/history handoff, interrupted terminal stream and short viewports |
| T09 | Versioned seeded pet save and progression rules | Implemented; regression checks pass | [Pet plan](2026-09-28-pet-world.md) tasks 1–2 |
| T10 | `/pets` art, hatchery/shop, housing, factory, evolution | Implemented; browser evolution/hatch/save pass | Pet plan task 3; T09 |
| T11 | Active arena combat, desktop/mobile controls, rewards | Verified locally | movement, keyboard pause, touch controls, projectile simulation, repeat-reward protection |
| T12 | Canonical `/movie` routes and old-link redirects | Verified locally | 308 redirects and destination 200; [Service plan](2026-09-28-movie-and-contact.md) task 1 |
| T13 | Resend contact endpoint, validation, idempotency, fallback | Implemented; mocked provider checks pass | Service plan task 2; production sender/key needed |
| T14 | Trace/fix deployed owner authentication | Code fixed; live config blocked | no public bypass; config error separated from wrong input; auth tests pass |
| T15 | Durable visitor statistics on Vercel | Code implemented; Redis not provisioned | [Analytics plan](2026-09-29-admin-and-analytics.md); existing store is local JSONL |
| T16 | First viewport polish and ambient animation | Implemented; light/overflow fixes verified | [Visual plan](2026-09-29-visual-polish.md); T05 |
| T17 | Desktop/mobile screenshots and interaction verification | Done locally | 320/390/844/1440 widths; light/dark; storage, handoff, arena; pets and movie Lighthouse accessibility 100 |
| T18 | Meaningful regression checks, production build, branch review | Verified locally | 25 tests; lint/typecheck/build; one independent review, all four Important and two Minor findings fixed |
| T19 | Push feature branch, create PR, merge personal `main` | [PR #1](https://github.com/leduy-it/duyle-portfolio/pull/1) | published; integration state is recorded on the linked PR |
| T20 | Configure/redeploy Vercel and verify live deployment | Blocked externally | T19; provider configuration and Vercel access |

## External prerequisites

- OpenRouter: revoke the exposed old key; user confirms a replacement is configured before any live probe.
- Resend: a server API key and a verified sender/domain; keep the public recipient address unchanged.
- Analytics: durable Redis integration on the Free plan; configuration must persist across deployments.
- Vercel: identify the existing project/deployment and connect the standalone repository; never report a production result from local checks alone.

## Work record

- Initial source: `75872b5`. Worktree setup: `da7ca78`. Initial companion spec: `c8acb8b`.
- No feature code or product tests have been changed/run before this index was created.
- Browser baseline attempt: `https://leduy.py` is a placeholder that currently fails DNS. Use the real deployment discovered through Vercel or local dev, not this domain.
- Auth investigation: `ADMIN_PASSPHRASE` controls login; `ADMIN_SECRET` signs sessions. Current local-file tracking cannot provide durable serverless statistics.

Detailed execution notes live in this plan's ignored `.superpowers/sdd` workspace. Summaries and validation results are added here at milestone completion.

## Implementation checkpoint

- See [delivery notes](2026-09-29-delivery-notes.md) for provider setup and verified boundaries.
- Native browser testing connection is available; user browser connection is no longer needed for local UI checks.
- Browser evidence so far: pet evolution, hatching, save after navigation, quick-chat draft handoff, hidden preference after reload. Light home: no console errors and scroll width equals client width after canvas fixes.
- Security dependency pass: Next 15.5.14 → 15.5.26, compatible dependency patches, PostCSS override, tsx 4.21.0 → 4.23.15. npm audit reports zero vulnerabilities after installation.

## Final local verification — 2026-09-29

- Source review: four Important findings fixed in one pass: preserve unread pet saves, preserve active terminal streams on empty handoff, reject truncated SSE, fit popup controls on short viewports. Also fixed development salt reuse and the documented sender variable.
- Browser regression: simulated one-time storage read denial preserves 12,345 stored coins; reload recovers that exact save. A local partial SSE fixture survives empty Gracie handoff and completes afterward. These are fixtures, not a live model evaluation.
- UI: no horizontal overflow at 320px. At 844×390 the popup top is 12px and controls remain visible. Pet and movie light-mode Lighthouse snapshots score 100 for accessibility, best practices, SEO and agentic browsing; performance was not audited.
- Game: latest arena movement and Escape pause exercised; stationary attacks lose against ranged wisps as intended. Pure simulation covers projectiles, cooldowns, invulnerability and victory; save tests cover exactly-once rewards.
- Provider checks remain mocked. The old public homepage returns 404 for `/api/admin/login`; its Vercel project/commit must be identified after login.

- Additional home/Gracie Lighthouse check found undersized legacy terminal traffic-light buttons. Expanded their hit areas to 24px while retaining 12px dots.

- Final home + open Gracie popup mobile Lighthouse snapshot: all four audited categories score 100 after expanding terminal controls. 320px width still has no overflow. Vercel CLI was rechecked and remains logged out.

## Correction — original pet repository and animation, 2026-09-29

The earlier asset search was incomplete: it inspected portfolio-clone but missed the owner's public hatch-pet-plus repository. Original assets are now copied unchanged from leduy-it/hatch-pet-plus commit 08265025817432bd58fb2ddcd9d2d002ad4c7e23. There are 21 pet packs/evolution lines in that tree (README says 19).

- Replace the drawn SVG companion with the original blue Bunny atlas, nine animation lanes and sixteen directional look cells.
- Pointer/touch drag with viewport bounds, saved position, left/right running poses and drag-click suppression. Keep single quick-chat and double-click terminal handoff.
- Habitat, roster and arena use source atlases, preserving old save IDs. Gallery exposes every source pack and nine lanes; Volt's original evolved atlas is selectable. Only shipped source evolution art is used.
- Confirmed live chat returns HTTP503 temporarily_unavailable because production has no Redis. Both clients now distinguish incomplete server setup from transport failure, preserving drafts. Redis and rotated OpenRouter key confirmation still required; no live model quality claim.

### Additional owner corrections

- Add Evolution Studio with original form previews for Volt, Grove and Sprocket; no invented form artwork. Preview does not spend currency or alter save progress.
- Replace the “HOME SWEET HOME / The meadow is awake” section with an integrated scene, floating Grove/Dusk/Moon controls and draggable habitat residents.
- Opening chat docks the mascot next to the popup without covering it; closing restores its free-drag position.
- Every source pack/form can be selected as the sitewide companion; recommend Inko. Persist the selection independently from world progress and retain the visibility preference.
- Screenshot inspection found legacy SVG rules stretching atlas portraits (e.g. 110×145 instead of 110×119.17). Atlas portraits now enforce their source cell aspect ratio; homepage companion measured 108×117, exactly 192:208.

### Woodland and service correction — 2026-09-29
- Replace flat habitat with compressed generated woodland backdrop; retain original source pet atlases.
- Remove sliding CSS animation, use source idle/gaze and one greeting cycle on hover; compact portrait to 96 px.
- Owner login distinguishes missing admin config from missing Redis. Terminal no longer claims the agent is online before a provider request.
- Production Redis absent, Upstash terms await owner acceptance; replacement OpenRouter key unconfirmed. Chat and login are not operational yet.

### Analytics expansion — 2026-09-29
- Production snapshot contained one recorded pageview at 15:36 UTC after Redis activation; no historical backfill exists.
- Add retained-history timestamps, approximate city/region/timezone, viewport, language, device, allowlisted campaign tags, observed entry/last pages and repeat-session visitors.
- Refresh totals with live activity; change renewed session cookie expiry from 30 days to 30 minutes. Explain estimated visitor identity and collection exclusions.
- Geo header reference: https://vercel.com/docs/headers/request-headers
- Local production build, lint and type validation passed.

### Quiet companion discovery — 2026-09-29
- Navigation label Pets in both languages.
- Lightweight dismissible hint after 90 seconds of foreground viewing, suppressed during quick chat and on Pets/admin; once per seven days per browser.
- Only clicking the hint opens a validated companion deep link, selects the preview and highlights the explicit Set companion button. No automatic pet change.
- Production build with lint/type validation passed.
