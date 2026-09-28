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
| T05 | Baseline desktop/mobile screenshots | In progress | old public deployment found via repository homepage; browser capture obtained |
| T06 | Chat knowledge and playful bilingual persona | Implemented; live probe pending | [Chat plan](2026-09-28-gracie-and-chat.md) task 1 |
| T07 | Research and live-compare free models | Blocked externally | catalog researched; replacement OpenRouter key not confirmed |
| T08 | Global Gracie, quick-chat states, terminal handoff | Implemented; browser checks in progress | Chat plan task 3 |
| T09 | Versioned seeded pet save and progression rules | Implemented; regression checks pass | [Pet plan](2026-09-28-pet-world.md) tasks 1–2 |
| T10 | `/pets` art, hatchery/shop, housing, factory, evolution | Implemented; browser evolution/hatch/save pass | Pet plan task 3; T09 |
| T11 | Active arena combat, desktop/mobile controls, rewards | Implemented; simulation checks pass | Pet plan task 4; T09 |
| T12 | Canonical `/movie` routes and old-link redirects | Implemented; HTTP check pending | [Service plan](2026-09-28-movie-and-contact.md) task 1 |
| T13 | Resend contact endpoint, validation, idempotency, fallback | Implemented; mocked provider checks pass | Service plan task 2; production sender/key needed |
| T14 | Trace/fix deployed owner authentication | Code fixed; live config blocked | no public bypass; config error separated from wrong input; auth tests pass |
| T15 | Durable visitor statistics on Vercel | Code implemented; Redis not provisioned | [Analytics plan](2026-09-29-admin-and-analytics.md); existing store is local JSONL |
| T16 | First viewport polish and ambient animation | Implemented; light/overflow fixes verified | [Visual plan](2026-09-29-visual-polish.md); T05 |
| T17 | Desktop/mobile screenshots and interaction verification | Pending | features implemented; compare to T05 |
| T18 | Meaningful regression checks, production build, branch review | Pending | T06–T17 |
| T19 | Push feature branch, create PR, merge personal `main` | Pending | T18; user already authorized |
| T20 | Configure/redeploy Vercel and verify live deployment | Pending | T19; provider configuration and Vercel access |

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
