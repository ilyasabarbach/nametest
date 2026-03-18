# Nametests

Android-first social name game scaffold built with Phaser, TypeScript, and Capacitor.

## Workspace

- `apps/game-web`: Phaser game client
- `apps/android-shell`: Capacitor Android wrapper
- `packages/core`: platform-agnostic game logic
- `packages/platform-sdk`: platform abstractions and adapters
- `packages/content-packs`: JSON content packs and localization
- `packages/backend-contracts`: runtime contracts and schemas

## Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm validate:content
```
