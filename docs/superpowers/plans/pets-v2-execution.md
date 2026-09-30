# Pets v2 execution

Source plan: approved in conversation, 2026-09-29.

| ID | Deliverable | State |
|---|---|---|
| A1 | Preserve Codex atlas; portable skill runtime; extension manifest | complete |
| A2 | Inko directional and transition strips | implemented |
| A3 | Gracie directional and transition strips | implemented |
| A4 | Independent visual/geometry QA; source repo PR | complete; source PR #1 merged |
| D1 | Shared 21-pack registry; v2 migration/backups/import/export | implemented |
| P1 | Unified diorama scenes; responsive stage + inspector | implemented |
| P2 | Directional behavior, walkable placement, furniture undo | implemented |
| P3 | Seeded hatchery/factory/evolution/arena progression | implemented |
| P4 | Collection, companion deep links, quiet discovery | implemented |
| V1 | Desktop/mobile/light/dark and gameplay verification | 32 unit tests passed; six viewport/theme checks passed; production build passed |
| D2 | Pin source revision; PR, deployment and production checks | pending |
| E1 | Resend email delivery | blocked: missing RESEND_API_KEY and CONTACT_FROM_EMAIL |

Do not mark generated assets accepted before visual and structural QA. Existing saves and approved source artwork must be preserved. Generation uses hatch-pet + imagegen; extension motion is separate from the Codex 8x11 contract.

## Delivered scope
- 14 clips per Inko/Bunny: eight walking directions; front start/stop; rest, sleep, carry, celebration.
- Original approved east/west and celebration reused. Front transitions are not eight directional transition pairs.
- Four generated pixel environments; long scroll; responsive inspector; reduced-motion hydration repaired.
- v2 migration backs up v1, preserves purchased egg capacity; WebLocks; per-item decor conflict-safe undo; export/import.
- Independent code review findings repaired with regression tests.

## Remaining external dependency
Email delivery still requires verified Resend sender configuration and API key on Vercel. No delivery success is claimed.
