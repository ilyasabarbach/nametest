# How To Continue

This document is written for a future session that needs to pick the project back up quickly.

## Best Next Step Right Now

The project is already locally playable.

The smartest next phase is:

1. keep running full on-device gameplay QA against the new editorial home/feed flow
2. fix the remaining highest-friction mobile issues
3. then deepen product polish and Android publishability

Before doing deeper platform work, reread `docs/technical/platform-strategy.md`.

## If The Goal Is "Better Game First"

Focus here:

- run full on-device gameplay QA now that the white discovery feed, selection sheet, and replay flow are in place
- refine copy quality and native-speaker localization quality
- tune unlock thresholds
- tune event rotation
- add more result variants where repetition is obvious
- add stronger editorial feed ranking and freshness
- keep improving the "one more test" pressure on the home surface

Recent progress already made:

- `TestScene` now has a stronger multi-step reveal flow and a skip interaction for repeat plays
- replay now resets the reveal state correctly when trying another name
- the result flow now surfaces progression wins like collected results and new unlocks
- result flavoring was expanded with band-aware variants and more replay depth
- the home experience was redesigned into a bright editorial feed with real thumbnails and locale switching
- thread selection now opens a focused sheet instead of a sticky bottom composer
- tapping a thread deep in the feed now scrolls the panel back to the top before opening the sheet
- copy is now localized across the active game flow for the six supported locales in the selector
- a local discovery-feed API workspace now exists, and `GameRuntime` can consume a real feed endpoint via `VITE_DISCOVERY_FEED_URL`
- the web build now succeeds after aligning Vite workspace alias resolution with TypeScript path resolution
- the remaining layout issue is not basic reachability anymore, it is final polish and interaction quality on real devices
- the long-term Android / Facebook Instant / YouTube Playables gap analysis now lives in `docs/technical/platform-strategy.md`
- `GameRuntime` now resolves platform services through `apps/game-web/src/platform/services.ts`, so future platform work can build on real injection instead of browser-only wiring
- `packages/platform-sdk/src/capacitor/index.ts` now uses Capacitor-aware storage and share behavior instead of re-exporting the browser adapter
- Android lifecycle hooks are now bound at app startup through `apps/game-web/src/platform/installLifecycle.ts`
- `apps/android-shell/android/app/src/main/res` now contains first-pass native app resources and launch theming instead of an empty shell
- Android Studio can now sync and launch the app on a real phone after completing the missing Gradle project files and running `cap sync`

## If The Goal Is "Android Next"

Focus here:

- continue deepening the Android-specific implementations beyond the current storage/share baseline
- resume WhatsApp/native-share debugging later
- make Android asset pipeline real
- verify the new lifecycle hooks and full gameplay loop on real devices
- add release metadata and package polish
- test on real Android devices

## Files Most Likely To Need Changes Next

- `apps/game-web/src/GameRuntime.ts`
- `apps/game-web/src/scenes/HomeScene.ts`
- `apps/game-web/src/scenes/TestScene.ts`
- `apps/game-web/src/scenes/ResultScene.ts`
- `apps/game-web/src/ui/overlays/homeOverlay.ts`
- `apps/game-web/src/ui/components/shareCard.ts`
- `apps/game-web/src/styles/main.css`
- `apps/discovery-feed-api/src/index.ts`
- `packages/backend-contracts/src/discoveryFeed.schema.ts`
- `packages/core/src/game/GameFlow.ts`
- `packages/core/src/progression/*`
- `packages/content-packs/src/discovery/*`
- `packages/content-packs/src/copy/*`
- `packages/content-packs/src/tests/*`

## Things To Be Careful About

- Do not hardcode business logic into scenes if it belongs in `packages/core`
- Do not install dependencies from inside `apps/game-web`
- When adding tests, remember to add both content and copy
- When changing feed structure, keep `packages/backend-contracts`, the local API, and `GameRuntime` in sync
- When changing copy, update all supported locale files, not just English
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
8. open `apps/game-web/src/scenes/ResultScene.ts`
9. open `apps/game-web/src/GameRuntime.ts`
10. open `apps/discovery-feed-api/src/index.ts`
11. open `packages/content-packs/src/discovery/feedFallback.ts`
12. open `packages/content-packs/src/copy/index.ts`
13. open `apps/game-web/src/platform/services.ts`
14. open `packages/platform-sdk/src/capacitor/index.ts`
15. open `apps/game-web/src/platform/installLifecycle.ts`
16. open `apps/android-shell/android/app/src/main/AndroidManifest.xml`

## Current Practical Next Step

The game now launches on a real Android phone, the home feed fits the intended genre much better, and thread selection works through a dedicated sheet.

The next session should:

1. run the full gameplay loop on-device with special attention to the new feed-selection flow
2. note every issue with feed scrolling, thread taps, reveal, result, replay, share, back button, background/resume, persistence, and locale switching
3. fix the highest-impact mobile issues before moving deeper into store-release work
4. after QA stabilizes, tackle bundle splitting, translation quality review, and deeper feed/live-content control
