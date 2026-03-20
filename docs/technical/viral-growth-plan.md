# Viral Growth Plan

This document is the durable reference for:

- how to modernize the test catalog beyond the old NameTests pattern
- what "viral" should mean for this product in 2026
- how AI should fit the product without breaking cost, speed, or robustness
- what technical foundation should be implemented so later scaling is easier

Use this alongside:

- `docs/technical/current-status.md`
- `docs/technical/how-to-continue.md`
- `docs/technical/platform-strategy.md`

## Core Strategic Read

The 2018-2021 viral loop was not really about quiz complexity.

It was mostly:

- ego hook
- specificity
- instant personalized artifact
- social sharing loop

What worked in the "golden era":

- flattering identity outputs
- visuals that looked personally made
- simple low-friction input
- a result image people wanted to post

What changes in 2026:

- static text-on-image is no longer enough on its own
- "AI" should not replace the core hook
- AI should make the artifact feel more alive and personal

The product should not become "an AI chatbot quiz".

The product should become:

- a fast identity test
- that outputs a personalized artifact
- that can optionally be remixed into a stronger AI version

## The 2026 Secret Sauce

The recommended formula is:

`identity result + visual artifact + remix loop`

That means:

- the hook promises identity, status, chemistry, future, or mystery
- the result is flattering but specific
- the output is a poster / portrait / headline / story cover / badge
- the player can retry, compare, remix, and share

AI helps most when it upgrades the artifact, not when it replaces the test logic.

## What To Build, Not Build

Build:

- identity aura tests
- future headline tests
- hidden gift / secret power tests
- past-life / storybook tests
- social role / status tests
- relationship poster tests
- tap-photo reveal tests

Avoid:

- generic long personality quizzes
- celebrity-trend dependency as the core catalog
- expensive AI generation on every single run
- weak static "you are nice" cards with no visual payoff

Trend-driven hooks should be wrappers for the feed, not the foundation of the catalog.

## Catalog Shape To Aim For

Priority categories:

1. Aura / identity
2. Future headline
3. Hidden gift / secret power
4. Social role / status fantasy
5. Relationship artifact
6. Photo-tap reveal

The immediate target should be a batch of roughly 8-12 strong tests with high contrast in hook and artifact type.

Recommended split:

- 3 aura / identity tests
- 2 future headline tests
- 2 hidden gift / past-life tests
- 2 group-role / social status tests
- 2 relationship poster tests
- 1 photo-tap archetype reveal

## Recommended Viral Formula Per Test

Each strong test should define:

- hook
- input mode
- result promise
- artifact type
- remix loop

Example structure:

- Hook: curiosity or status
- Input: one name, two names, photo tap, or optional selfie
- Result: flattering and specific
- Artifact: poster, portrait, cover, badge, or headline card
- Loop: retry, remix, compare, share

## AI Recommendation

Do not make AI mandatory for the main flow.

Instead:

1. Every test must work without AI
2. AI upgrades the result artifact when available
3. AI failure must never block result delivery

Recommended player-facing pattern:

- player completes a normal test
- player receives the normal result poster immediately
- player may optionally choose:
  - Make AI Portrait
  - Make Storybook Cover
  - Make Retro Magazine Version

That keeps the base loop fast and robust while still creating a 2026-style novelty layer.

## Free-First AI Stack Recommendation

Best fit right now:

- Cloudflare Workers AI for generation
- Cloudflare R2 for artifact storage
- KV for caching and rate limits
- D1 later for light metadata / editorial control
- Queues later if generation volume grows

Why this is preferred:

- TypeScript-friendly
- edge-native
- good fit with the project's existing web/API direction
- can evolve from MVP to larger scale later

Browser-side inference is useful for:

- optional prompt enrichment
- local tagging / aura hints
- privacy-friendly client-side helpers

Browser-side inference is not yet the right core dependency for image generation across all target phones.

## Product Loop Recommendation

The modern replacement for the old bot loop should be:

- shareable artifact
- deep-link into the exact test
- quick "make yours" loop
- optional "remix this in another style" loop

That creates a stronger re-entry path than plain result sharing.

## Technical Foundation

The content system should stay JSON-driven.

The schema should grow to support the viral/AI plan cleanly.

Tests should carry structured metadata such as:

- `inputMode`
- `artifactRecipeId`
- `styleFamily`
- `viralHook`
- `seasonalTags`
- `remixModes`
- `safetyProfile`

This foundation is already the correct direction because the game is data-driven and content-centric.

## Artifact Recipe Layer

Do not store giant raw prompts directly inside each test definition.

Instead:

- tests reference an `artifactRecipeId`
- artifact recipes live in a shared registry
- later prompt-building logic composes safe prompts from structured inputs

This will scale better for:

- moderation
- style consistency
- localization
- testing
- swapping AI providers later

## Robustness Rules

These rules should hold for every AI-related feature:

- normal results must render instantly without waiting for AI
- AI remix must be optional
- AI outputs must be cached
- AI must have a deterministic visual fallback
- prompt composition should be structured server-side
- free-form user prompt input should be avoided

Cache keys should eventually include:

- test id
- result band
- style recipe
- normalized inputs
- photo hash if photo exists

## Current Implementation Plan

This is the execution order we should follow.

### Phase 1: Foundation

- add the viral/AI-ready schema fields to test definitions
- create an artifact recipe registry
- annotate the current catalog with first-pass metadata
- keep validation aware of the new references

### Phase 2: Catalog Expansion

- add the next batch of tests in the priority categories
- make sure every new test has a strong hook and distinct artifact type
- improve copy contrast and reduce repetitive "same mood, different wording" results

Status:

- first larger post-foundation batch is now live: `aura-palette`, `group-chat-role`, `soul-story`, `photo-archetype`, and `movie-poster`
- locale parity for that batch currently exists through the supported copy files, though translation polish still needs native-speaker review

### Phase 3: Artifact System

- add a result-artifact layer that can distinguish poster / portrait / headline / storybook output families
- keep the current poster system as the fallback baseline
- add explicit remix CTAs where they make sense

Status:

- result/share presentation has already started resolving from `artifactRecipeId`
- the remaining product work in this phase is visible remix UI, not the basic template-selection foundation

### Phase 4: AI MVP

- create a minimal generation endpoint
- support optional AI artifact remix for a very small number of tests first
- cache outputs aggressively
- degrade back to template posters when unavailable

### Phase 5: Growth Loop

- wire deep links into exact tests or result remixes
- harden share-return behavior
- tune which artifact types actually get replayed and shared

## What Has Already Started

The repo has already moved in the right direction:

- the feed is editorial and browse-first
- the result page is closer to a poster-plus-feed page than a terminal game result
- the first single-name tests exist
- the first tap-photo tests exist
- content is already data-driven
- a second stronger editorial test batch now exists on top of that foundation
- recipe-driven artifact selection is now live enough that new tests can target portrait / headline / storybook / poster families without scene-specific branching

That means this plan is not a restart.

It is the next layer on top of the current architecture.

## Current Recommendation For Future Sessions

When a future session asks "what should we build next for virality?", use this order:

1. tune the richer catalog on-device and note which hooks / artifact families actually feel strongest
2. add visible remix UI on top of the existing recipe layer
3. add optional AI remix for a tiny, controlled subset
4. tune the share/remix loop on-device
5. expand the catalog again based on what replays and shares best

## Important Product Rule

The project should stay original.

It can be inspired by NameTests-style mechanics and product logic, but it should not become a literal clone in:

- branding
- exact copy
- trade dress
- asset choices
- page composition

The goal is:

- original product
- same genre strength
- stronger 2026-native artifact and remix loop
