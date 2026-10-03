# Portfolio task tracker — 2026-10-04

Each task gets a focused commit on `feat/portfolio-observability`; unrelated main-thread edits stay untouched. Production verification is separate from implementation.

- [ ] OBS-1 Persist conversation turns server-side, including partial/failed replies, stable conversation and turn IDs, pagination and private owner access. Keep old analytics data.
- [ ] OBS-2 Capture button/link use, pet actions, chat/email opens and email funnel; owner charts and detailed session/event history. Respect DNT and owner exclusion.
- [ ] OBS-3 Owner conversation browser, 50-record pagination, full text/media references and export.
- [ ] MAIL-1 Research free email provider, retain submitted contact messages before delivery, idempotent sends and truthful delivery status. Production provider credentials/sender verification required.
- [ ] VOICE-1 Context-aware Vietnamese banter; preserve English replies and serious tone. Research current expressions without falsely dating old memes as 2026.
- [ ] VIS-1 Sharpen mobile Three.js, camera framing, metal cinema reels, textured Research planet, diverse restrained transitions.
- [ ] VIS-2 Real Jupiter surface from NASA, richer starfield and clear mobile Arcade composition; keep all games functional.
- [ ] RELEASE-1 Scoped integration, lint/typecheck/build, functional/visual checks, production alias and receipts. Mark only verified tasks complete.

## Storage / interpretation

Redis is already configured in production. Never trim old records or set automatic expiry on the history. A free database has a finite quota; support export and show storage errors rather than silently substituting empty results. Clicks, provider acceptance and inbox delivery are distinct. An accepted API request does not prove inbox arrival. Earlier conversations and clicks were not collected and cannot be reconstructed.
