# Local Development

This is the simplest guide for running and changing the project.

## Important Rule

Run install commands from the project root, not from `apps/game-web`.

Correct:

```bash
cd C:\Users\hil\Documents\ilyas\codex
corepack pnpm install
corepack pnpm dev
```

Incorrect:

```bash
cd apps/game-web
npm install
```

That fails because the app depends on local workspace packages.

## Main Commands

From the root:

```bash
corepack pnpm install
corepack pnpm dev
npm run dev:feed-api
npm run typecheck
npm run test
npm run validate:content
npm run build
```

If you want the web app to consume the local discovery-feed API instead of the in-app fallback, run the feed API and set:

```bash
VITE_DISCOVERY_FEED_URL=http://localhost:8787/api/discovery-feed
```

For the Android-only optional Google profile-photo flow, also set:

```bash
VITE_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

That enables the `Use Google photo` action on image-backed result posters such as `past-life-echo`.

For Telegram-targeted local builds, also set:

```bash
VITE_TARGET_PLATFORM=telegram
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
VITE_TELEGRAM_MINI_APP_SHORT_NAME=your_mini_app_short_name
VITE_TELEGRAM_INIT_VERIFY_URL=http://localhost:8787/api/telegram/init-verify
VITE_TELEGRAM_STARTAPP_RESOLVE_URL=http://localhost:8787/api/telegram/startapp-resolve
VITE_TELEGRAM_SHARE_URL=http://localhost:8787/api/telegram/share-result
```

If you want to test Telegram story-share media URLs against a public host later, also set:

```bash
VITE_TELEGRAM_PUBLIC_BASE_URL=https://your-public-host.example
```

## Android Device Run

Once the web build changes and you want to test on a real Android phone:

```bash
cd C:\Users\hil\Documents\ilyas\codex
npm run build --workspace @nametests/game-web

cd C:\Users\hil\Documents\ilyas\codex\apps\android-shell
corepack pnpm exec cap sync android
```

Then open:

- `C:\Users\hil\Documents\ilyas\codex\apps\android-shell\android`

in Android Studio and run the `app` configuration on the connected device.

## Telegram Local Run

If you want to exercise the Telegram branch in a browser-first way before using a real bot/webview:

```bash
cd C:\Users\hil\Documents\ilyas\codex
$env:VITE_TARGET_PLATFORM="telegram"
$env:VITE_TELEGRAM_BOT_USERNAME="your_bot_username"
$env:VITE_TELEGRAM_MINI_APP_SHORT_NAME="your_mini_app_short_name"
$env:VITE_TELEGRAM_INIT_VERIFY_URL="http://localhost:8787/api/telegram/init-verify"
$env:VITE_TELEGRAM_STARTAPP_RESOLVE_URL="http://localhost:8787/api/telegram/startapp-resolve"
$env:VITE_TELEGRAM_SHARE_URL="http://localhost:8787/api/telegram/share-result"
corepack pnpm dev
```

That will not fully emulate Telegram native buttons or init data, but it is enough to test the Telegram code path, backend contracts, and `startapp` routing logic.

For real Telegram testing, deploy the web build and API to a public HTTPS host, configure the bot in BotFather, and open the Mini App from Telegram itself.

## Discovery Feed API

The project now includes a small local API workspace for paginated discovery-feed responses:

```bash
cd C:\Users\hil\Documents\ilyas\codex
npm run dev:feed-api
```

Useful endpoints:

- `http://localhost:8787/health`
- `http://localhost:8787/api/discovery-feed?locale=en`
- `http://localhost:8787/api/discovery-feed?locale=fr&cursor=8`

Telegram-specific endpoints now also exist:

- `http://localhost:8787/api/telegram/init-verify`
- `http://localhost:8787/api/telegram/startapp-resolve?startapp=...`
- `http://localhost:8787/api/telegram/share-result`

For live Telegram verification, the backend also needs:

```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_MINI_APP_SHORT_NAME=your_mini_app_short_name
TELEGRAM_STARTAPP_SECRET=your-local-signing-secret
TELEGRAM_PUBLIC_BASE_URL=https://your-public-host.example
```

Current project values for your setup:

```bash
VITE_TELEGRAM_BOT_USERNAME=cosmikmatch_bot
VITE_TELEGRAM_MINI_APP_SHORT_NAME=cosmic_match
TELEGRAM_BOT_USERNAME=cosmikmatch_bot
TELEGRAM_MINI_APP_SHORT_NAME=cosmic_match
```

Without the bot token and a public HTTPS host, the Telegram branch can still be exercised locally, but init verification and story-share behavior will stay partial/fallback.

## What To Edit For Common Tasks

### Add a new test

- add a JSON file in `packages/content-packs/src/tests`
- register it in `packages/content-packs/src/index.ts`
- add labels in `packages/content-packs/src/copy/en/tests.json`
- add result text in `packages/content-packs/src/copy/en/results.json`
- update manifest if needed

### Change gameplay rules

- edit `packages/core`

### Change UI

- edit `apps/game-web/src/scenes`
- edit `apps/game-web/src/ui`
- edit `apps/game-web/src/styles/main.css`

### Change discovery feed behavior

- edit `apps/discovery-feed-api/src/index.ts` for local API behavior
- edit `packages/backend-contracts/src/discoveryFeed.schema.ts` for feed payload shape
- edit `packages/content-packs/src/discovery/*` for feed content and fallback generation
- edit `apps/game-web/src/GameRuntime.ts` for feed fetching / pagination behavior

### Change localization

- edit `packages/content-packs/src/copy/*`
- keep supported locales aligned across feed UI, game copy, and share-card text

### Change runtime boot behavior

- edit `apps/game-web/src/GameRuntime.ts`

### Change Telegram platform behavior

- edit `packages/platform-sdk/src/telegram/index.ts`
- edit `packages/backend-contracts/src/telegram.schema.ts`
- edit `apps/discovery-feed-api/src/index.ts`
- edit `apps/game-web/src/platform/services.ts`
- edit `apps/game-web/src/platform/installLifecycle.ts`

## Local Testing Checklist

- home screen loads
- full-screen layout looks correct without browser zoom
- home/feed feels bright, readable, and browse-first
- thread tap promotes the chosen story into the top landing surface reliably
- tapping a thread from the bottom of the feed scrolls back to the top and refreshes the landing surface cleanly
- short-height windows do not feel cramped or awkward
- on Android, the home screen fits comfortably and the feed remains usable
- locale switching updates home, reveal, result, reward, and share-card copy
- test selection works
- all tests are visible and playable from the feed by default
- progress survives refresh
- reveal flow can be skipped and still lands on a valid result screen
- Android back button behaves correctly
- app pause/resume behaves correctly on-device
- result share opens the native Android share flow
- share card is generated
- if `VITE_GOOGLE_WEB_CLIENT_ID` is configured, `past-life-echo` can import the user's Google profile photo and place it into the result poster
- local feed API pagination works if `VITE_DISCOVERY_FEED_URL` is configured
- if `VITE_TARGET_PLATFORM=telegram`, launch context should be readable, native Telegram back/settings buttons should map into the same runtime behavior, and prepared result shares should resolve into `startapp` deep links instead of generic home
- if `TELEGRAM_BOT_TOKEN` and the Telegram URLs are configured, valid init data should verify and exact-test `startapp` links should promote the linked test immediately
- if `VITE_TELEGRAM_PUBLIC_BASE_URL` and `TELEGRAM_PUBLIC_BASE_URL` are configured against a public HTTPS host, Telegram `Share to story` should become available and use the same visible poster as the result page
- no obvious console errors
