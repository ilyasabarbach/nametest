# Architecture

This project uses a monorepo so gameplay, content, and platform code stay separated.

## Main Idea

- `apps/game-web` renders the game
- `packages/core` owns game rules
- `packages/content-packs` owns game content
- `packages/platform-sdk` owns platform-specific adapters
- `packages/backend-contracts` owns remote-config and payload contracts

## Why This Split Matters

It makes future changes safer.

Examples:

- Add a new test without changing scene logic
- Change progression rules without touching UI rendering
- Replace browser sharing with native sharing later
- Package for Android later without rewriting gameplay

## Runtime Relationship

`GameRuntime.ts` is the bridge between the app and the shared packages.

It combines:

- content
- config
- storage
- progression
- gameplay state
- scene-facing helper methods

## Scene Relationship

Scenes are thin compared with the core package.

They should mostly:

- display things
- gather input
- trigger transitions
- ask the runtime to do real work

If business logic grows inside scenes, that is usually a sign it should move into `packages/core`.
