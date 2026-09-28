# Gracie Companion Design

**Status:** awaiting review

## Goal

Make the portfolio feel more alive and give visitors a quick way to ask about Duy, while preserving the existing terminal chat as the full conversation. The bunny companion is the first deliverable; the pet shop, games, and evolution system come later.

## Confirmed intent and constraints

- The new destination is the standalone public repository `leduy-it/duyle-portfolio`; its `main` contains the latest local portfolio commit and has no fork parent.
- The companion should be visible throughout the public portfolio, open a small chat on first activation, show activity through animation, and send a double-click into the full terminal chat. Hover guidance should teach the interaction.
- The full pet-shop page, its minigames, and pet evolution are a later phase after the companion is complete.
- Email delivery is a separate follow-up: change the delivery service while retaining the current recipient address.
- The film section should move from `/photography` to `/movie`, while old URLs continue to work.
- The checked clone of the linked repository has only a `main` branch and no matching pet/shop files, submodules, or Git LFS assets. Unless a different source is supplied, the companion will use an original vector bunny named Gracie.

## Existing application context

- Next.js App Router with a shared root layout and `LocaleProvider`.
- `motion/react` and `useHomeMotionPreferences` are already used for animation and reduced-motion behavior.
- `src/app/api/chat/route.ts` already streams the portfolio assistant response through OpenRouter.
- `TerminalChat` owns the full home-page conversation. It currently persists its window position/state and listens for the `leduy:chat-send` custom event.
- `MysteryBox` occupies the lower-right overlay when open; `SecretHint` is fixed at the lower-left. The companion must respect those layers and leave the chat usable on small screens.
- The films currently live under `src/app/photography`, although navigation, metadata, and content already call the section Cinema.

## Recommended approach

Build a small, site-wide client component using the existing React and Motion stack. Draw Gracie as an original SVG with independently animated ears, eyes, and body; this avoids a new graphics dependency and keeps the initial asset light. Do not copy OpenAI pet artwork. Use the activity-state idea and reduced-motion behavior described in [OpenAI's Pets documentation](https://learn.chatgpt.com/docs/pets) as interaction references.

### Placement and interaction

- Mount one companion launcher from the shared root layout on public pages; do not show it on `/admin`.
- One click or tap opens a compact quick-chat popover. A second click or tap within 300 ms opens the full terminal chat.
- Show a hover/focus hint for desktop and an explicit **Open full chat** control inside the popover for keyboard and touch users.
- Keep the mascot visible while the popover is open, but make the popover independently dismissible.
- Coordinate its position and z-index with the existing fixed widgets and the Mystery Box overlay.
- Localize labels and guidance through the existing English/Vietnamese locale provider.

### Chat and animation states

The quick chat uses the existing `/api/chat` endpoint and the same portfolio-agent behavior; it does not add a second model or prompt service. Keep the short conversation in component state while the visitor remains in the app, and honor the endpoint's existing limits of 14 recent messages and 2,000 characters per message.

Gracie has five UI states:

| State | Trigger | Motion / feedback |
| --- | --- | --- |
| Idle | No open chat or request | Quiet breathing, occasional ear movement, restrained pointer gaze |
| Greeting | Popover opens | Turns toward the visitor and shows a short prompt |
| Thinking | Request is streaming | Visible waiting loop, with the popover showing response progress |
| Ready | Response completes | Brief positive reaction and the reply appears |
| Error | Request fails | Calm error cue and a retry action |

When the visitor opens the full terminal chat, temporarily pass the quick-chat transcript through `sessionStorage` and a route signal. `TerminalChat` consumes the transfer on mount, restores its visible window even if its saved state is minimized or closed, and focuses its input. Remove the transfer value after consumption; do not persist pet-chat history across browser sessions.

### Accessibility and motion

- Use real buttons with accessible names and visible focus states.
- The double-click shortcut is never the only way to reach terminal chat; the popover control provides the same action.
- Respect reduced-motion preferences with a still pose and no looping animations.
- Keep the popover within the viewport and usable at mobile widths.

## Acceptance criteria

1. Gracie appears on public routes and does not cover the header, primary content, or existing fixed controls.
2. One activation opens quick chat; two activations within 300 ms open full chat; hover/focus guidance and the explicit full-chat control explain and support the shortcut.
3. Quick chat streams replies through the existing API and Gracie tracks idle, greeting, waiting, completed, and error states.
4. Opening full chat from another route returns to `/`, transfers the current quick-chat transcript, restores the terminal if it was closed/minimized, and focuses its input.
5. Reduced-motion mode renders a still mascot and disables looping movement.
6. Errors leave the visitor's text intact and expose a clear retry path.

## Deferred slices

These are intentionally not part of this first companion implementation:

1. **Email delivery:** replace the browser-to-FormSubmit request with a server-side provider while keeping the current recipient. Resend is the recommended provider; production sending will require a server-side API key and a verified sender address/domain configured outside the repository. Preserve a mailto fallback and prevent accidental duplicate sends.
2. **Movie route:** add `/movie` and `/movie/[slug]`, update navigation and internal links, and permanently redirect `/photography` and `/photography/[slug]` to their equivalents so old links remain valid.
3. **Pet shop:** after the companion is complete, design a separate page for multiple pets, interactive minigames, and an evolution system. Its URL, game rules, progression, and persistent state are intentionally undecided here.

## Risks and boundaries

- The linked repository did not contain the claimed Gracies artwork or pet-shop resources. A supplied asset or source URL should replace the original-vector assumption before implementation if one exists.
- Production chat requires the existing `OPENROUTER_API_KEY`; this feature does not change or expose that service.
- This document designs only the companion slice. Email provider wiring, the `/movie` migration, and the pet shop each need their own focused implementation plan.
