# Portfolio task tracker — 2026-10-04

Each task gets a focused commit on `feat/portfolio-observability`; unrelated main-thread edits stay untouched. Production verification is separate from implementation.

- [x] OBS-1 Persist conversation turns server-side, including partial/failed replies, stable conversation and turn IDs, pagination and private owner access. Keep old analytics data.
- [x] OBS-2 Capture button/link use, pet actions, chat/email opens and email funnel; owner charts and detailed session/event history. Respect DNT and owner exclusion.
- [x] OBS-3 Owner conversation browser, 50-record pagination, full text/media references and export.
- [x] MAIL-1 Durable website contact inbox, researched free Brevo/Resend adapters, idempotent sends and truthful stored/accepted/error states.
- [ ] MAIL-2 Production provider API key, sender verification and actual inbox delivery test — awaiting owner account setup.
- [x] VOICE-1 Context-aware Vietnamese banter; preserve English replies and serious tone. Research current expressions without falsely dating old memes as 2026.
- [x] VIS-1 Sharpen mobile Three.js, camera framing, metal cinema reels, textured Research planet, diverse restrained transitions.
- [x] VIS-2 Real Jupiter surface from NASA, richer starfield and clear mobile Arcade composition; keep all games functional.
- [x] RELEASE-1 Scoped integration, lint/typecheck/build, functional/visual checks, production alias and receipts. Mark only verified tasks complete.

## Storage / interpretation

Redis is already configured in production. Never trim old records or set automatic expiry on the history. A free database has a finite quota; support export and show storage errors rather than silently substituting empty results. Clicks, provider acceptance and inbox delivery are distinct. An accepted API request does not prove inbox arrival. Earlier conversations and clicks were not collected and cannot be reconstructed.

## Tracking verification

Lint, typecheck, production build and unit tests pass. Two browser checks passed against the production build and real Redis in a dedicated verification namespace: terminal/companion chat, contact submit, private admin access, media references, full conversation export, DNT exclusion and voluntary contact storage. Fixed owner timestamp hydration. Production deployment is READY at https://leduy.vercel.app (dpl_4ewVzgNohR6htMYGdt29hWi3Ysev). Actual server transcript storage was verified, and the stored record remains intact after two subsequent releases. Private conversation requests return 404 when unauthenticated. Contact capability reports inboxAvailable=true and deliveryAvailable=false; actual email delivery remains MAIL-2.

## Visual / delivery verification

70 unit checks and seven cover/navigation browser checks passed on the production build. The final production release passes all six model variants at full DPR 3 on a 390px phone, the 375px overflow check, Jupiter/game launch, 27 game count, Timeline order, saved archived laptop story, local textures and attribution. No browser exceptions observed. Local owner admin screenshot uses isolated verification data. Release receipt and screenshots: /home/duyle/Downloads/leduy-social-assets-2026-10-04/production-premium-and-tracking.json.

Each change is committed on feat/portfolio-observability. Source is integrated into the canonical working tree through hash guards without changing main HEAD or its index. Full deployment uses the reviewed snapshot including existing portfolio work. MAIL-2, the remaining cafe original and unresolved native FB metadata stay open; none are marked delivered/acquired.
