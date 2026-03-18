# Current Status

This is the quickest "where are we now?" document.

## What Already Works

- Local web version runs in the browser with Phaser
- Game fills the browser viewport responsively
- Runtime now resolves platform services through a shared platform-selection path instead of hardcoding browser services inside the core app flow
- Android now has a real Capacitor-aware adapter for platform detection, native preferences storage, and native share fallback behavior
- Android lifecycle hooks now exist for app pause/resume and back-button behavior through the platform layer
- Android shell now has first-pass native branding resources: app name, themes, launch background, and adaptive launcher icons
- Player can select tests from the unlocked catalog
- Player can enter names and run a test
- Test reveal flow now uses a multi-step paced animation instead of a single static wait screen
- Result screen supports replay and a secret-reading flow
- Daily featured test is selected
- A rotating live event is shown
- Progress is stored in browser local storage
- Daily rewards and reward coins exist
- Result types are collected over time
- Branded share-card image generation exists
- Content is data-driven instead of hardcoded into scenes

## What Is Intentionally Deferred Right Now

- Real ads SDK integration
- Real analytics backend and experiments
- Facebook Instant platform adapter implementation
- Store-ready Android hardening
- Formal QA/live-ops infrastructure

These are not forgotten. They are simply parked while local gameplay is being refined.

## What To Test Locally

- Home screen appears correctly
- Game fits the screen without requiring browser zoom
- Home screen should not require a scrollbar in normal desktop play
- Short-height browser windows still need a final polish pass on the home scene composition
- Locked and unlocked tests behave correctly
- Playing sessions unlocks additional tests
- Daily reward appears only once per day
- Test reveal pacing feels good across repeated plays
- Tapping during reveal skips cleanly into the result screen
- Result cards show score, title, body, insight, and signature
- Share action generates a card image
- Replay flow resets the right parts of session state

## Most Important Files Right Now

- `apps/game-web/src/GameRuntime.ts`
- `apps/game-web/src/scenes/HomeScene.ts`
- `apps/game-web/src/scenes/TestScene.ts`
- `apps/game-web/src/scenes/ResultScene.ts`
- `packages/core/src/game/GameFlow.ts`
- `packages/core/src/progression/*`
- `packages/content-packs/src/index.ts`

## Biggest Known Gaps

- The game is feature-rich enough to test, but not yet polished enough to publish
- Home overlay is much more usable now, but short-height layouts still need tighter scene + overlay coordination
- Platform injection foundation now exists, but the Android adapter still needs deeper native behavior and the Facebook adapter is still mostly placeholder
- Android shell exists and now has storage/share/lifecycle/resource groundwork, but publishability work is still mostly ahead of us
- Facebook Instant and YouTube Playables are still future branches, not near-ready builds
- The web bundle is large because Phaser is bundled into the main client chunk
- E2E specs exist, but the local browser/device QA loop still needs more real coverage

## Where The Full Gap Analysis Lives

If a future session needs the complete comparison against the NameTests-style target and the full list of remaining platform work, read:

- `docs/technical/platform-strategy.md`
