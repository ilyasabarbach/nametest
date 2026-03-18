# Release Checklist

This is the current practical checklist.

## For Local Testing

1. Run install from the repo root
2. Run the dev server
3. Open the game in the browser
4. Verify full-screen layout
5. Play enough sessions to unlock more tests
6. Verify share-card generation
7. Refresh and confirm progress persisted

## Commands

```bash
corepack pnpm install
corepack pnpm dev
npm run typecheck
npm run test
npm run validate:content
npm run build
```

## Before Android Work Starts

Make sure the local browser version is stable first.

That means:

- no obvious flow bugs
- no blocking layout issues
- content feels good enough to continue
- docs are up to date

## Later Android Checklist

This is future work, not the current task:

- finish Capacitor sync/build pipeline
- add icons/splash/assets
- add privacy/store metadata
- add native QA pass
- harden resume/background behavior
