# Portfolio task tracker — 2026-10-04

Each task gets a focused commit on `feat/portfolio-observability`; unrelated main-thread edits stay untouched. Production verification is separate from implementation.

- [x] OBS-1 Persist conversation turns server-side, including partial/failed replies, stable conversation and turn IDs, pagination and private owner access. Keep old analytics data.
- [x] OBS-2 Capture button/link use, pet actions, chat/email opens and email funnel; owner charts and detailed session/event history. Respect DNT and owner exclusion.
- [x] OBS-3 Owner conversation browser, 50-record pagination, full text/media references and export.
- [x] MAIL-1 Durable website contact inbox, researched free Brevo/Resend adapters, idempotent sends and truthful stored/accepted/error states.
- [x] MAIL-2 API-key-only setup replaced by the free FormSubmit path in MAIL-3. Actual Gmail arrival remains open in MAIL-3; Brevo/Resend remain optional alternatives.
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

## Owner follow-up — 2026-10-04

Priority order is explicit: conversation workspace first. Preserve these tasks across turns.

- [x] CHAT-UI-1 ChatGPT-like persistent thread sidebar, terminal-style complete transcript, near-full-screen open/restore, media/source previews, chronology, older-message loading, per-thread export; retain private authentication and existing charts.
- [ ] MAIL-3 Activate and verify a free FormSubmit contact relay without needing an API key; preserve durable inbox and truthful delivery states. Owner email activation/inbox confirmation may be required. Never resend older stored messages automatically.
- [x] FILM-1 Replace Project Hail Mary artwork with a high-resolution real 2026 film poster; verify source and local asset.
- [x] FILM-2 Add House of the Dragon with an actual high-quality portrait poster.
- [x] FILM-3 Add Spider-Man: Into the Spider-Verse with an actual high-quality portrait poster.
- [x] FILM-4 Add Schindler's List with an actual high-quality portrait poster.
- [x] FILM-5 Verified IMDb reference and where-to-watch navigation for every title; preserve notes navigation and avoid nested interactive links. Refresh chatbot media knowledge after the film changes.
- [ ] RELEASE-2 Focused commits per task, guarded integration, meaningful browser checks including fast thread switching/full-screen/mobile, production deployment and receipts.

## Browser identity — owner follow-up

- [x] BRAND-1 Use the owner’s existing pixel portrait for browser favicon, multi-size ICO and Apple touch icon; verify served bytes and metadata. Commit 59fcf77.

## Current verification — 2026-10-04

CHAT-UI-1 was deployed before the email/cinema follow-ups: dpl_7p1mfRqCBHHi6mC5YQP3XyZ3svu9, READY at https://leduy.vercel.app. A local authenticated browser test verifies full-size workspace, persistent sidebar, older turns, rapid switching, media/source rendering, Escape restore and mobile thread navigation. Existing charts/history remain intact. Production anonymous conversation access returns 404.

The email adapter and UI are implemented and tested (ebdda9f); FormSubmit acknowledged the owner setup request. MAIL-3 stays open until the owner activates the form email and confirms actual Gmail arrival. No API key or paid service is required. An acknowledgement is recorded as a submission reference, never mislabelled as a provider message ID. Uncertain requests are not sent again.

Cinema now includes 11 films/series. Four original promotional posters are local assets with dimensions, source and hashes in public/images/films/credits.json. Hail Mary is the 2026 film poster. Every title has a verified IMDb URL plus IMDb watch-options navigation; availability depends on region and provider. No streaming availability is asserted. New knowledge was indexed into 154 public documents; only exact curated IMDb destinations are enabled. New title notes do not claim a personal viewing history.

Verification before the final release: 73 unit checks, lint, typecheck, production build (43 generated pages) and browser checks for full conversation workspace, all 11 IMDb links, notes navigation, no nested anchors, four loaded mobile posters at DPR 3, no horizontal overflow, favicon served-byte matching, and truthful submitted-email confirmation. Final release receipt will record the production deployment separately.

The first email production probe exposed a server relay failure (502), while browser AJAX returned an explicit success acknowledgement. The follow-up preserves the private inbox first and uses one-use browser dispatch with a nonce-bound acknowledgement; admin clearly labels browser-reported evidence. MAIL-3 remains open for owner activation and confirmed Gmail arrival. This correction is separately committed; the failed probe is retained as evidence.
