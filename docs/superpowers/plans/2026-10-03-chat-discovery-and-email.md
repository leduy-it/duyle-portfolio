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
- [ ] T6 — Fix production email delivery. Confirm provider configuration, use free provider only, keep recipient fixed, preserve draft on failure, distinguish provider acceptance from delivery. Add a read-only delivery-capability response so an unconfigured deployment does not present a broken Send button. Production currently lacks `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`; configuration choice and one test-email authorization are pending.
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
