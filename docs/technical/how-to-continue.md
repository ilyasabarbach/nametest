# How To Continue

This document is written for a future session that needs to pick the project back up quickly.

## Best Next Step Right Now

The project is already locally playable.

The smartest next phase is:

1. continue deepening the new landing-page style test flow until it feels like a true destination instead of an upgraded selector
2. keep running full on-device gameplay QA against that new flow
3. in parallel, finish the Telegram operational layer now that the adapter/backend groundwork exists
4. then deepen product polish and Android / Telegram publishability

Before doing deeper platform work, reread `docs/technical/platform-strategy.md`.

For content, virality, catalog shape, and AI-artifact direction, also reread `docs/technical/viral-growth-plan.md`.

## If The Goal Is "Better Game First"

Focus here:

- deepen the new landing-page style test surface into something that feels closer to a dedicated test page
- keep result / retry / related-content flow feeling like one continuous page
- run full on-device gameplay QA now that the white discovery feed is in place
- refine copy quality and native-speaker localization quality
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
- the home feed is now intentionally fully open, with all tests playable from the start and no next-unlock gating in the main browse surface
- in-progress name entry on the home surface now survives locale switches and other scene refreshes, which removes one of the more obvious continuity breaks
- the runtime now preserves the exact selected feed-story variant across locale refreshes, scene restarts, and return-to-home flow instead of only remembering the selected test id
- the landing page now pushes streak/reward/collection and unlock framing lower on the page and switches the primary action to a simpler blue editorial CTA so the first impression feels less game-like
- the home and result surfaces now have a lightweight dark social-page chrome so the editorial content reads more like a page inside a viral feed environment and less like a bare game overlay
- the top navbar is now more minimal: homepage keeps only the Settings gear plus the centered logo, while non-home result surfaces add Home beside Settings on the left and leave the rest of the bar empty
- the oversized home hero and inline locale chips are now removed, and locale switching now sits behind a small settings control in the social chrome instead of occupying the full top section
- short-height and small-window home/result layouts now preserve wider editorial grids where possible and only collapse fully when the screen is truly narrow
- the flow now supports single-name readings end to end, and the catalog now includes a first batch of headline / past-life / hidden-gift style tests instead of staying almost entirely pair-based
- `past-life-echo` has now been tightened into a true single-name reading, so future poster work should assume it receives a real player name instead of a fake tap-photo placeholder state
- the first touch-photo readings now exist for the editorial flow, so not every promoted story depends on typed input before reveal
- the first single-name content batch now has locale parity across the supported languages, so the next work should shift back toward QA and broader editorial depth
- the next broader editorial batch now also exists in the catalog, adding aura, group-role, soul-story, photo-archetype, and movie-poster readings with distinct hook/artifact families
- screenshot comparison of the reference product clarified that the next structural gap is dedicated landing pages, not more popup polish
- the result surface now looks more like a poster artifact and can continue straight into another story without forcing the player back through a dead-end state
- the result surface now also keeps a dedicated "more popular stories" layer below the main continuation block so the page feels less terminal and more browseable after the poster/actions flow
- the lower result-page browse layer now pulls from a broader follow-up story pool instead of just repeating the short quick-pick set, which improves endless-feed continuity
- result-page lower story taps now route into the selected story's landing page instead of only changing the smaller continuation area lower on the result screen
- the lower result-page browse layer now draws from the full editorial catalog instead of only the currently unlocked / already loaded feed slice, so result pages keep behaving like a broader browse surface
- the lower result-page feed is now back to a pure card grid without an embedded second test composer, so only the promoted top-of-page surface shows test inputs/buttons after a story click
- the secret-reading reward path now uses the same continuation/browse model as the normal result page instead of dropping the player into a reduced dead-end overlay
- reward-state persistence in the runtime is now fixed, so the older stuck "unlocking secret reading" behavior should no longer bleed into later runs
- the older progression summary callout has been removed from the main result surface so results behave more like poster-plus-feed pages than reward dashboards
- the test schema now includes first-pass viral/AI-ready metadata, and the content package now has an artifact recipe registry instead of leaving that strategy only in docs
- the schema now also includes `imageRecipeId` and `thumbnailRecipeId`, and the content package now has a generated-image recipe layer so feed/result art direction can scale without hardcoding each new family inside scenes
- result/share template selection has started moving onto that recipe layer, so future sessions should keep extending recipe-driven artifact families instead of hardcoding new poster logic in scenes
- the newer editorial batch now uses that recipe layer in practice, so portrait / headline / storybook / poster presentation is no longer only a theoretical plan
- result pages now expose visible remix choices so the player can switch between recipe-backed artifact families before sharing, which lands the next real step from the viral-growth plan without requiring AI yet
- the deeper AI/image-generation groundwork now exists in schema and backend seams, but the live product has intentionally gone back to normal remix-only result pages and manual/static thumbnails because the current free/fallback image quality was not strong enough
- the only current exception is image-recipe-backed result families such as `past-life-echo`, which are allowed to expose `Make AI version` again for narrow testing without reopening low-quality AI across the whole catalog
- the current `past-life-echo` exception is no longer the old broken mock poster: its generated result now uses wrapped editorial headline text, fixed present/past identity slots, and a cleaner poster-first layout that should be used as the baseline for judging any future AI poster family
- Android now also has an opt-in Google profile-photo path for image-backed poster families, so `past-life-echo` can upgrade the present-day side of the poster with a real user image without forcing sign-in on the rest of the app
- the Google-photo path is intentionally optional and should stay confined to poster families where the artifact meaningfully benefits from a personal portrait instead of being expanded across the whole catalog by default
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

## If The Goal Is "Telegram Next"

Focus here:

- create and configure the real Telegram bot in BotFather
- deploy the web build and API to a public HTTPS host
- set the Telegram environment variables for both the game and backend
- verify live init-data validation, `startapp` landing, and result re-entry on Telegram clients
- test Telegram native back/settings buttons, theme/viewport behavior, and share-return flow
- prepare Main Mini App / Apps-tab assets, privacy policy, support URL, and launch copy

Recent Telegram-specific progress already made:

- `packages/platform-sdk/src/telegram/index.ts` now exists as a real Telegram adapter instead of a placeholder
- `apps/game-web/src/platform/services.ts` can now detect or explicitly target Telegram
- `apps/game-web/src/platform/installLifecycle.ts` can now map Telegram back/settings buttons into the shared runtime navigation/settings behavior
- `apps/game-web/src/GameRuntime.ts` now resolves Telegram launch context and can promote an exact test from a prepared `startapp` deep link
- `apps/discovery-feed-api/src/index.ts` now has local endpoints for Telegram init verification, `startapp` resolution, prepared share payloads, and optional story-media hosting
- result pages now support Telegram-style `Share to chat` and optional `Share to story` actions when the deployed environment supports them
- platform profile handling is now generic enough that Telegram user data and `photo_url` can feed the same poster pipeline as other optional profile-image flows
- Telegram chat-share now uses a fast local deeplink path instead of waiting on share-card rendering first, which fixes the earlier "tap share and nothing happens" behavior on Telegram clients
- the Telegram branch now also exposes a tighter curated launch catalog and hides the louder reward/collection stat pills on Telegram home/result surfaces
- Telegram resume after a share handoff now records a lightweight `share_returned` analytics event so re-entry can be measured during launch QA
- Telegram chat-share now also shows an in-app assist sheet with `Open share` / `Copy link` fallback actions, so stricter Telegram clients no longer fail invisibly when the first share bridge call is swallowed
- Telegram platform detection now also keys off Telegram launch params / webview markers, which protects against Telegram clients that inject the WebApp bridge too late for first-paint platform detection
- Browser fallback share now catches `NotAllowedError` from `navigator.share` and redirects into Telegram deeplink sharing when the app is clearly running inside a Telegram webview
- Telegram Web launch parsing now merges hash-based `tgWebApp*` params with normal query params, because real Telegram Web sessions may deliver Mini App context in the hash instead of `window.location.search`
- Telegram chat-share no longer force-navigates to the share URL immediately after a successful bridge call, which should stop the extra blank/dark `Webpage` surface that was appearing on top of the real Telegram forward chooser during live testing
- Telegram chat-share now asks the backend for a prepared native message tied to the current Telegram user and uses `shareMessage(...)` first on phone, so `t.me/share/url` should only appear as a fallback path rather than the default mobile share experience
- The repo now also has root `/api/telegram/*` serverless handlers intended for same-origin web deploys such as Vercel, and `GameRuntime` now defaults backend resolution to `window.location.origin`, so Telegram share no longer depends on a separately deployed local API workspace just to prepare native shares
- Telegram mobile fallback sharing now prefers `tg://msg_url` before web share URLs when a prepared message is unavailable, which is intended to avoid the dark extra web task behavior seen on Android Telegram while still keeping desktop/web Telegram share behavior unchanged
- The same `/api/telegram/*` handlers now also exist under `apps/game-web/api/telegram/*` for app-root-only deployments, which closes the production 404 gap where Telegram share preparation endpoints were missing in deployed builds
- Runtime scene restore can now be invalidated across releases by setting `VITE_APP_BUILD_ID`; this prevents reopening stale old-version scenes after a deploy when Telegram keeps the webview session alive
- Telegram app-root serverless routes now explicitly request Node runtime and the share-result handler now has a hard-fallback response path, reducing live `500` risk when deployment/runtime behavior differs from local expectations

## Files Most Likely To Need Changes Next

- `apps/game-web/src/GameRuntime.ts`
- `apps/game-web/src/platform/services.ts`
- `apps/game-web/src/platform/installLifecycle.ts`
- `apps/game-web/src/scenes/HomeScene.ts`
- `apps/game-web/src/scenes/TestScene.ts`
- `apps/game-web/src/scenes/ResultScene.ts`
- `apps/game-web/src/ui/overlays/homeOverlay.ts`
- `apps/game-web/src/ui/components/shareCard.ts`
- `apps/game-web/src/styles/main.css`
- `apps/discovery-feed-api/src/index.ts`
- `packages/platform-sdk/src/telegram/index.ts`
- `packages/platform-sdk/src/interfaces/IPlatform.ts`
- `packages/platform-sdk/src/interfaces/IIdentity.ts`
- `packages/platform-sdk/src/interfaces/IShare.ts`
- `packages/backend-contracts/src/telegram.schema.ts`
- `packages/backend-contracts/src/discoveryFeed.schema.ts`
- `packages/core/src/game/GameFlow.ts`
- `packages/core/src/progression/*`
- `packages/content-packs/src/discovery/*`
- `packages/content-packs/src/artifacts/recipes.ts`
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
3. finish the Telegram operational checklist: bot setup, public HTTPS hosting, `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME` / `TELEGRAM_PUBLIC_BASE_URL` configuration, and live `startapp` verification
4. verify Telegram `Share to chat` and `Share to story` behavior on actual Telegram clients and confirm the new fast chat-share path plus `share_returned` telemetry behave correctly
5. after QA stabilizes across Android and Telegram, keep tuning the narrow `past-life-echo` poster path, especially the new Google-photo + AI layering, until it clearly beats the previous mock result on-device, then tackle bundle splitting, translation quality review, stronger human-photo-led thumbnail curation, deeper live-content control, and only then expand AI image generation beyond that first family
