# Chat discovery, LinkedIn assets and contact delivery

**Goal:** Visitors can discover Duy's work, life, cinema, pets and games from either chat surface, preview actual media, navigate directly, and resume their conversation.

**Execution:** Implement sequentially in this session, as requested. No subagents. Keep this checklist current; do not mark email delivery complete without production evidence.

**Design:** A shared content catalog is derived from existing site data. Both clients render validated catalog cards and hyperlinks; the model cannot invent a media URL or destination. Session-scoped conversation snapshots survive route navigation. No new paid services or dependencies.

## Tasks and acceptance

- [x] T1 — Download LinkedIn gallery assets and add the 2023 hackathon entry to Life. Use original resolution, factual captions, actual event date, local files and provenance. Verify assets load.
  Files: `src/data/life-stories.ts`, `src/components/life/life-page.tsx`, `public/images/life/`, `tests/04-life.spec.ts`.
- [x] T2 — Shared knowledge catalog covering Life/photos/videos, Experience, Blog, Movie, Arcade and Pets. Keep canonical links and current experience facts in sync with source data. Film anticipation is not proof of release or viewing. Verify intent retrieval and unknown-card handling.
  Files: `src/lib/chat/catalog.ts`, `knowledge.ts`, `prompts.ts`, `tests/chat-catalog.test.ts`.
- [x] T3 — Shared rich reply renderer in terminal and pet popup: safe hyperlinks, photo/video previews, source labels, direct page links and a separate new-tab button. Preview videos never autoplay. User messages remain plain text. Verify unsafe links are inert and real cards appear in both surfaces.
  Files: `src/components/chat/rich-message.tsx`, `rich-message.css`, `src/components/home/terminal-chat.tsx`, `src/components/pets/gracie-companion.tsx`.
- [x] T4 — Preserve conversations and drafts when visiting linked pages; double-click pet restores the terminal conversation. Show a persistent return hint away from home, with an accessible button alternative. Verify terminal → Life/Arcade → pet → terminal preserves history/draft.
  Files: `src/lib/chat/session.ts`, terminal and companion components, `tests/05-chat-discovery.spec.ts`.
- [x] T5 — Replace pet toggle/hide symbols with a polished shared icon, preserve visibility preference and keyboard labels. Verify desktop/mobile and disabled-motion behavior.
  Files: `src/components/pets/companion-icon.tsx`, `companion-toggle.tsx`, `gracie-companion.tsx`, `gracie.css`.
- [ ] T6 — Fix production email delivery. Confirm provider configuration, use free provider only, keep recipient fixed, preserve draft on failure, distinguish provider acceptance from delivery. Add a read-only delivery-capability response so an unconfigured deployment does not present a broken Send button. Production currently lacks `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`; a verified sender account and private provider key are pending; the owner has authorized the delivery fix and test.
  Files: `src/app/api/contact/route.ts`, terminal compose UI, `.env.example`, `tests/contact.test.ts`.
- [x] T7 — Review changed paths; run meaningful unit/browser tests, typecheck/lint/build. Check public site behavior after deployment if requested. Record exact completed/pending tasks and evidence below.

- [x] T8 — Restore the independently timed hidden-feature popup. Explain typing `leduy leduy` outside text fields opens owner login; keep authentication. Preserve the existing pet-change popup, plus a separate return-to-chat hint. Verify Strict Mode timers and distinct dismissal/cooldown state.
- [x] T9 — Lightweight hybrid RAG: precompute Jina passage embeddings for public, attributable portfolio/social facts; query embeddings server-side with timeout, bounded cache, lexical fallback and no vector database. Copy authorized existing Jina credential securely into local/deployment secrets. No paid top-ups. Source text is data, never an instruction.
- [x] T10 — More capable bilingual assistant. Latest visitor message controls reply language, including English in a Vietnamese UI and language switches mid-thread. Answer engineering/career, biography, social media, films, games, pets and collaboration questions with retrieved evidence. Friendly appearance banter is clearly playful, never a factual ranking.
- [x] T11 — Photo requests show multiple actual portrait/media cards with large previews. Reuse owned public assets and avoid confusing an organizer group photo with a confirmed individual portrait.
- [x] T12 — Responsive terminal: near-full-screen maximize, outside click/Escape restore, explicit compact/reset control, user resize with safe viewport bounds, preserved conversation across every size. Verify small phones and desktop.
- [x] T13 — Crawl additional public owner social/profile facts where accessible; record source and acquisition date. Do not infer private facts or turn reposts into authored work. Record access limits rather than claiming complete synchronization.
- [x] T14 — Deploy reviewed changes to the linked Vercel project and verify stable alias, chat language/RAG, assets and delivery capability. Update this checklist with concrete evidence and any unresolved external configuration.

## Review focus

- Model text cannot inject HTML, scripts, arbitrary image URLs or private routes.
- Chat navigation preserves an unsent draft and never overwrites a newer snapshot with stale companion history.
- Browser Back and locale changes retain a real conversation; initial welcome text is not saved as user history.
- A streamed partial answer cannot render a broken card token; storage denial still permits client navigation.
- Email acceptance is not proof of inbox delivery, and missing credentials are not reported as successful sending.

## Evidence

2026-10-03: LinkedIn gallery has a personal SoICT certificate (event 28–29 Oct 2023) and a linked organizer group photo. Two activity posts inspected were reposts, so they are not treated as Duy's own photo posts.

2026-10-03: Vercel production env inventory confirms both Resend variables absent. Local env has only the chat provider key. No test email has been sent.


## Execution ledger

- T1: complete — two LinkedIn Honor gallery images saved locally; Life Playwright checks 3/3 passed (including 375px reduced-motion and real image decode).
- T2/T3/T4/T5: complete — shared allowlisted catalog, native photo preview, local video cards, route/new-tab controls, bounded request history and session snapshots. Chat browser scenarios pass; unsafe destinations remain inert.
- T8: complete — separate 30s foreground secret hint and existing 90s pet discovery; independent cooldown keys and dismissals. Name-twice owner trigger ignores text fields and preserves passphrase login. Strict Mode setup cleanup corrected. Fake foreground clock test passes.
- T9/T10/T11: complete — 108 public documents embedded with Jina v3 at 256 dimensions. Query cache 15min/200 entries; shared daily query cap 100; 2.2s provider timeout; lexical fallback on quota/outage/missing secret; stale document hashes cannot use old vectors. Regeneration reuses unchanged embeddings. Latest-message language overrides prior Vietnamese history. Appearance banter has owner-curated bilingual text plus real portraits.
- T12: complete — viewport portal maximize, backdrop/Escape restore, compact reset and native resize. Phone375px/desktop1280px browser checks pass, without horizontal overflow.
- T13: complete for reachable public content — inspected LinkedIn About/award images, Instagram bio and three visible photo posts/highlight labels, Facebook public intro and university link. Private fields/restricted posts/reposts excluded. Curated snapshot dated 2026-10-03; no claim of complete automatic sync.
- T6: partial — truthful GET capability and free mail-app fallback verified. Production provider credentials absent; Resend choice and one-test-email authorization pending. No email sent or inbox delivery claimed.
- Review: self-review (side conversation disallows subagents). Important finding: long assistant answers were dropped by 2000-character session validation. Fixed with role-specific display limits and a separate10000-character request budget; regression test RED→GREEN.
- Ruling: retain original checkout to preserve authorized existing side-thread edits and avoid disrupting the parent. No unrelated untracked files staged.
- Verification so far: 50/50 unit tests; 9/9 relevant browser tests. Live local English engineering answer200 and Vietnamese curated appearance answer200. Lint/typecheck passed before final review refinements; build/deploy still pending.

- T7: complete — npm test50/50, relevant Playwright9/9, lint0 errors, typecheck0 errors, next build38 pages succeeded. Reviewed source and new files; no independent reviewer (side-thread restriction).
- Production JINA_API_KEY configured as Vercel Secret on portfolio-leduy. No new paid subscription or top-up created.

- Deployment attempt1 failed: unanchored data/ exclusion also excluded src/data. Fixed exclusions to root-only /data/, /tasks/, /test-results/; stable production alias remained on previous healthy deployment.

- T14: complete — production deployment dpl_MSQ6VyMgF9gYKnP3wmbdCTdxkyJp READY; alias leduy.vercel.app explicitly assigned. Source commits81c5656/0270bcf pushed to origin/main. Stable alias / and /life200; both new LinkedIn assets200; live chat200 with X-Retrieval hybrid and English text despite Vietnamese history; curated Vietnamese appearance reply200; production photo cards render and Life→Resume chat preserves unsent draft. GET /api/contact200 reports available:false as expected. No email test sent.

## Continuing content updates

1. Add owned, public photo/video assets to public/images/life or public/videos/life and add dated source metadata in src/data/life-stories.ts. Keep post date distinct from photo capture date. Professional notes may be added to src/data/social-knowledge.ts with acquisition date and public URL.
2. Run npm run chat:index; unchanged documents reuse existing vectors. Never commit an API key. Any changed document not reindexed automatically falls back to lexical evidence until its hash matches.
3. Run npm test, relevant Playwright cases, typecheck/lint/build, then deploy to the linked portfolio-leduy project and verify leduy.vercel.app.
4. Append newly requested improvements here with acceptance checks, status and real verification evidence. T6 remains open until a provider is configured and its live send is explicitly authorized; mail-app fallback is already available.

## Follow-up requirements (2026-10-03)

- [x] T15 — English identity uses Michael Le; Vietnamese uses Duy. Preserve legal names, URLs and source captions. Update chatbot alias/language instructions and English UI.
- [x] T16 — Mature restrained motion: remove home scanning line and pointer drift; avoid stacked entrances and perpetual glow. Respect reduced motion and foreground visibility.
- [x] T17 — Cinema and Research showcase actual multiple catalog entries, advance every 30 foreground seconds, with manual previous/next and pause controls; pause on hover/focus/hidden/offscreen. Share accessible carousel logic and remove unused decorative WebGL heroes. Verify navigation/mobile/reduced-motion/timing.
- [x] T18 — Web-grounded chat using existing Jina free token allowance, no paid search plugin or subscription. Search for general/current/explicit lookup questions, preserve owner RAG, bound quota/cache/timeout, render verified citation links in both chat surfaces, disclose unavailable search honestly.
- [ ] T19 — Add requested Facebook HUST portrait/first-year caption, hackathon laptop story and additional reachable owned posts to Life and chat knowledge. Store media locally with dates and provenance; no guessing or restricted unrelated content. Record exact access blockers.
- [x] T20 — Reindex changed public knowledge, run relevant checks, deploy and verify stable alias. T6 remains open for email provider configuration.

### Source acquisition follow-up

- Telegram @leduyAI public avatar downloaded to public/images/profile/telegram-leduyai-2026.jpg (320x320), immutable snapshot. Public display name Le Duy.
- Requested Facebook HUST photo fbid1892719761129975:29Oct2023,1536x2048; playful first-year caption, not education proof. Friends audience unchanged; owner specifically requested publication here.
- Facebook black-shirt MacBook portrait fbid1823820731353212:30Jun2023, downloaded. This is an end-of-semester post, NOT verified as the October hackathon story.
- All14 currently visible highlight cards inspected: Báo8, #myday5, ##myluv1. Inventory in src/data/facebook-highlights.ts. Two originals downloaded (puppy and stream); twelve videos show MediaSource playback without a downloadable source. Browser download failed; public yt-dlp redirects to Facebook login / unsupported URL. No cookies exported or sent to a downloader service. Requested original exports from owner. Exact story dates are unavailable; not inferred from relative ages.
- Hackathon laptop STORY not found in the14pinned cards; remains open pending an exact story link or original export.

## Media and cover follow-up (2026-10-04)

- [x] T21 — Embed downloaded media directly in Life: 13/14 Facebook cards have saved media; all 8 Instagram highlighted cards; recent scenery stories. Keep exact dates and distinguish crossposted IG media from native FB originals. Unknown dates remain unknown; no autoplay; preload none; clamp media to source resolution. Add playable chat cards and refresh passage embeddings.
- Superseded T22 — Keep effects on both Cinema and Research covers, smaller and in pixel style. Retain carousel/manual controls and 30 foreground seconds. Native 2D canvas, eight frames per second; pause offscreen/hidden, static for reduced motion; preserve content readability on mobile.
- [x] T23 — Verify source snapshot, unit/browser checks, local visuals and stable production alias after deploy. Preserve unrelated main-thread WIP.
- [ ] T24 — Acquire remaining café highlight original and unresolved native FB audio/date metadata when Meta export becomes downloadable.

Media package at /home/duyle/Downloads/leduy-social-assets-2026-10-04 contains 19 downloaded videos, 5 photos and 9 extracted covers (including the newly selected 2023-12-21 side-profile story). One FB mirror video downloaded natively at 1200x720. FB export still preparing; café is the only pinned card without saved media. Forest story has matching IG photo only, without native FB music.


## Active delivery checklist — owner corrections, 2026-10-04

Work through this list sequentially; retain it across context compaction. Completion requires source evidence, browser verification and a production receipt.

- [x] T25 — Blog and Cinema covers: large original wormhole / reel models on the LEFT; introductory text on the right; full bleed background; no grey image gutters or repeated featured post/movie above the real list.
- [x] T26 — Three meaningful 3D variants per page, with smooth transitions. Research: original knot, textured Earth, alternate knot. Cinema: beveled metal reel, paired reels, fixed projector. Keep axle stable; fixed projector beam; dispose resources, pause offscreen/hidden and render statically for reduced motion. Next changes the cover, not a duplicated article/movie.
- [x] T27 — Shared motion polish: restrained route transitions, coordinated symmetric card entrances, short bounded stagger and soft hover; preserve reduced motion and keyboard navigation.
- [x] T28 — Experience: subtle terminal chrome, lighter background and typography, calm card motion, preserve all experience content.
- [x] T29 — Life: place The Timeline first after the cover, then saved FB/IG collections; keep archive shortcuts. Include the owner-confirmed black-shirt laptop image as a 2023 highlight. Exact highlighted-story day is unknown; the separate original post date stays 2023-06-30. Preserve saved media, source provenance and the pending cafe original.
- [x] T30 — Refresh chatbot media index, test revised covers/navigation/Life, integrate only guarded scoped changes and deploy; verify stable alias and save production screenshots. Report pending source acquisition honestly.

Previous interim pixel deployment: dpl_Am8UoKk7A83xRsXg5vJwL6jrBBKa, READY. Owner rejected the pixel replacement; T22 is superseded by T25/T26. The embedded 18-video archive is already in that deployment. Do not mark T24 done until the missing cafe source is actually obtained.

Local verification for T25–T29: lint/typecheck/build passed (38 routes); 56 unit tests passed; 12 Life/chat/cover browser checks passed, followed by the cross-platform navigation check (1 passed). Scene/Experience layouts inspected in Chrome. Production verification remains T30.

## Latest Life correction — 2026-10-04

- [x] T31 — Put The Timeline before highlights and Facebook collections; keep the cover and chronological entries. Verify section order on production.
- [x] T32 — Locate and save the owner-requested archived story showing Duy using a computer in side profile. This is outside highlights: add to the timeline only after identifying the original asset; retain its verified date and source.

T32 source acquired: Facebook archive card 576897117958045, created 2023-12-21T16:37:48. Matching Instagram archive bucket 18039501280627830; downloaded observed video/audio streams, muxed without re-encoding and decoded fully. 15 seconds, 720x1280, original AAC stereo, 416007 bytes. Added `laptop-side-2023` to timeline only; no highlight classification. Frame cover derived from video. Original Facebook stream still has no direct download option.

## Quality corrections — 2026-10-04

- [x] T33 — Sharpen mobile 3D: device DPR up to 3 with a pixel budget, camera fits the full model across aspect ratios, no scene blur, verify 375px and 390px phones.
- [x] T34 — Replace bare orbit rings with a shaded planet and atmosphere; rebuild Cinema as beveled metal film reels with real openings, film ribbon and projector. Keep three distinct covers, model left and 30-second/manual browsing.
- [x] T35 — Add varied entrances: assemble from different directions, symmetric left/right, depth fade; choose fresh patterns per navigation/cover change, keep bounded stagger and reduced motion.

## Latest verified release — 2026-10-04

T15–T18, T20, T23 and T30–T35 verified through source/unit/browser checks and production receipts. T17 follows the owner correction: Next changes distinct cover compositions, with the real research/film lists below. Seven browser checks cover 30-second foreground timing, hover/manual pause, 375px/390px layouts, six sharp model variants, game opening and cross-platform navigation. 70 unit checks passed; lint/typecheck/build passed with 39 routes.

T19 remains partially open: the HUST portrait and owner-confirmed black-shirt highlighted portrait are saved, but the exact October hackathon story is not independently identified. T24 remains open for the cafe original and native FB audio/date metadata. T6 remains open for provider sender verification and real inbox arrival.

Tracking is deployed separately from mail delivery: full submitted turns and errors, pet/buttons, contact funnel, private owner pages of 50, per-session history, charts and JSON export. Production Redis records survive redeployment; no automatic trim or expiry. Respect DNT/owner exclusions; no reconstruction of previously uncollected chat. See docs/portfolio-improvement-tasks.md and the dated Downloads release receipts.

- [x] T36 — Arcade: actual Cassini Jupiter surface, Three.js lighting, richer star background, mobile framing and 27 functional games.
- [x] T37 — Context-aware recent Vietnamese banter with dated sources, English replies stay English, serious topics stay serious.
- [x] T38 — Durable complete submitted conversations, private admin review, button/pet events, contact funnel, session journeys, charts, pages of 50 and export; preserve old data.
- [x] T39 — Durable contact inbox and free Brevo/Resend send adapters, truthful stored/accepted/error states, idempotency. Production sender/key and actual inbox arrival remain T6 / MAIL-2.
- [x] T40 — Focused commits on feat/portfolio-observability; guarded canonical integration, production deploy and receipts.

Final deployment: dpl_4ewVzgNohR6htMYGdt29hWi3Ysev, READY, https://leduy.vercel.app. Production receipt: /home/duyle/Downloads/leduy-social-assets-2026-10-04/production-premium-and-tracking.json. All six phone scene variants now render at full DPR 3 independent of animated parent scale; 375px has no horizontal overflow. Persisted transcript from the previous deployment survives. Unauthenticated admin API returns 404. Contact inbox is available; external email delivery remains unconfigured and is not claimed successful.
