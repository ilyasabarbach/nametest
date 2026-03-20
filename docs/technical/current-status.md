# Current Status

This is the quickest "where are we now?" document.

## What Already Works

- Local web version runs in the browser with Phaser
- Game fills the browser viewport responsively
- Runtime resolves platform services through a shared platform-selection path instead of hardcoding browser services inside the core app flow
- Android now has a real Capacitor-aware adapter for platform detection, native preferences storage, and native share fallback behavior
- Android lifecycle hooks now exist for app pause/resume and back-button behavior through the platform layer
- Android back-button behavior now follows a lightweight scene history across home, reading, result, and reward flow instead of dumping the player straight to home from every non-home screen
- Runtime now persists the active reading flow itself, including session, selected story, name drafts, and scene history, so preload can restore players closer to where they left off after a hard background/restart
- Lifecycle pause/unload now also forces an app-state snapshot, and restore now prefers the right main scene defensively when a reveal/result transition is interrupted by backgrounding
- Fresh app reopen now intentionally returns to the browse-first home feed instead of restoring the last promoted home test box at the top
- Android shell now has first-pass native branding resources: app name, themes, launch background, and adaptive launcher icons
- Android app launches on a real phone
- Home screen has been redesigned into a bright white editorial discovery feed instead of the older dark selector-first layout
- Feed cards now use real thumbnail artwork and a browse-first magazine-like presentation
- Home feed now uses multiple editorial card treatments instead of one fully uniform card shape
- Home feed now also uses clearer editorial card families such as portrait, tabloid, calendar, and touch-to-reveal style treatments instead of relying only on layout variation
- Home feed supports locale switching across English, French, Spanish, German, Arabic, and Portuguese
- Copy is now localized through the preload, home, reveal, result, reward, and share-card flows for those supported locales
- Discovery feed now supports paginated loading through a shared feed contract and a local API workspace
- Runtime can consume a real discovery-feed endpoint through `VITE_DISCOVERY_FEED_URL`, with a local fallback when no endpoint is configured
- Tapping a feed thread now promotes that story into a landing-page style hero/composer surface instead of relying on a popup composer
- Fresh home loads now stay browse-first instead of auto-opening a default story, so the promoted landing surface appears only after a real thread tap
- The selected landing surface now preserves the specific feed story that was tapped, including its artwork and editorial framing, instead of collapsing immediately into test-only state
- Tapping a feed thread while scrolled deep in the feed now scrolls the panel back to the top and recenters the landing surface cleanly
- Tapping another thread lower in the feed now keeps the player on the same infinite page and swaps the promoted test box at the top instead of feeling like a separate home reload
- Thread taps no longer auto-focus the text inputs on mobile, so selecting a story does not immediately pop the keyboard before the player chooses to type
- The promoted test box itself is now simplified to the selected test title and the real test content instead of repeating feed thumbnail, hot/popular chrome, and other card framing inside the top module
- In-progress home name entry now survives locale switching and landing-surface refreshes instead of forcing the player to retype
- Home navigation now preserves the exact selected feed-story variant across locale refreshes, scene restarts, and return-to-home flow instead of falling back to a generic story for the same test
- The landing page now de-emphasizes streak/reward/collection framing on the first screenful and uses a simpler blue editorial CTA so the surface reads less like a game dashboard
- Home and result surfaces now include a lightweight dark social-page chrome so the editorial white content feels more like a page inside a viral feed ecosystem instead of a bare game panel
- The oversized home hero and inline locale chip row are now gone, and language switching now lives inside a lighter settings menu in the top chrome instead of taking over the top of the page
- Short-height home and result layouts now keep the editorial feed/result surfaces readable instead of collapsing into overly narrow columns on landscape phones and cramped browser windows
- The landing/test/result flow now supports both pair-name readings and single-name readings instead of hardcoding the entire experience around two-name inputs
- The first touch-photo readings now exist, so some stories can start directly from tapping the promoted image instead of always opening the keyboard and waiting for manual text entry
- The first single-name headline / past-life / hidden-gift batch now has locale-copy parity across all supported languages instead of staying partially English-only in practice
- Player can select unlocked tests from the feed and start a reading
- Test reveal flow uses a multi-step paced animation instead of a single static wait screen
- Replay bug in the reveal flow was fixed so "try another name" correctly restarts the charging / reveal sequence
- Result screen supports replay and a secret-reading flow
- Result flow now surfaces progression wins such as newly collected result types and newly unlocked tests
- Result surface now uses a poster-style layout instead of only a plain stacked card treatment
- Result page now continues with more playable stories and a direct "read this next" path so the session feels less terminal
- Result page now also carries a dedicated "more popular stories" browse layer underneath the poster/actions flow so it feels closer to an endless editorial page instead of a terminal result state
- Result-page continuation now reaches into a broader follow-up story set instead of only echoing the short quick-pick list, so the lower browse layer feels more like a real feed continuation
- Clicking a lower story on the result page now opens that story as the next landing page instead of only updating a smaller continuation widget lower on the same result screen
- Result posters and generated share posters now use multiple visual template families instead of one single poster treatment
- Result-page partner-name entry now stays in sync across retry, next-story continuation, and reward/secret-result flow instead of drifting between separate inputs
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
- Screenshot comparison of the reference product clarified the next major structural gap, and the codebase has now started moving toward that dedicated landing-page style test flow

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
- Thread tap promotes the chosen story into the landing surface reliably
- Tapping a thread from the bottom of the feed scrolls back to the top and refreshes the landing surface cleanly
- Locale switching updates feed, home copy, reveal copy, result copy, reward copy, and share-card text consistently
- Locale switching preserves in-progress home name entry while refreshing the localized surface
- Returning home after reading keeps the selected landing-story context aligned with the story the player actually chose, including result-page continuation picks where possible
- The home surface now keeps curiosity, headline, and input flow primary while progression and unlock information stay visually secondary
- Home and result surfaces keep their lightweight social/page chrome readable on smaller widths instead of dropping back to a purely app-like panel feel
- Short-height and small-window layouts keep the landing-page and result-continuation flow readable instead of pinching the feed into cramped single-column continuity breaks
- If using the local feed API, pagination continues cleanly through multiple pages
- Run full on-device gameplay QA: feed, start reading, result, replay, share, back button, background/resume, persistence, and locale switching
- Android back button should now step through recent home -> test -> result -> reward flow before exiting from home
- Hard background/restart should now restore into the current main flow more gracefully instead of always cold-starting the player at a fresh home state
- Hard background/restart during the reveal -> result handoff should now restore to the correct side of that transition more reliably instead of falling back into the wrong scene
- Locked and unlocked tests behave correctly
- Playing sessions unlocks additional tests
- Daily reward appears only once per day
- Test reveal pacing feels good across repeated plays
- Tapping during reveal skips cleanly into the result screen
- Result cards show score, title, body, insight, and signature
- Result page keeps share, retry, reward, and next-story continuation working together without dead-ending the player
- Result page keeps the additional "more popular stories" browse layer working as a continuation surface instead of feeling like a final screen
- Result page uses the lower browse layer to select from a wider story pool without breaking the main continuation composer
- Editing the partner name on the result page carries cleanly through retry, next-story continuation, and reward flow
- Single-name readings hide the extra partner input where appropriate and keep share/retry copy from rendering awkward empty-name combinations
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
- Home/feed now fits the genre much better and both feed cards and result posters have started diversifying their templates, but the visual system still needs another polish pass plus stronger human-photo realism to fully reach the target product feel
- The landing page now suppresses some of the more obvious game-dashboard feel and now carries a first lightweight social-page chrome, but the product still is not yet a true endless editorial test page with full platform-native content density
- Content breadth has started expanding beyond pair-only romance tests with the first single-name headline / past-life / hidden-gift readings, but the catalog is still far from broad enough
- Supported locales exist, but translation quality still needs native-speaker review before release quality can be claimed
- The discovery feed is now API-driven in local architecture, but it is not yet a true CMS/live-ops backend with remote editorial control
- The landing-page style flow now extends further into the result page with an explicit browse-more layer, but it is still not yet a true standalone dedicated test page with full feed/result continuity
- Real-device QA is now finding narrower polish issues, especially around short-height behavior, rather than basic structural layout failure
- Persistence and back continuity are stronger now, but they still need real-device verification across Android pause/resume, process death, and share-return edge cases
- Android-style back/home continuity is improving and now uses a lightweight scene-history path, but the full scene model still is not yet a true URL-like page stack
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
