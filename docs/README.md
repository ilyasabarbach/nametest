# Project Docs

This folder is the "memory" of the project.

If you open this codebase in a new session and want to get productive quickly, start here.

## Reading Order

1. `technical/current-status.md`
2. `technical/codebase-map.md`
3. `technical/platform-strategy.md`
4. `technical/game-flow.md`
5. `product/vision.md`
6. `technical/release-checklist.md`

## What This Project Is

This project is a web-first social "name test" game inspired by old viral Facebook games, but built as an original product.

Current goals:

- Make the game fun and fully testable locally
- Keep the codebase organized for Android packaging later
- Keep the architecture flexible enough for future Facebook Instant support

## Current State In One Paragraph

There is already a playable local version of the game. The player can choose from unlocked tests, enter names, run a short reveal flow, see a flavored result card, replay, unlock additional tests over time, collect result types, receive daily rewards, and generate a branded share card. The project is not yet fully production-ready for Google Play because real monetization, real analytics, native Android release hardening, and platform publishing work are still deferred.

For the durable "what still remains?" answer, read `technical/platform-strategy.md`.

## Main Folders

- `apps/game-web`: the playable Phaser game
- `apps/android-shell`: the Capacitor wrapper for future Android packaging
- `packages/core`: shared game logic and data rules
- `packages/content-packs`: tests, copy, and manifest data
- `packages/platform-sdk`: browser and future platform adapters
- `packages/backend-contracts`: remote-config and contract types
- `services`: local config/content snapshots
- `tools`: validation and content scripts

## Local Run

From the project root:

```bash
corepack pnpm install
corepack pnpm dev
```

If `pnpm` is not available directly, use `corepack pnpm ...`.

Do not run `npm install` inside `apps/game-web`, because that package depends on workspace packages.
