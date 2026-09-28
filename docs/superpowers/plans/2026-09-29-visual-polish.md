# First View and Responsive Polish Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` and update `INDEX.md` tasks T05, T16–T17.

**Goal:** Improve the portfolio's first impression and sustained ambient motion while preserving comfortable desktop/mobile reading and interaction.

**Spec:** `../specs/2026-09-28-gracie-companion-design.md`

## Task 1: Establish visual baseline

- [ ] Run the unmodified portfolio locally and inspect first viewport on desktop and mobile with screenshots.
- [ ] Record the specific hierarchy, spacing, overflow, contrast, and overlay collisions that need changes.

## Task 2: Implement targeted visual changes

- [ ] Tune `src/components/home/hero-section.tsx` and adjacent styles based on the baseline; preserve factual content.
- [ ] Add restrained ambient motion with long varied cycles, paused hidden-page work, and reduced-motion fallbacks. Keep text/controls stationary.
- [ ] Align the new Gracie launcher and `/pets` entrance with the hero/header without covering the terminal or navigation.

## Task 3: Compare and finish

- [ ] Capture matching desktop/mobile screenshots after changes and inspect `/`, `/pets`, `/movie`, chat, and navigation.
- [ ] Fix measured overflows, clipped focus states, touch targets, overlapping fixed widgets, and expensive/unbounded animation loops.
- [ ] Record the final screenshots/observations and run the production build after final edits.

## Review focus

Small phones, zoom, reduced motion, live chat streaming while page animations run, expanded mobile navigation, arena touch controls, and pages with the mascot popover open.
