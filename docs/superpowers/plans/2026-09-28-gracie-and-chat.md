# Gracie Companion and Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add a site-wide animated Gracie quick-chat companion, a reliable handoff to terminal chat, and a funny fact-grounded bilingual assistant using a live-tested OpenRouter free-model chain.

**Architecture:** Keep the companion as one client component mounted in the public root layout. Keep prompt/knowledge and model configuration server-side, use the existing streaming endpoint, and transfer the short transcript through one-time `sessionStorage` plus a custom event.

**Tech Stack:** Next.js App Router, React, TypeScript, Motion, OpenRouter chat completions.

**Spec:** `docs/superpowers/specs/2026-09-28-gracie-companion-design.md`

## Global Constraints

- Keep the current portfolio recipient and all existing compose/refine behavior.
- Never use or print the previously exposed OpenRouter API key; the user must rotate it before live comparison.
- Keep API credentials and model selection on the server.
- Respect English/Vietnamese locale and reduced-motion preferences.
- Do not claim pet assets came from `leduy-it/portfolio-clone`; the checked tree has no pet artwork.

## Review Focus

- A quick-chat handoff must recover an empty, minimized, or maximized terminal window without duplicating a submitted message.
- Malformed model output, upstream failure, and storage denial must leave the visitor's draft available for retry.
- Banter must not invent private relationship facts or turn mild swearing into abuse.
- Existing compose/refine modes must retain their stricter editing instructions.
- Reduced-motion and narrow viewport layouts must remain usable.

## File Structure

- `src/components/pets/gracie-companion.tsx`: global launcher, popover, SSE client, states, handoff.
- `src/components/pets/gracie-sprite.tsx`: original accessible SVG bunny with named pose.
- `src/app/layout.tsx`: mount once on public routes.
- `src/components/home/terminal-chat.tsx`: consume and clear the one-time handoff, focus input.
- `src/lib/chat/prompts.ts`: separated chat, compose, and refine prompts.
- `src/lib/chat/knowledge.ts`: concise factual portfolio context sourced from current portfolio content.
- `src/lib/chat/models.ts`: ordered candidate/default/fallback model IDs.
- `src/app/api/chat/route.ts`: use shared prompt/model modules and keep safe upstream fallback behavior.
- `scripts/evaluate-chat-models.ts`: run the same fixed evaluation prompts against candidate models without printing credentials.
- `src/data/i18n-strings.ts`: localized chat labels, hints, and fallback copy.

## Tasks

### 1. Extract prompts and add fact-grounded playful assistant rules

- [ ] Move the existing `CHAT_PROMPT`, `COMPOSE_PROMPT`, and `REFINE_PROMPT` from `src/app/api/chat/route.ts` to `src/lib/chat/prompts.ts` without changing compose/refine semantics.
- [ ] Add concise bilingual voice rules for dating/fuckboy teasing, mild reciprocal banter, political deflection, private-fact uncertainty, and third-person identity; retain the locale-specific assistant prefix.
- [ ] Create `src/lib/chat/knowledge.ts` from verified role, project, achievement, stack, movie, and public contact facts in the repository. Mark personal/undisclosed questions as unknown.
- [ ] Update `src/app/api/chat/route.ts` to compose the chat system message from persona and knowledge and import edit prompts unchanged.
- [ ] Verify `git diff --check` and inspect the three prompt modes for accidental behavior changes.

### 2. Probe real OpenRouter models and select a chain

- [ ] Add `src/lib/chat/models.ts` with the current catalog candidates: Gemma 4 31B, Gemma 4 26B A4B, Qwen3.8 27B, and Nemotron 3.5 Lightning, all using their current `:free` IDs.
- [ ] Add `scripts/evaluate-chat-models.ts`. It must require `OPENROUTER_API_KEY` from the process environment, send the same fixed factual, Vietnamese banter, relationship-uncertainty, profanity-boundary, and politics prompts to each candidate, and print only model ID, status, latency, and answer text.
- [ ] Run the probe only after the user confirms the old key is revoked and a replacement is configured. Record scores for factual correctness, humor fit, Vietnamese naturalness, boundary behavior, and availability in the plan notes without saving the key or request headers.
- [ ] Set `OPENROUTER_MODEL` default and ordered `MODEL_CHAIN` fallbacks to the best live-tested candidates; retain environment override support.

### 3. Build the global companion and terminal handoff

- [ ] Implement `GracieSprite({ pose, reducedMotion })` in `src/components/pets/gracie-sprite.tsx` with original SVG shapes, clean accessible labeling, still reduced-motion pose, blink, ear, and body animations.
- [ ] Implement `GracieCompanion` in `src/components/pets/gracie-companion.tsx` with single activation, 300 ms double activation, hover/focus guidance, explicit full-chat control, responsive placement, dismiss behavior, SSE streaming, retry-preserved drafts, and idle/greeting/thinking/ready/error poses.
- [ ] Transfer the last 14 chat turns once through `sessionStorage` and signal `TerminalChat`; consume/clear the transfer, restore its window, append turns once, and focus the terminal input.
- [ ] Mount one launcher in `src/app/layout.tsx` on public routes, excluding `/admin` through route checking; keep z-index and offsets clear of the Mystery Box and SecretHint.
- [ ] Add English and Vietnamese visible strings in `src/data/i18n-strings.ts`; use real buttons, labels, focus rings, and `aria-live` response status.

### 4. Verify assistant and interaction behavior

- [ ] Run the real OpenRouter comparison with the rotated key and retain the chosen model results as a concise text artifact with secrets omitted.
- [ ] Manually exercise quick-chat stream, network failure/retry, double activation, explicit terminal handoff, keyboard navigation, mobile viewport, and reduced motion in the local browser.
- [ ] Run `npm run lint` and `npm run build`; resolve all new errors before proceeding to the pet-world plan.
- [ ] Commit this slice with `feat: add Gracie companion and playful chat`.
