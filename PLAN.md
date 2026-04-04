# Telegram Mini App Gap Plan

## Summary
- Current verdict: the game is **not Telegram-ready yet**. It has a strong shared game core and growing platform seams in [services.ts](C:\Users\hil\Documents\ilyas\codex\apps\game-web\src\platform\services.ts) and [IPlatform.ts](C:\Users\hil\Documents\ilyas\codex\packages\platform-sdk\src\interfaces\IPlatform.ts), but there is **no Telegram adapter, no bot-backed launch/share loop, and no Telegram-native identity/storage/share path**.
- Based on [platform-strategy.md](C:\Users\hil\Documents\ilyas\codex\docs\technical\platform-strategy.md) and [viral-growth-plan.md](C:\Users\hil\Documents\ilyas\codex\docs\technical\viral-growth-plan.md), the current product can be adapted to Telegram, but it still lacks the platform-native growth loop that made NameTests-style products spread.
- Important expectation reset: matching Facebook Instant 2021 virality on Telegram will **not** come from App Center presence alone. The Telegram equivalent is: **Main Mini App previews + `startapp` deep links + native result sharing (`shareMessage` / `shareToStory`) + bot re-entry + exact-test landing**.
- Telegram platform facts to build around:
  - Mini Apps are bot-backed HTTPS web apps with launch parameters, back/settings/theme/viewport APIs, and native share methods: [Telegram Mini Apps](https://core.telegram.org/bots/webapps), [About Platform](https://docs.telegram-mini-apps.com/platform/about), [Getting App Link](https://docs.telegram-mini-apps.com/platform/getting-app-link).

## What The Game Lacks Today
- **Publishability blockers**
  - No Telegram bot, no Main Mini App setup, no production HTTPS Telegram host, no App Center/profile preview media, no `startapp` link strategy.
  - No Telegram platform adapter for init data, launch context, theme, viewport, back button, settings button, expand/fullscreen, haptics, closing confirmation, or Telegram storage.
  - No backend validation for Telegram init data or session identity.
- **Virality blockers**
  - No exact-test deep links or referral routing from shared results.
  - No Telegram-native result sharing to chats/stories.
  - No Telegram user identity/profile ingestion, even though Mini Apps can receive basic profile info and `photo_url` when allowed.
  - No bot-driven re-entry loop after a share.
- **Product blockers**
  - The game still behaves more like a self-contained app than a Telegram-native social object.
  - Result posters are improving, but the catalog is still too small and not yet tuned for Telegram’s share-heavy environment.
  - The current local feed/API seam is not yet a true editorial/live-ops control surface.

## Implementation Changes
### 1. Telegram Platform Layer
- Add a new `telegram` platform adapter selected from [services.ts](C:\Users\hil\Documents\ilyas\codex\apps\game-web\src\platform\services.ts).
- Expand shared interfaces so runtime can stay platform-neutral:
  - `IPlatform`: launch context, theme/viewport/safe-area, back/settings visibility, expand/fullscreen, haptics, closing confirmation.
  - `IIdentity`: generic `getPlatformProfile()` returning Telegram `id`, names, username, language code, and `photoUrl?`.
  - `IShare`: generic share entrypoints that Telegram can implement as `shareMessage`, `shareToStory`, and Telegram deep-link open.
  - `IStorage`: Telegram DeviceStorage / CloudStorage adapter with browser fallback for unsupported clients.
- Keep Telegram specifics inside the adapter. `GameRuntime` should only consume neutral capabilities like `launchContext`, `platformProfile`, and `shareResult`.

### 2. Bot + Backend Foundation
- Create a real Telegram bot and configure its **Main Mini App** in BotFather.
- Use a production HTTPS host for the Telegram build and define launch routes for:
  - bot profile launch
  - menu button launch
  - direct links with `?startapp=...`
- Add backend endpoints for:
  - init-data verification and Telegram user/session mapping
  - `startapp` resolution into exact test or result remix
  - prepared share message creation for result cards
  - signed story-share payload generation
- Use Telegram profile photo when present; otherwise fall back to monogram/manual art. Do not make photo availability a blocker.

### 3. Telegram-Native Viral Loop
- Make every shared result route back into the exact test/remix state via `startapp`.
- Replace generic share behavior in Telegram builds with:
  - `Share to chat`
  - `Share to story`
  - `Make yours` re-entry loop
- Treat the bot as part of the viral funnel:
  - shared result opens the app to the exact test
  - player lands on the promoted test immediately
  - result page preserves the endless browse layer below
- Ship only the strongest launch catalog in the Telegram branch:
  - 8–12 tests max
  - single-name, pair-name, and strongest poster/photo families first
  - de-emphasize reward coins / collection counters on Telegram surfaces

### 4. Publishability + Quality Bar
- Prepare Main Mini App preview assets for the bot profile and Apps tab:
  - icon
  - localized screenshots / short demo videos
  - short description
  - privacy policy and support URL
- QA the Telegram build across Android, iOS, Desktop, Web A, and Web K:
  - launch from profile/menu/direct link
  - `startapp` routing
  - theme switch / safe area / viewport / fullscreen
  - back/settings buttons
  - persistence / resume / share-return
  - share image parity with the visible result poster
- Add minimum launch telemetry before release:
  - launch source
  - `startapp`
  - test opened
  - result reached
  - share started / share sent
  - return-from-share
  - replay

## Test Plan
- Open from bot profile, menu button, and direct `startapp` link.
- Confirm direct links land on the exact test and not generic home.
- Verify Telegram identity fills name/username and uses `photo_url` when available, with graceful fallback when missing.
- Share a result to a chat and to a story; recipient should reopen into the same test/remix loop.
- Verify theme, safe area, viewport, fullscreen, and back/settings behavior on Telegram Android, iOS, Desktop, Web A, and Web K.
- Confirm the visible poster and the shared artifact are the same image/composition.
- Confirm persistence and share-return do not break the feed-to-result-to-next-test flow.

## Assumptions And Defaults
- Default chosen: **Balanced launch**. Build a publishable Telegram Mini App soon, but not as a shallow wrapper.
- Telegram becomes a **dedicated platform branch**, not just “open the current web build inside Telegram”.
- Do **not** wait for broad AI art before Telegram launch; curated/manual feed thumbnails remain acceptable.
- Do use Telegram profile data and profile photo when available; do not build the Telegram branch around Google identity.
- Telegram Stars / monetization are out of scope for the first launch.
- The closest Telegram equivalent to old Facebook virality is: Main Mini App previews, Apps-tab discoverability, exact-test deep links, native share-to-chat/story, and bot-assisted re-entry.
