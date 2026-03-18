# Current Status

This is the quickest "where are we now?" document.

## What Already Works

- Local web version runs in the browser with Phaser
- Game fills the browser viewport responsively
- Runtime resolves platform services through a shared platform-selection path instead of hardcoding browser services inside the core app flow
- Android now has a real Capacitor-aware adapter for platform detection, native preferences storage, and native share fallback behavior
- Android lifecycle hooks now exist for app pause/resume and back-button behavior through the platform layer
- Android shell now has first-pass native branding resources: app name, themes, launch background, and adaptive launcher icons
- Android app launches on a real phone
- Home screen has been redesigned into a bright white editorial discovery feed instead of the older dark selector-first layout
- Feed cards now use real thumbnail artwork and a browse-first magazine-like presentation
- Home feed supports locale switching across English, French, Spanish, German, Arabic, and Portuguese
- Copy is now localized through the preload, home, reveal, result, reward, and share-card flows for those supported locales
- Discovery feed now supports paginated loading through a shared feed contract and a local API workspace
- Runtime can consume a real discovery-feed endpoint through `VITE_DISCOVERY_FEED_URL`, with a local fallback when no endpoint is configured
- Tapping a feed thread now opens a focused selection sheet instead of relying on a persistent bottom composer
- Tapping a feed thread while scrolled deep in the feed now scrolls the panel back to the top before opening the selection sheet
- Player can select unlocked tests from the feed and start a reading
- Test reveal flow uses a multi-step paced animation instead of a single static wait screen
- Replay bug in the reveal flow was fixed so "try another name" correctly restarts the charging / reveal sequence
- Result screen supports replay and a secret-reading flow
- Result flow now surfaces progression wins such as newly collected result types and newly unlocked tests
- Daily featured test is selected
- A rotating live event is shown
- Progress is stored in browser local storage / native preferences through the platform layer
- Daily rewards and reward coins exist
- Result types are collected over time
- Home screen teases the next unlock with visible progress to improve replay pressure
- Result flavoring now uses band-aware variants to reduce repetitive mismatched copy
- Branded share-card image generation exists
- Android native share path has been upgraded to cache a generated PNG and attempt native file sharing
- Content is data-driven instead of hardcoded into scenes
- Game web build now succeeds with explicit Vite workspace aliases

## What Is Intentionally Deferred Right Now

- Real ads SDK integration
- Real analytics backend and experiments
- Facebook Instant platform adapter implementation
- Store-ready Android hardening beyond the current shell baseline
- Formal QA/live-ops infrastructure

These are not forgotten. They are simply parked while local gameplay is being refined.

## What To Test Locally

- Home screen appears correctly and feels bright / feed-first rather than game-menu-first
- Game fits the browser viewport responsively
- Thread tap opens the selection sheet reliably
- Tapping a thread from the bottom of the feed scrolls back to the top and reveals the sheet cleanly
- Locale switching updates feed, home copy, reveal copy, result copy, reward copy, and share-card text consistently
- If using the local feed API, pagination continues cleanly through multiple pages
- Run full on-device gameplay QA: feed, start reading, result, replay, share, back button, background/resume, persistence, and locale switching
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
- `apps/game-web/src/ui/overlays/homeOverlay.ts`
- `apps/game-web/src/ui/components/shareCard.ts`
- `apps/game-web/src/styles/main.css`
- `apps/discovery-feed-api/src/index.ts`
- `packages/core/src/game/GameFlow.ts`
- `packages/core/src/progression/*`
- `packages/backend-contracts/src/discoveryFeed.schema.ts`
- `packages/content-packs/src/index.ts`
- `packages/content-packs/src/discovery/*`
- `packages/content-packs/src/copy/*`

## Biggest Known Gaps

- The game is feature-rich enough to test, but not yet polished enough to publish
- Home/feed now fits the genre much better, but the visual system still needs another polish pass to fully reach the target product feel
- Supported locales exist, but translation quality still needs native-speaker review before release quality can be claimed
- The discovery feed is now API-driven in local architecture, but it is not yet a true CMS/live-ops backend with remote editorial control
- Some Android native share targets, especially WhatsApp, still need deeper debugging and are intentionally parked for later
- Platform injection foundation now exists, but the Android adapter still needs deeper native behavior and the Facebook adapter is still mostly placeholder
- Android shell exists and now has storage/share/lifecycle/resource groundwork, but publishability work is still mostly ahead of us
- Android can now launch on a real phone, so the main next gap is end-to-end device QA rather than shell bootstrap
- Facebook Instant and YouTube Playables are still future branches, not near-ready builds
- The web bundle is large because Phaser is bundled into the main client chunk
- E2E specs exist, but the local browser/device QA loop still needs more real coverage

## Where The Full Gap Analysis Lives

If a future session needs the complete comparison against the NameTests-style target and the full list of remaining platform work, read:

- `docs/technical/platform-strategy.md`
