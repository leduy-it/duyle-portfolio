# Owner Access and Durable Analytics Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` and update `INDEX.md` tasks T14–T15.

**Goal:** Restore deployed owner login and preserve visit, referrer, and country statistics across Vercel instances and redeploys.

**Spec:** `../specs/2026-09-28-gracie-companion-design.md`

## Task 1: Determine and fix authentication failure

- [ ] Inspect the real deployed commit and login response; check environment variable presence without printing values.
- [ ] Keep `ADMIN_PASSPHRASE` for login and `ADMIN_SECRET` for signing sessions. Remove public production bypass/default credentials; show a safe configuration error if either is missing.
- [ ] Preserve trimmed, case-insensitive passphrase matching and use constant-time comparison. Reject malformed credentials/cookies and expired sessions.
- [ ] Add meaningful auth regression checks for configured acceptance, incorrect input, absent configuration, forged cookie, and expiry. Verify the actual deployed login after configuration and redeployment.

## Task 2: Persist analytics outside function storage

- [ ] Add a Redis REST adapter accepting standard Upstash and Vercel Marketplace variable names. Store a capped chronological event list; use local JSONL only outside Vercel.
- [ ] Keep the identity salt stable across instances. Report unavailable production storage explicitly, including a useful owner dashboard state, instead of displaying a false zero.
- [ ] Preserve visitor/referrer/country aggregates, bot filtering, and owner-session protection. Bound/sanitize incoming paths and referrers; do not retain secret query parameters.
- [ ] Verify adapter ordering, retention cap, malformed storage data, missing configuration, and persistent reads through separate adapter instances.
- [ ] Connect a Free-plan Redis resource if the Vercel account permits it; never accept a paid upgrade. Validate live statistics only when durable storage is configured.

## Review focus

Configuration ambiguity, forged sessions, Redis failures hidden as zero traffic, unstable salts, referrer URLs containing credentials, and owner dashboard access after a fresh deployment.
