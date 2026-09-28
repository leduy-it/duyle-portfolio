# Gracie, Pet World, and Portfolio Chat Design

**Status:** implementation authorized; design decisions recorded under the user's delegated judgment.

## Outcome

Make Duy's portfolio feel inhabited by Gracie everywhere, with a witty bilingual quick chat that can hand off to the existing terminal chat. Give pets a separate `/pets` destination where visitors can hatch, collect, house, evolve, and play an active pixel combat mini-game. Improve real contact delivery and make the film collection canonical at `/movie`.

## Confirmed direction

- Gracie is the persistent site-wide mascot; the pet world is a distinct page at `/pets`.
- The pet page opens in a ready-to-play state. It has no required tutorial, no forced restart, and does not erase progress on navigation or reload.
- Visitors can explore the shop, home, factory, and arena immediately. A new browser receives a seeded save with Gracie, a starter pet or hatch-ready egg, starter items, and an already furnished habitat. Later visits resume that save. A separate reset control requires confirmation.
- The game should feel lively: moving pixel pets, active non-graphic combat, evolution, and a small production loop where pets make collectible items.
- Use the supplied `leduy-it/portfolio-clone` repository as a visible source/reference link. A fresh GitHub tree check found only `main` and no pet/bunny/shop assets there, so do not create broken raw-file references or claim those assets came from it. Draw original pixel-style SVG/canvas art and link the reference repository in the pet page credits.
- Chat should be knowledgeable, concise, funny in Vietnamese and English, avoid political debate, avoid inventing Duy's private facts, and return mild playful banter when the visitor is rude. It must not escalate into slurs, threats, or attacks on protected groups. It remains Duy's assistant, not Duy.
- Research current OpenRouter free models and compare them with real prompts before selecting the default. Never use the previously exposed API key; the user is rotating it.
- Change email delivery service while preserving the current recipient address. Use a server-side provider and keep a mail-client fallback.
- Move film pages from `/photography` to `/movie` and preserve old links with permanent redirects.
- Fix the owner statistics login using the intended passphrase from server configuration and a separate strong session-signing secret; do not bake a login secret into the public repository.
- Make visitor statistics durable across Vercel function instances and deployments so the owner dashboard can show visits, referrers, and countries after deploy.
- Improve the portfolio first viewport on desktop and mobile. Add restrained ambient motion that changes over time while respecting reduced-motion and keeping reading/layout stable.
- The implementation should be merged to the standalone `leduy-it/duyle-portfolio` repository and deployed through Vercel on the requested next-day schedule after the work is ready.

## Product design

### Site-wide Gracie and chat

Mount one compact Gracie launcher from the root layout on public routes, excluding `/admin`. Draw the bunny as an original light SVG/canvas asset with layered ear, blink, breathing, and gaze states. Keep motion subtle outside chat. Respect reduced-motion settings by using a still pose and disabling decorative loops. Avoid the lower-right Mystery Box and the existing lower-left hint; on narrow screens keep both the launcher and its popover inside the viewport.

One activation opens a quick chat. A second activation within 300 ms, plus an explicit button in the popover, opens the full terminal chat. Hover and keyboard-focus guidance explain the shortcut. Quick chat streams from the existing `/api/chat` endpoint, reflects idle/greeting/thinking/ready/error states, retains the visitor's draft on failure, and hands its recent transcript to the terminal through one-time `sessionStorage`. The terminal consumes that transfer, restores its window, and focuses its input.

The prompt gains fact-grounded portfolio knowledge from repository data and clear confidence boundaries. Keep the Vietnamese and English prefixes already used by the site. Use playful teasing for dating/fuckboy questions without inventing relationship facts; a mild comeback such as “tao hơi bực rồi đấy” is allowed when the visitor is plainly joking or insulting the bot. Deflect partisan/political questions briefly. Preserve the current stricter compose/refine prompts and their behavior.

Model candidates currently listed as free by OpenRouter include `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free`, `qwen/qwen3.8-27b:free`, and `nvidia/nemotron-3.5-lightning:free`. Compare at least Gemma and two alternatives on the same Vietnamese/English factuality, banter, profanity-boundary, and politics-deflection prompts. Select a stable primary and ordered fallbacks from observed responses and availability. Keep model IDs configurable and use the existing fallback-chain behavior; never use OpenRouter's random free router as the sole personality model.

### `/pets` hatchery and pixel world

Make `/pets` a standalone, full-page destination with a strong pixel-arcade art direction that still belongs to the portfolio: dark plum night, electric mint/coral highlights, warm habitat lights, crisp pixel borders, expressive sprite motion, and clear polished controls. It has four immediately available spaces: **Home**, **Shop**, **Factory**, and **Arena**.

- **Home:** a visible pixel-room grid with beds, plants, toys, and slots. Place or move owned pets with click/tap. Restore the last room and selection on return.
- **Shop / hatchery:** show the pet and egg collection from the first visit; clicking a ready egg begins a short crack-and-reveal sequence. Use a deterministic local seed for the starter egg, then normal earned-currency purchases. Do not gate the main page or mini-game behind grinding.
- **Factory:** housed pets produce species-themed materials. Yield is local, capped, and collectable with an obvious click target; no server or unattended unbounded currency accrual.
- **Evolution:** pets gain XP from play and care actions, show clear next-stage requirements, and transform with a short celebration. Keep the evolution rules deterministic and saved.
- **Arena mini-game:** a small real-time 2D pixel brawler. The selected pet moves with WASD/arrow keys and mobile buttons, attacks with Space/tap, and avoids or bonks moving glitch creatures. Enemies pursue the pet, hits, cooldowns, waves, health, win/loss, and rewards are real game states rather than a decorative loop. Combat is playful and non-graphic: stars, poofs, and confetti. The game can be opened immediately with a starter pet.

Use a small data-driven roster with distinct silhouettes, animation palettes, factory drops, stats, and evolution forms. Store versioned progress locally, validate parsed data, migrate older versions, and fail safely when storage is unavailable. Preserve progress through reloads/routes; seed only when no valid save exists. A visitor can inspect all game areas without first completing the intro. Keep controls accessible and provide visible health, score, resources, and keyboard instructions.

### Contact and movie route

Replace the browser-to-FormSubmit request with a server-side Resend-backed endpoint. Keep `levduyit@gmail.com` as recipient, read the API key and verified sender from server environment variables, validate and bound request fields, use provider idempotency, return explicit success/failure, and retain a prefilled `mailto:` fallback. Never expose the provider key to the browser. Production delivery is ready only after the owner configures the Vercel secret and verified sender.

Copy the current film list/detail views to `/movie` and `/movie/[slug]`, update navigation, internal links, page metadata, and any route keys, then permanently redirect `/photography` and `/photography/[slug]` to their `/movie` equivalents.

### Production owner analytics

The owner login uses `ADMIN_PASSPHRASE` for the typed passphrase and `ADMIN_SECRET` only to sign the HTTP-only session cookie. After the user's spelling correction, current source already accepts the intended passphrase: production failure is not yet attributed to a spelling mismatch. Inspect the deployed commit, login response, cookie behavior, and configuration before claiming the authentication cause. Accept the configured passphrase case-insensitively after trimming; never store it in source. Require a separate, random session secret in production and show a configuration error rather than silently accepting a public fallback.

The current tracker appends events to a JSONL file under the app's working directory. That local file is not durable/shared storage for Vercel's serverless deployment model, so the admin dashboard can report zero or lose data after requests land on different instances or after redeploy. Store bounded event records in Upstash Redis through its REST API, reading Vercel Marketplace `KV_REST_API_URL`/`KV_REST_API_TOKEN` or standard `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` variables. Keep the JSONL adapter for local development only. If production storage is not configured, fail visibly rather than report a false zero. Keep existing hashed visitor identity, page/referrer/country aggregation, bot filtering, admin gate, and tracking privacy boundaries.

The production setup uses the Upstash Redis Free plan when available and must stay within its documented quotas; do not upgrade to a paid plan. Configure the intended login passphrase and an independently generated session-signing key as sensitive production environment variables. Environment changes require a new deployment.

### Visual polish

Inspect the current first viewport at desktop and mobile widths before editing, then tune the hero hierarchy, spacing, CTA visibility, and ambient scene motion to the existing portfolio identity. The artwork should feel lively over time—small floating pixel details, light shifts, and occasional companion motion—without moving text targets or competing with reading. Keep motion low-cost, responsive, and disabled or reduced for `prefers-reduced-motion`. Capture matching before/after screenshots for desktop and mobile for review.

## Architecture and data boundaries

- Keep the global companion small and independent from the `/pets` page; it shares only the chat endpoint and the pet save's selected/evolved Gracie appearance.
- Keep pet/game rules in pure data/logic modules separate from React rendering and the animation loop. Render the arena client-side and stop its loop when it is not visible.
- Persist gameplay only in versioned local storage. Do not collect pet state server-side.
- Keep model selection and chat prompts on the server. Do not return secrets or internal provider diagnostics to the client.
- Keep contact delivery server-side and use the existing address as the sole recipient.
- Preserve old film URLs through permanent redirects.

## Acceptance criteria

1. Gracie appears site-wide on public routes with accessible quick chat, hover/focus guidance, double-activation handoff, streaming states, transcript transfer, and reduced-motion behavior.
2. The chatbot answers known portfolio facts accurately, is witty in both languages, refuses to invent personal relationship details, deflects political questions, and only mirrors mild swearing as playful banter.
3. A live, repeatable OpenRouter comparison uses the rotated key, records chosen model IDs and prompt outcomes without logging credentials, and justifies the primary/fallback chain.
4. `/pets` is an independent polished destination and begins with a ready, seeded world. Reloading or navigating back preserves pets, inventory, home layout, factory collections, and progression. No mandatory tutorial or automatic restart appears.
5. Egg hatching, placing pets, factory collection, evolution, and the active mobile/keyboard arena are usable and produce visible state changes.
6. Pet art is original; the supplied repository is linked as a source reference and is not misrepresented as containing assets it does not contain.
7. Email submissions go through the server-side provider to the unchanged recipient without duplicate delivery; users have a mailto fallback on service failure.
8. `/movie` and detail routes render the existing film content; old `/photography` paths permanently redirect correctly.
9. The intended passphrase works when stored as `ADMIN_PASSPHRASE`, the cookie is signed with a separate `ADMIN_SECRET`, and no built-in production password fallback remains.
10. Production visit records are durable across serverless invocations and deploys; the owner dashboard reports pageviews, unique visitors, sessions, referrers, and country where available.
11. The first view is reviewed at desktop/mobile sizes with before/after screenshots; ambient motion is reduced for users who request reduced motion.
12. The feature branch has a reviewable PR merged to the standalone repo and the Vercel production deployment is verified on 2026-09-29 after the work is ready.

## Operational boundaries

- A fresh OpenRouter key is required for real model tests; the exposed old key must be revoked and is never used.
- Resend production delivery needs a verified sender and server-side API key configured in Vercel. If those are absent, code and local behavior can be completed, but production sending/deployment readiness must be reported accurately.
- The requested deployment date is 2026-09-29 in Asia/Ho_Chi_Minh. Do not claim a scheduled or completed deployment without a Vercel deployment record.
