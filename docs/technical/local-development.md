# Local Development

This is the simplest guide for running and changing the project.

## Important Rule

Run install commands from the project root, not from `apps/game-web`.

Correct:

```bash
cd C:\Users\hil\Documents\ilyas\codex
corepack pnpm install
corepack pnpm dev
```

Incorrect:

```bash
cd apps/game-web
npm install
```

That fails because the app depends on local workspace packages.

## Main Commands

From the root:

```bash
corepack pnpm install
corepack pnpm dev
npm run typecheck
npm run test
npm run validate:content
npm run build
```

## What To Edit For Common Tasks

### Add a new test

- add a JSON file in `packages/content-packs/src/tests`
- register it in `packages/content-packs/src/index.ts`
- add labels in `packages/content-packs/src/copy/en/tests.json`
- add result text in `packages/content-packs/src/copy/en/results.json`
- update manifest if needed

### Change gameplay rules

- edit `packages/core`

### Change UI

- edit `apps/game-web/src/scenes`
- edit `apps/game-web/src/ui`
- edit `apps/game-web/src/styles/main.css`

### Change runtime boot behavior

- edit `apps/game-web/src/GameRuntime.ts`

## Local Testing Checklist

- home screen loads
- full-screen layout looks correct without browser zoom
- home screen buttons are visible in the browser viewport during normal desktop play
- short-height windows do not feel cramped or awkward
- test selection works
- locked tests unlock after enough sessions
- progress survives refresh
- reveal flow can be skipped and still lands on a valid result screen
- share card is generated
- no obvious console errors
