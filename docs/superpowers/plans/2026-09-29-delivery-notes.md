# Portfolio implementation and deployment notes

## What is implemented

- Gracie: original SVG companion throughout public pages, animated idle/greeting/thinking/ready/error poses, pointer gaze, reduced-motion support, persistent visibility switch, quick chat and one-time terminal handoff.
- `/pets`: six original pixel species, three egg tiers, furnished starter habitat, ready egg, placement, offline factory (8-hour cap), click acceleration, three evolution forms, keyboard/touch arena with three waves, local browser save.
- Chat: shared knowledge and EN/VI persona, Gemma/Qwen/Nemotron free-model candidate chain, safe SSE parsing, timeouts, provider fallbacks and rate limiting. The comparison script uses the production prompt and requires explicit confirmation of a rotated key.
- `/movie`: canonical list/detail routes; permanent redirects from `/photography` and its film slugs.
- Email: Resend through `/api/contact`, fixed recipient, validation, server credentials, rate limiting, idempotency and explicit mailto fallback. Success means accepted by provider, not confirmed inbox delivery.
- Owner analytics: environment-only login, independent signing secret, expiring/tamper-checked cookies, Redis-backed tracking and shared limits, explicit storage error state. Retention is 90 days / 10,000 events. Referrers retain origin only; query strings and raw IPs are not stored.
- Light mode: runtime Tailwind tokens, stronger accent/muted colors, readable terminal/blog/cinema headings and prose, themed Gracie panel. Home has clearer identity and compact status details.
- Fixed a pre-existing canvas color parser exception (modern RGB spaces) and 15px horizontal overflow. Canvas stops decorative work for reduced motion and hidden pages.

## Deployment configuration

1. Log in to Vercel and identify the existing project. The old repository homepage points at `https://portfolioclone-kappa.vercel.app`; its visible deployed app is older than the source being upgraded. Do not infer its deployed commit from that URL.
2. Connect the independent `leduy-it/duyle-portfolio` repository, production branch `main`.
3. Set the server variables in `.env.example` in the intended Vercel environments. Use the owner's intended passphrase privately; `ADMIN_SECRET` is a separate random value, not the passphrase. There is no fallback login in production.
4. Add an Upstash Redis integration. Both `UPSTASH_REDIS_REST_*` and Vercel Marketplace `KV_REST_API_*` names work. Production endpoints fail explicitly if the durable limit/storage backend is absent.
5. Configure a verified Resend sender and key. The recipient remains unchanged. Do not test delivery to another person without authorization.
6. Revoke the previously exposed OpenRouter key; confirm a replacement before running the probe. The script deliberately does not load the old environment file.
7. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. Run the real model probe with `CONFIRM_ROTATED_OPENROUTER_KEY=1` in a shell where the new key is already configured. Never echo the key or include it in a command argument.
8. Deploy. Changes to Vercel environment variables apply to a new deployment, so recheck login, Redis events/countries/referrers, chat and approved contact delivery on the new deployment.

## Source and provider references

- [Original portfolio reference](https://github.com/leduy-it/portfolio-clone): checked tree contains no pet assets; new pet art is original.
- [OpenRouter models catalog](https://openrouter.ai/api/v1/models) and [model fallback documentation](https://openrouter.ai/docs/guides/routing/model-fallbacks).
- [Resend Next.js](https://resend.com/nextjs) and [idempotency keys](https://resend.com/changelog/idempotency-keys).
- [Vercel Redis](https://vercel.com/docs/redis), [Upstash REST](https://upstash.com/docs/redis/features/restapi), [Vercel environment variables](https://vercel.com/docs/environment-variables).
- [Next.js AVIF security advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4): dependency patching stays on Next 15; a PostCSS override avoids upgrading the application to a new Next major solely for a transitive patch.

## Still requires external evidence

- Real free-model response comparison with a confirmed replacement OpenRouter key.
- Valid Vercel session and the correct project link; provider secrets configured.
- Production login/session, durable statistics across a redeploy, and approved email delivery.

## Local acceptance evidence

- 25 regression tests pass: pet progression/persistence, combat, SSE transport, contact receipts/idempotency, proxy origin handling, authentication and durable tracking behavior.
- Lint, TypeScript, production build and dependency audit checked; 36 generated routes, no reported vulnerabilities.
- Desktop/mobile screenshots inspected in the browser at 320, 390, 844 and 1440 widths, including both themes and landscape. No screenshot files were exported because the browser tool rejected the requested output paths.
- Pet and movie light-mode Lighthouse snapshots: accessibility 100; best practices 100; SEO 100; agentic browsing 100. This is a local snapshot audit, not a performance score or production proof.
- Independently reviewed; fixed all four Important findings and both Minor findings. Temporary storage failure now keeps play in memory until reload or a valid external save; unread/invalid disk saves are never blindly overwritten. Both streaming layers require an explicit completion frame.
- The original provided GitHub reference contains no pet assets. Gracie and the pixel species/habitat artwork here are original.
