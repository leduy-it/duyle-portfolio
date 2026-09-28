# Movie Route and Contact Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Give the existing film collection canonical `/movie` URLs and deliver contact messages through a server-side provider without changing Duy's recipient address.

**Architecture:** Reuse the current film components and data under the new route, permanently redirect legacy paths, and replace the browser FormSubmit call with a bounded Next.js API route that calls Resend using server-only configuration.

**Tech Stack:** Next.js App Router, TypeScript, Next redirects, Resend REST API, existing mailto fallback.

**Spec:** `docs/superpowers/specs/2026-09-28-gracie-companion-design.md`

## Global Constraints

- Keep `levduyit@gmail.com` as the recipient.
- Keep `mailto:` available when server delivery cannot be used.
- Do not expose Resend credentials in client code or logs.
- Preserve all existing film slugs/content and support old links with permanent redirects.
- Never claim production email is ready without the verified sender and Vercel secret.

## Review Focus

- Empty, oversize, malformed, or hostile contact payloads must be rejected before provider delivery.
- Duplicate submissions must not send twice; provider idempotency key must be stable for one submission and bounded in length.
- Missing API key or sender configuration must return a safe actionable failure and preserve client draft content.
- Old detail slugs, trailing slashes, and unknown film slugs must retain sensible behavior after migration.
- Sender identity must be a verified server-configured address and must not be user-controlled.

## File Structure

- `src/app/movie/page.tsx` and `src/app/movie/[slug]/page.tsx`: canonical film pages.
- `src/components/photography/`: keep reusable current display components; update internal links to `/movie`.
- `src/components/header.tsx`: update Cinema navigation destination.
- `next.config.ts`: permanent legacy route redirects.
- `src/app/api/contact/route.ts`: server-side validation and Resend request.
- `src/components/home/terminal-chat.tsx`: call `/api/contact`, show progress/result, and retain mailto fallback.
- `.env.example` or provider setup documentation: document server-only sender/key values without secrets.

## Tasks

### Task 1: Move the film collection to `/movie`

- [ ] Copy `src/app/photography/page.tsx` and `src/app/photography/[slug]/page.tsx` to the matching `src/app/movie` routes, preserving current rendering and metadata while setting canonical URLs.
- [ ] Update `src/components/header.tsx`, `src/components/photography/photo-card.tsx`, `src/components/photography/film-detail-view.tsx`, and any route metadata references to generate `/movie` links.
- [ ] Add permanent redirects in `next.config.ts` for `/photography` → `/movie` and `/photography/:slug` → `/movie/:slug`.
- [ ] Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`; verify the film index/detail routes and legacy redirects locally.
- [ ] Commit this route slice with `fix: move cinema pages to movie routes`.

### Task 2: Replace FormSubmit with server-side Resend delivery

- [ ] Add `POST /api/contact` in `src/app/api/contact/route.ts`; validate name, email, subject, and body types/lengths, reject empty payloads, use the fixed recipient `levduyit@gmail.com`, and read `RESEND_API_KEY` plus `RESEND_FROM_EMAIL` only from server environment variables.
- [ ] Submit through Resend REST API with a stable provider idempotency key per form attempt; translate provider outcomes to safe `{ ok, error }` JSON without returning provider internals.
- [ ] Update `src/components/home/terminal-chat.tsx` to post to `/api/contact`, disable repeat-click while pending, show localized status, preserve entered values on failure, and build a `mailto:` fallback from the same fields.
- [ ] Add only variable names and configuration guidance to `.env.example`/docs; never add a live key or change the recipient.
- [ ] Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`; manually exercise invalid input, missing configuration, successful provider response with a safe test setup, duplicate click, and mailto fallback.
- [ ] Commit this contact slice with `feat: send portfolio contact mail through Resend`.

### Task 3: Prepare production handoff

- [ ] Confirm the Vercel project is linked to `leduy-it/duyle-portfolio` and determine whether pushing/merging to `main` auto-deploys.
- [ ] Before the requested 2026-09-29 deployment, verify production `RESEND_API_KEY`, verified `RESEND_FROM_EMAIL`, and rotated `OPENROUTER_API_KEY` exist without printing values.
- [ ] Merge the reviewed feature PR to standalone `main` at the requested time, then verify the Vercel deployment URL, commit SHA, and deployment state before reporting success.
