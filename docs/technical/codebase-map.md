# Codebase Map

This document explains where things live and why.

## Root

### `package.json`

Root scripts for local development:

- `dev`: runs the web app
- `build`: builds all workspaces
- `typecheck`: typechecks all workspaces
- `test`: runs workspace tests
- `validate:content`: validates content packs
- `build:content`: writes content snapshots to `services/content/published`

### `pnpm-workspace.yaml`

Defines the monorepo workspace layout.

## Apps

### `apps/game-web`

This is the real playable game.

Important files:

- `src/main.ts`: starts the app
- `src/boot/createGame.ts`: configures Phaser
- `src/GameRuntime.ts`: central runtime state and orchestration
- `src/scenes/*`: visual flow of the game
- `src/ui/*`: DOM-based overlays and small UI helpers
- `src/styles/main.css`: browser layout and overlay styling

### `apps/android-shell`

This is the Capacitor shell for Android packaging later.

Right now it is mostly scaffolding. The real gameplay still lives in `apps/game-web`.

## Packages

### `packages/core`

This is the most important shared package.

It contains:

- game flow rules
- session state
- progression and unlock logic
- content selection helpers
- score/result generation
- share payload generation
- formulas for tests

If the game rules change, this is usually where the change should happen first.

### `packages/content-packs`

This holds game content as data:

- manifest
- individual test JSON files
- artifact recipe registry
- English copy

This is where you add new tests, update text, or change content pacing.

### `packages/platform-sdk`

This is the abstraction layer for platform-specific features:

- share
- storage
- analytics
- ads
- remote config

At the moment the browser adapter is the one actually in use.

### `packages/backend-contracts`

This contains shared payload shapes and validation helpers for things like remote config.

## Services

### `services/config/remote-config`

Contains local JSON config snapshots used as fallback/dev config.

### `services/content/published`

Generated content bundle output.

## Tools

### `tools/scripts/validate-content.ts`

Checks that content definitions are internally valid.

### `tools/scripts/build-content.ts`

Builds JSON bundles from the content package into `services/content/published`.

## Docs

This folder should be treated as part of the product, not as an afterthought.

Whenever architecture or gameplay direction changes, update docs in the same pass if possible.

Important strategy docs now include:

- `docs/technical/current-status.md`
- `docs/technical/platform-strategy.md`
- `docs/technical/viral-growth-plan.md`
