# Pets districts and playable arcade — 2026-09-30

User requested continued implementation, stronger game references, and direct asset reuse.

1. [x] Inspect reference collection and actual per-work licenses.
2. [x] Fix the label selector hiding LivingPet sprites.
3. [x] Give habitat full width; remove duplicate hero pet; contextual resident inspector.
4. [x] Add destination strip and owned/all/search collection organization.
5. [x] Self-host licensed Last Beacon and Orbital Garden, lazy launch, close/unmount and credits.
6. [x] Verify desktop/mobile, game launch/close, save behavior and screenshots.
7. [x] Whole-change review, integrate and deploy.

Ruling: reuse the complete independent guest experiences with clear attribution and
separate scores. Do not claim upstream procedural models or game code as original Pets work.
Existing portfolio progress and original pet identity stay in the existing save system.

Verification: 32 unit tests pass; six responsive/theme flows pass; two arcade viewport flows pass including native inspector Escape/focus, first wave start, iframe removal, and unchanged Pets save. Typecheck, lint, production build pass. Review finding about inspector keyboard focus fixed with native modal dialog.

Production: PR #4 merged as `d55ab1f`; Vercel deployment `dpl_HqgPNZhkrpZ5oNeZUf1du94WoZM8` READY and aliased to https://leduy.vercel.app. The arcade browser flow passed against that actual domain at widths 390 and 1440, including first wave launch, both experience canvases, close/unmount, focus restoration and unchanged save. Captures: `/tmp/pets-arcade-production/`.
