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
- Platform injection now also has a first real Telegram Mini App branch instead of only browser / Android / placeholder Facebook paths
- Telegram now has a dedicated adapter for launch context, theme/viewport, native back/settings buttons, fullscreen/expand hooks, haptics, share routing, and CloudStorage-backed persistence with browser fallback
- Runtime now consumes Telegram launch context and platform profile data through neutral interfaces instead of hardcoding browser-only assumptions
- Telegram backend foundation now exists for init-data verification, `startapp` deep-link resolution, prepared share payloads, and optional story-media hosting
- Telegram result flow can now swap to platform-native share behavior, including `Share to chat`, optional `Share to story`, and exact-test re-entry via prepared `startapp` links
- Telegram `Share to chat` now has a hardened open path (native Telegram link, then Telegram openLink, then browser fallback) so button taps do not silently no-op on stricter Telegram clients
- Telegram deep links now normalize usernames with or without `@` and prefer the Mini App short-name path (`/bot/short_name?startapp=...`) for better re-entry consistency
- Telegram chat-share now skips slow share-card generation and uses an immediate local deeplink/share URL path so the share surface still opens within the original tap gesture on Telegram clients
- Telegram launch mode now uses a tighter curated catalog instead of the full experimental set, and Telegram home/result surfaces now de-emphasize reward/collection stats so the app reads more like a social object than a game dashboard
- Telegram lifecycle now records a lightweight `share_returned` signal when the app resumes after a share handoff, which closes one of the minimum telemetry gaps from the launch plan
- Telegram chat-share now also shows a guaranteed visible in-app assist sheet while opening the share handoff, so players still get `Open share` / `Copy link` recovery instead of a dead tap when a Telegram client swallows the first bridge call
- Telegram platform detection is now more defensive: if a Telegram client exposes only launch params or Telegram webview markers instead of `window.Telegram.WebApp` at first paint, the runtime should still select the Telegram branch instead of silently falling back to browser behavior
- Browser-mode share now catches `navigator.share` permission failures and falls back to Telegram deeplinks when Telegram launch markers are present, so Telegram webviews that deny Web Share no longer produce a dead `Share this result` button
- Telegram Web launch parsing now reads `tgWebApp*` params from both the query string and the hash fragment, which fixes the earlier case where Telegram Web passed Mini App context in `#...` and the app misdetected itself as plain browser
- Telegram chat-share bridge calls now trust the native Telegram handoff first instead of immediately force-navigating to the share URL, which should prevent the duplicate dark `Webpage` tab that appeared alongside the real forward/share surface on live devices
- Telegram phone share now prefers the native `shareMessage(messageId)` flow via backend-prepared messages, with `t.me/share/url` kept only as fallback, which should eliminate the extra dark webpage task when the backend has a working `TELEGRAM_BOT_TOKEN`
- Game web now defaults its Telegram/backend calls to same-origin `/api/...` routes, and the repo now includes root serverless Telegram endpoints for init verification, `startapp` resolution, and share preparation, so a Vercel-style deploy can support native Telegram share without requiring the separate discovery-feed API workspace to be deployed first
- Telegram mobile share now also tries the native `tg://msg_url` path before `t.me/share/url` when no prepared message ID is available, reducing the chance of extra dark web-page tasks on Android Telegram clients during fallback sharing
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
- Homepage now uses a minimal top navbar with only the Settings gear on the left and a centered game logo, while non-home result surfaces use Home plus Settings on the left with that same centered logo
- The oversized home hero and inline locale chip row are now gone, and language switching now lives inside a lighter settings menu in the top chrome instead of taking over the top of the page
- Short-height home and result layouts now keep the editorial feed/result surfaces readable instead of collapsing into overly narrow columns on landscape phones and cramped browser windows
- The landing/test/result flow now supports both pair-name readings and single-name readings instead of hardcoding the entire experience around two-name inputs
- `past-life-echo` now runs as a single-name reading instead of a fake tap-photo flow, so the result can map the player's actual name cleanly into the poster
- The first touch-photo readings now exist, so some stories can start directly from tapping the promoted image instead of always opening the keyboard and waiting for manual text entry
- The first single-name headline / past-life / hidden-gift batch now has locale-copy parity across all supported languages instead of staying partially English-only in practice
- The next higher-contrast editorial batch now also exists in the catalog: aura, group-role, soul-story, photo-archetype, and movie-poster tests have been added on top of the first non-pair expansion
- All tests are now available from the main feed by default, so the product behaves like an open viral catalog instead of a gated progression ladder
- Test reveal flow uses a multi-step paced animation instead of a single static wait screen
- Replay bug in the reveal flow was fixed so "try another name" correctly restarts the charging / reveal sequence
- Result screen supports replay and a secret-reading flow
- Result flow now surfaces progression wins such as newly collected result types and newly unlocked tests
- Result surface now uses a poster-style layout instead of only a plain stacked card treatment
- Result page now continues with more playable stories and a direct "read this next" path so the session feels less terminal
- Result page now also carries a dedicated "more popular stories" browse layer underneath the poster/actions flow so it feels closer to an endless editorial page instead of a terminal result state
- Result-page continuation now reaches into a broader follow-up story set instead of only echoing the short quick-pick list, so the lower browse layer feels more like a real feed continuation
- Clicking a lower story on the result page now opens that story as the next landing page instead of only updating a smaller continuation widget lower on the same result screen
- Result-page lower browsing now uses the full editorial test catalog instead of only the currently unlocked / currently loaded slice, so players can keep scrolling all story types from inside a result page
- The lower result-page story area is now browse-only again, so it no longer embeds a second inline test/input box inside the scroll flow; clicking a story is what promotes that test back to the top landing surface
- The secret-reading reward path now preserves the same lower browse/feed continuity as the normal result page instead of collapsing into a stripped-down dead-end variant
- Reward-state updates now persist through the runtime session setter, which fixes the broken secret-reading loop and removes the stale reward-loading behavior from later runs
- Result pages no longer foreground the old "unlocked this run" progression summary block, so the poster and browse flow stay primary
- Result posters and generated share posters now use multiple visual template families instead of one single poster treatment
- Result/share artifact selection is now starting to move onto an explicit recipe layer instead of relying only on hardcoded symbol-to-template guesses
- Result pages now expose visible remix UI on top of that recipe layer, so players can switch the poster family in-place before sharing instead of only seeing the default artifact treatment
- The deeper viral/AI groundwork now exists in schema and backend seams, but the broad user-facing `Make AI version` path is intentionally removed again for now because the free/fallback image quality did not yet clear the product bar
- Tests now also carry first-pass `imageRecipeId` and `thumbnailRecipeId` metadata, but live feed art is intentionally back on manual/static thumbnails for now until curated test-by-test artwork is ready
- The live product now only re-exposes `Make AI version` for tests that have a real result-image recipe behind them, so the current narrow test path is `past-life-echo` rather than the full catalog
- The first narrow AI-poster path has now been rebuilt around `past-life-echo`: the generated poster uses wrapped headline text, fixed identity/story slots, cleaner vintage composition, and a poster-focused result surface instead of the earlier broken mock-like layout
- Android now also has an optional Google profile-photo path, so image-backed poster families such as `past-life-echo` can pull an explicitly approved Google profile image into the present-day side of the result instead of staying monogram-only
- The Google profile-photo path is opt-in and cached locally through the runtime, and it keeps working with the narrow AI-remix path instead of competing with it
- Result-page partner-name entry now stays in sync across retry, next-story continuation, and reward/secret-result flow instead of drifting between separate inputs
- Daily featured test is selected
- A rotating live event is shown
- Progress is stored in browser local storage / native preferences through the platform layer
- Daily rewards and reward coins exist
- Result types are collected over time
- Progression data still exists in the background for session history and result collection, but hard unlock gating is no longer shaping the main browsing surface
- Result flavoring now uses band-aware variants to reduce repetitive mismatched copy
- Branded share-card image generation exists
- Android native share path has been upgraded to cache a generated PNG and attempt native file sharing
- Content is data-driven instead of hardcoded into scenes
- Test definitions now carry first-pass viral/AI-ready metadata such as input mode, artifact recipe, style family, remix modes, and structured hook data
- The content package now also has a shared artifact recipe registry, which is the first step toward optional AI remix work without stuffing raw prompt logic into every test JSON
- The first larger viral-content batch now uses that metadata and recipe layer end to end, so the feed/result/share system can distinguish portrait, headline, storybook, and poster families more explicitly
- The Telegram branch now treats identity generically enough that Telegram `photo_url` and profile data can slot into the same poster/share pipeline as other optional profile-image paths
- Game web build now succeeds with explicit Vite workspace aliases
- Screenshot comparison of the reference product clarified the next major structural gap, and the codebase has now started moving toward that dedicated landing-page style test flow

## What Is Intentionally Deferred Right Now

- Real ads SDK integration
- Real analytics backend and experiments
- Facebook Instant platform adapter implementation
- Store-ready Android hardening beyond the current shell baseline
- Real Telegram bot configuration, BotFather Main Mini App setup, public HTTPS hosting, and Telegram App Center listing assets
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
- Every test should be visible and playable from the home feed immediately
- Telegram browser/device launch should now resolve `startapp` context into the exact promoted test instead of generic browse-first home when a valid share link is used
- Telegram native settings/back buttons should mirror the same settings menu and scene-navigation behavior the web/app UI already exposes
- Telegram share-to-chat should now prepare a result-specific deep link that re-enters the exact test/remix state instead of dropping recipients into generic home
- Telegram share button should now always trigger a visible share navigation path even when one Telegram WebApp API method is unavailable in a specific client build
- Telegram chat-share should now open without waiting on share-card image rendering, so tapping the button inside Telegram should feel immediate
- Telegram chat-share should now show a visible fallback sheet even when no Telegram share surface opens automatically, so live-device testing can still proceed without invisible failure
- Telegram story-share should only appear when `VITE_TELEGRAM_PUBLIC_BASE_URL` is configured and the API can serve a public result poster URL
- Daily reward appears only once per day
- Test reveal pacing feels good across repeated plays
- Tapping during reveal skips cleanly into the result screen
- Result cards show score, title, body, insight, and signature
- Result page keeps share, retry, reward, and next-story continuation working together without dead-ending the player
- Result page keeps the additional "more popular stories" browse layer working as a continuation surface instead of feeling like a final screen
- Result page uses the lower browse layer to select from the full editorial catalog without breaking the main continuation composer
- Result pages should currently expose the normal remix choices across the catalog, and only image-recipe-backed tests such as `past-life-echo` should show `Make AI version`
- `past-life-echo` should now accept a single name, render that exact name into the poster fields, and keep the generated poster readable instead of clipping the headline or overlapping field/body text
- On Android, `past-life-echo` should now also offer `Use Google photo` when `VITE_GOOGLE_WEB_CLIENT_ID` is configured, and using it should replace the left-side present portrait with the user's Google image
- Editing the partner name on the result page carries cleanly through retry, next-story continuation, and reward flow
- Single-name readings hide the extra partner input where appropriate and keep share/retry copy from rendering awkward empty-name combinations
- Share action generates a card image
- Replay flow resets the right parts of session state

## Most Important Files Right Now

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
- `packages/core/src/game/GameFlow.ts`
- `packages/platform-sdk/src/telegram/index.ts`
- `packages/platform-sdk/src/interfaces/IPlatform.ts`
- `packages/platform-sdk/src/interfaces/IIdentity.ts`
- `packages/platform-sdk/src/interfaces/IShare.ts`
- `packages/backend-contracts/src/telegram.schema.ts`
- `packages/core/src/progression/*`
- `packages/backend-contracts/src/discoveryFeed.schema.ts`
- `packages/content-packs/src/index.ts`
- `packages/content-packs/src/artifacts/recipes.ts`
- `packages/content-packs/src/discovery/*`
- `packages/content-packs/src/copy/*`

## Biggest Known Gaps

- The game is feature-rich enough to test, but not yet polished enough to publish
- Home/feed now fits the genre much better and both feed cards and result posters have started diversifying their templates, but the visual system still needs another polish pass plus stronger human-photo realism to fully reach the target product feel
- The landing page now suppresses some of the more obvious game-dashboard feel and now carries a first lightweight social-page chrome, but the product still is not yet a true endless editorial test page with full platform-native content density
- Content breadth has moved beyond pair-only romance tests with headline, past-life, hidden-gift, aura, group-role, soul-story, photo-archetype, and movie-poster readings, and the whole catalog is now intentionally open from the start, but it is still not broad or trend-reactive enough yet
- Supported locales exist, but translation quality still needs native-speaker review before release quality can be claimed
- The discovery feed is now API-driven in local architecture, but it is not yet a true CMS/live-ops backend with remote editorial control
- The landing-page style flow now extends further into the result page with an explicit browse-more layer, but it is still not yet a true standalone dedicated test page with full feed/result continuity
- The viral/AI strategy is now documented and the deeper schema/backend groundwork exists, but broad user-facing AI image generation is still intentionally parked until curated manual thumbnails exist and more than the first narrow poster family clearly clears the product bar
- The next realism step is not broad AI thumbnails; it is tuning the new opt-in Google-photo + narrow AI-poster path until the personalized result artifact clearly feels worth sharing on-device
- Telegram Mini App platform seams now exist in code, but the branch is not publish-ready until there is a real bot, BotFather Main Mini App setup, public HTTPS hosting, verified Telegram init-data in production, and true Telegram-client QA
- Telegram-native virality is still only partially complete: exact-test `startapp` routing and prepared share links exist, but the bot-driven re-entry loop, App Center polish, and real share-to-story/public-media validation still need end-to-end testing on Telegram clients
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
- `docs/technical/viral-growth-plan.md`
