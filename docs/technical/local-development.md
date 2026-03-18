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
npm run dev:feed-api
npm run typecheck
npm run test
npm run validate:content
npm run build
```

If you want the web app to consume the local discovery-feed API instead of the in-app fallback, run the feed API and set:

```bash
VITE_DISCOVERY_FEED_URL=http://localhost:8787/api/discovery-feed
```

## Android Device Run

Once the web build changes and you want to test on a real Android phone:

```bash
cd C:\Users\hil\Documents\ilyas\codex
npm run build --workspace @nametests/game-web

cd C:\Users\hil\Documents\ilyas\codex\apps\android-shell
corepack pnpm exec cap sync android
```

Then open:

- `C:\Users\hil\Documents\ilyas\codex\apps\android-shell\android`

in Android Studio and run the `app` configuration on the connected device.

## Discovery Feed API

The project now includes a small local API workspace for paginated discovery-feed responses:

```bash
cd C:\Users\hil\Documents\ilyas\codex
npm run dev:feed-api
```

Useful endpoints:

- `http://localhost:8787/health`
- `http://localhost:8787/api/discovery-feed?locale=en`
- `http://localhost:8787/api/discovery-feed?locale=fr&cursor=8`

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

### Change discovery feed behavior

- edit `apps/discovery-feed-api/src/index.ts` for local API behavior
- edit `packages/backend-contracts/src/discoveryFeed.schema.ts` for feed payload shape
- edit `packages/content-packs/src/discovery/*` for feed content and fallback generation
- edit `apps/game-web/src/GameRuntime.ts` for feed fetching / pagination behavior

### Change localization

- edit `packages/content-packs/src/copy/*`
- keep supported locales aligned across feed UI, game copy, and share-card text

### Change runtime boot behavior

- edit `apps/game-web/src/GameRuntime.ts`

## Local Testing Checklist

- home screen loads
- full-screen layout looks correct without browser zoom
- home/feed feels bright, readable, and browse-first
- thread tap opens the selection sheet reliably
- tapping a thread from the bottom of the feed scrolls back to the top and reveals the sheet cleanly
- short-height windows do not feel cramped or awkward
- on Android, the home screen fits comfortably and the feed remains usable
- locale switching updates home, reveal, result, reward, and share-card copy
- test selection works
- locked tests unlock after enough sessions
- progress survives refresh
- reveal flow can be skipped and still lands on a valid result screen
- Android back button behaves correctly
- app pause/resume behaves correctly on-device
- result share opens the native Android share flow
- share card is generated
- local feed API pagination works if `VITE_DISCOVERY_FEED_URL` is configured
- no obvious console errors
