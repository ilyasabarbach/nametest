# How To Continue

This document is written for a future session that needs to pick the project back up quickly.

## Best Next Step Right Now

The project is already locally playable.

The smartest next phase is:

1. test the local experience thoroughly
2. finish fixing the remaining gameplay and UX rough edges
3. then make the Android wrapper truly publishable

Before doing deeper platform work, reread `docs/technical/platform-strategy.md`.

## If The Goal Is "Better Game First"

Focus here:

- continue improving desktop and mobile HUD layout, especially short-height home screens
- refine copy quality
- tune unlock thresholds
- tune event rotation
- add more result variants where repetition is obvious

Recent progress already made:

- `TestScene` now has a stronger multi-step reveal flow and a skip interaction for repeat plays
- the HUD overlay now uses a wider desktop home layout so the browser should not need manual zoom in normal play
- the remaining layout issue is not basic reachability anymore, it is polish on shorter viewport heights
- the long-term Android / Facebook Instant / YouTube Playables gap analysis now lives in `docs/technical/platform-strategy.md`
- `GameRuntime` now resolves platform services through `apps/game-web/src/platform/services.ts`, so future platform work can build on real injection instead of browser-only wiring
- `packages/platform-sdk/src/capacitor/index.ts` now uses Capacitor-aware storage and share behavior instead of re-exporting the browser adapter
- Android lifecycle hooks are now bound at app startup through `apps/game-web/src/platform/installLifecycle.ts`
- `apps/android-shell/android/app/src/main/res` now contains first-pass native app resources and launch theming instead of an empty shell

## If The Goal Is "Android Next"

Focus here:

- continue deepening the Android-specific implementations beyond the current storage/share baseline
- make Android asset pipeline real
- verify the new lifecycle hooks on real devices
- add release metadata and package polish
- test on real Android devices

## Files Most Likely To Need Changes Next

- `apps/game-web/src/GameRuntime.ts`
- `apps/game-web/src/scenes/HomeScene.ts`
- `apps/game-web/src/scenes/TestScene.ts`
- `apps/game-web/src/scenes/ResultScene.ts`
- `apps/game-web/src/ui/overlays/homeOverlay.ts`
- `apps/game-web/src/styles/main.css`
- `packages/core/src/game/GameFlow.ts`
- `packages/core/src/progression/*`
- `packages/content-packs/src/tests/*`

## Things To Be Careful About

- Do not hardcode business logic into scenes if it belongs in `packages/core`
- Do not install dependencies from inside `apps/game-web`
- When adding tests, remember to add both content and copy
- When changing progression shape, update save-data docs and storage expectations

## Short Resume Strategy For A New Session

If you only have a few minutes:

1. read `docs/technical/current-status.md`
2. read `docs/technical/codebase-map.md`
3. read `docs/technical/platform-strategy.md`
4. open `apps/game-web/src/scenes/HomeScene.ts`
5. open `apps/game-web/src/styles/main.css`
6. open `apps/game-web/src/ui/overlays/homeOverlay.ts`
7. open `apps/game-web/src/scenes/TestScene.ts`
8. open `apps/game-web/src/GameRuntime.ts`
9. open `apps/game-web/src/platform/services.ts`
10. open `packages/platform-sdk/src/capacitor/index.ts`
11. open `apps/game-web/src/platform/installLifecycle.ts`
12. open `apps/android-shell/android/app/src/main/AndroidManifest.xml`
13. open `apps/android-shell/android/app/src/main/res/values/themes.xml`
