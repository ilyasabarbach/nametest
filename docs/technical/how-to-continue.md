# How To Continue

This document is written for a future session that needs to pick the project back up quickly.

## Best Next Step Right Now

The project is already locally playable.

The smartest next phase is:

1. continue deepening the new landing-page style test flow until it feels like a true destination instead of an upgraded selector
2. keep running full on-device gameplay QA against that new flow
3. then deepen product polish and Android publishability

Before doing deeper platform work, reread `docs/technical/platform-strategy.md`.

## If The Goal Is "Better Game First"

Focus here:

- deepen the new landing-page style test surface into something that feels closer to a dedicated test page
- keep result / retry / related-content flow feeling like one continuous page
- run full on-device gameplay QA now that the white discovery feed is in place
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
- the home feed now mixes multiple editorial card treatments instead of repeating one exact card shape everywhere
- the home feed now also separates more clearly into editorial families like portrait, tabloid, calendar, and touch-style cards instead of only varying card layout
- thread selection no longer depends on a sticky bottom composer and now promotes the tapped story into a landing-page style surface
- fresh home loads now stay browse-first instead of auto-opening a default story, so the promoted landing surface only appears after a real tap
- the selected landing surface now preserves the tapped story variant instead of flattening immediately into test-only selection
- tapping a thread deep in the feed now scrolls the panel back to the top before refreshing the landing surface
- tapping another story from lower in the same feed now replaces the promoted top test box in-page instead of acting like a separate home reload
- thread taps no longer auto-focus the input fields on mobile, so the promoted surface opens without forcing the keyboard immediately
- the promoted top test box is now simpler and only keeps the selected test title plus the actual test content instead of repeating feed thumbnail and hot/popular card chrome
- in-progress name entry on the home surface now survives locale switches and other scene refreshes, which removes one of the more obvious continuity breaks
- the runtime now preserves the exact selected feed-story variant across locale refreshes, scene restarts, and return-to-home flow instead of only remembering the selected test id
- the landing page now pushes streak/reward/collection and unlock framing lower on the page and switches the primary action to a simpler blue editorial CTA so the first impression feels less game-like
- the home and result surfaces now have a lightweight dark social-page chrome so the editorial content reads more like a page inside a viral feed environment and less like a bare game overlay
- the oversized home hero and inline locale chips are now removed, and locale switching now sits behind a small settings control in the social chrome instead of occupying the full top section
- short-height and small-window home/result layouts now preserve wider editorial grids where possible and only collapse fully when the screen is truly narrow
- the flow now supports single-name readings end to end, and the catalog now includes a first batch of headline / past-life / hidden-gift style tests instead of staying almost entirely pair-based
- the first touch-photo readings now exist for the editorial flow, so not every promoted story depends on typed input before reveal
- the first single-name content batch now has locale parity across the supported languages, so the next work should shift back toward QA and broader editorial depth
- screenshot comparison of the reference product clarified that the next structural gap is dedicated landing pages, not more popup polish
- the result surface now looks more like a poster artifact and can continue straight into another story without forcing the player back through a dead-end state
- the result surface now also keeps a dedicated "more popular stories" layer below the main continuation block so the page feels less terminal and more browseable after the poster/actions flow
- the lower result-page browse layer now pulls from a broader follow-up story pool instead of just repeating the short quick-pick set, which improves endless-feed continuity
- result-page lower story taps now route into the selected story's landing page instead of only changing the smaller continuation area lower on the result screen
- the result layer and generated share posters now have multiple visual families instead of one single poster treatment
- result-page partner-name entry now survives and stays synchronized across retry, continuation, and reward flow instead of splitting into separate drafts
- copy is now localized across the active game flow for the six supported locales in the selector
- a local discovery-feed API workspace now exists, and `GameRuntime` can consume a real feed endpoint via `VITE_DISCOVERY_FEED_URL`
- the web build now succeeds after aligning Vite workspace alias resolution with TypeScript path resolution
- the remaining layout issue is not basic reachability anymore, it is final polish and interaction quality on real devices
- the long-term Android / Facebook Instant / YouTube Playables gap analysis now lives in `docs/technical/platform-strategy.md`
- `GameRuntime` now resolves platform services through `apps/game-web/src/platform/services.ts`, so future platform work can build on real injection instead of browser-only wiring
- `packages/platform-sdk/src/capacitor/index.ts` now uses Capacitor-aware storage and share behavior instead of re-exporting the browser adapter
- Android lifecycle hooks are now bound at app startup through `apps/game-web/src/platform/installLifecycle.ts`
- Android back-button handling now walks a lightweight in-app scene history for home, reading, result, and reward instead of always hard-jumping to home
- the active reading flow is now also persisted through runtime storage and restored after preload, so hard background/restart continuity is better than a simple cold reset
- pause/unload now explicitly snapshots the app-flow state, and restore logic now resolves interrupted reveal/result transitions more defensively
- fresh app reopen now intentionally drops back to browse-first home instead of restoring the last opened home test selection
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

The game now launches on a real Android phone, the home feed fits the intended genre much better, and thread selection has started moving into a landing-page style surface.

The next session should:

1. run the full gameplay loop on-device with special attention to feed continuity, result continuity, retry flow, locale switching, and the new social-page chrome on small screens
2. note every remaining issue with feed scrolling, thread taps, reveal, result, replay, share, back button, background/resume, persistence, locale switching, selected-story continuity, short-height device layouts, the new settings menu, and the first touch-photo readings
3. fix the concrete QA issues that shake out of that pass before shifting platform effort deeper into Android
4. after QA stabilizes, tackle bundle splitting, translation quality review, more human-photo-led feed art direction, deeper live-content control, and the next larger batch of non-pair editorial tests
