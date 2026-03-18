# Platform Strategy

This document is the durable answer to:

- what the game is right now
- how it compares to the NameTests-style target
- what remains before Android release
- what remains before later Facebook Instant and YouTube Playables versions

If a future session needs to know "what is still missing?", start here.

## Executive Verdict

The project is a strong local prototype, not yet a professional publishable product.

Android-first is still the correct platform order.

Current readiness by engineering judgment:

- local gameplay prototype: strong
- Google Play Android release: partial
- Facebook Instant release: early
- YouTube Playables release: early-to-partial

## Current State Of The Game

### What Is Already Good

- the core loop exists end to end: choose a test, enter names, run the reveal, get a result, replay, and share
- the game already has progression systems that fit the genre: unlocks, daily feature, daily reward, result collection, and event flavor
- the content system is data-driven, which is the correct architecture for a NameTests-style product
- the home surface is now much closer to the correct genre shape: bright, editorial, feed-first, and thumbnail-led
- the game now supports multi-language presentation across the supported selector locales
- the discovery feed now has a real API seam instead of being only a front-end mock
- the project has a clear platform abstraction package, even though not all adapters are finished yet
- the browser build is functional and production-buildable, though still too large for comfort
- workspace typecheck, unit tests, and content validation pass

### What Is Still Structurally Weak

- the Capacitor adapter now has real native-capable storage, share, and lifecycle behavior, but it is still not a full production Android integration
- the Facebook Instant adapter is still mostly a stub
- the Android shell now has first-pass branding resources and launch theming, but it is still not a release-ready shell
- automated QA is not release-grade yet
- the current content catalog is still MVP-sized rather than category-leading
- translation quality is still implementation-grade rather than release-grade
- the new discovery-feed API is a real backend seam, but not yet a full live-ops/content-management system

### Concrete Repo Facts To Remember

- `apps/game-web/src/platform/services.ts` now selects a platform service bundle for browser, Android, or Facebook
- `apps/game-web/src/GameRuntime.ts` now consumes platform interfaces instead of hardcoded browser adapters
- `apps/game-web/src/GameRuntime.ts` also now owns locale-aware copy resolution and paginated discovery-feed loading
- `packages/platform-sdk/src/capacitor/index.ts` now uses Capacitor platform detection, Preferences-backed storage, a native share path with browser fallback, and Android lifecycle/back-button hooks
- `apps/game-web/src/platform/installLifecycle.ts` now binds platform lifecycle behavior to the Phaser game at startup
- `apps/android-shell/android/app/src/main/res` now contains strings, colors, themes, splash background, and adaptive icon resources
- `apps/discovery-feed-api` now exists as a local backend workspace serving paginated feed payloads
- `packages/backend-contracts/src/discoveryFeed.schema.ts` defines the shared feed payload shape
- `packages/platform-sdk/src/facebookInstant/index.ts` currently returns no-op or placeholder behavior for storage, share, analytics, and ads
- `apps/android-shell` contains the shell package, manifest, Capacitor config, and Gradle config, but those are still minimal
- `tests/e2e` exists, but the current browser QA story is still thin and some expectations can drift as scenes evolve

## Comparison To The NameTests Target

This project is intentionally original, but it is trying to match the product strength of the old NameTests / social viral-test pattern.

### Where The Current Game Already Matches The Right Shape

- fast casual "type two names and reveal something dramatic" loop
- personalized result output
- share-card generation
- content-driven test catalog
- replayability and collection hooks
- white browse-first discovery surface with thread-like cards and curiosity-led headlines
- multilingual presentation foundation

### Where The Current Game Still Falls Short

- NameTests-style products use stronger platform-native personalization; this project still relies on manual text entry only
- NameTests-style products make sharing a native viral loop; this project still has Android-native edge cases and no Facebook-native viral surface yet
- NameTests-style products win on catalog size and result variety; this project only has a small starter catalog today
- NameTests-style products are tuned through real analytics and content iteration; this project still has placeholder analytics
- NameTests-style products have clearer public trust and privacy messaging than the project currently exposes
- NameTests-style products use very high-volume editorial content operations; this project only has the first backend seam, not the full live-content system

### Important Product Rule

The game should stay inspired by NameTests, not become a literal copy.

That means:

- keep the emotional cadence and product logic
- do not copy branding
- do not copy trade dress too closely
- do not copy exact copywriting patterns
- do not ship assets or UI that could confuse players about authorship

This matters for every platform, especially for trust, review, and intellectual property safety.

## Android-First Strategy

Android is still the best first shipping target.

Why:

- the current game already behaves like a self-contained app more than a social-platform-native product
- the Capacitor shell already exists
- Android lets the team validate retention, content appeal, and packaging quality before building deeper social-platform integrations

### What Is Already In Place For Android

- `apps/android-shell` exists
- Capacitor Android dependencies are installed
- the package id and namespace are set
- the Android shell targets SDK 35
- the web build output is already pointed at the Android shell
- the Android shell is now a complete Gradle project that Android Studio can sync and run on a real phone

### What Is Still Missing Before Google Play Release

- deeper native lifecycle handling beyond the current pause/resume/back baseline
- final Android-native share reliability across real targets such as WhatsApp
- hardened persistence expectations for the Android wrapper beyond the current Preferences baseline
- Android-specific QA on real devices
- deeper icon/splash polish, release metadata, privacy materials, and store listing assets
- release signing and a repeatable ship pipeline
- real ads and analytics decisions for production
- crash / ANR monitoring

## Facebook Instant Strategy

Facebook Instant remains a later platform target.

The future Facebook implementation should mainly land in:

- `packages/platform-sdk/src/facebookInstant`

### What A Real Facebook Version Would Need

- real SDK initialization flow
- real player identity access
- locale handling
- profile picture support where appropriate
- platform-native share / update surfaces
- persistent storage
- analytics wiring
- rewarded and interstitial ad support if the product keeps those surfaces
- backend validation for any competitive or monetized features

### Current Facebook Status

- the codebase has the right interface seams
- the real Facebook adapter work has not started in earnest yet

## YouTube Playables Strategy

YouTube Playables is a valid future target, but it should be treated as a dedicated platform build, not just "upload the web game".

### Why The Current Codebase Is Promising

- the game is HTML5-based already
- the core loop is simple enough to fit Playables expectations

### Why The Current Codebase Is Not Yet Playables-Ready

- the game does not yet integrate the YouTube Playables SDK
- the current persistence path is browser local storage, not a Playables save-data path
- the current share-centric result flow would need a Playables-safe variant
- the code still assumes browser APIs in multiple places
- external network, analytics, and monetization behaviors would need platform gating

## Platform-Specific Reality Checks

### Google Play

Remember these practical realities:

- target API compliance must stay current
- content rating, target audience, privacy policy, store listing assets, and release metadata must be completed before launch
- if the Play Console account is a new personal account created after November 13, 2023, closed testing rules apply before production release

### Facebook Instant

Treat Facebook-specific requirements carefully because platform details can move over time.

The codebase should stay ready for:

- SDK boot integration
- player identity and locale
- native social surfaces
- platform storage
- ad hooks

### YouTube Playables

Treat YouTube as a strict certification target.

A future Playables build must support:

- platform SDK readiness calls
- platform save/load
- pause/resume handling
- aspect-ratio-safe layout
- no disallowed share or external-link behavior
- no unsupported monetization path

## Cross-Platform Engineering Gaps

These are the most important engineering tasks that still remain regardless of platform.

### 1. Runtime Platform Injection

This was the single most important missing engineering piece, and the foundation is now in place.

The runtime can now resolve platform services through a shared selector, but the adapter implementations still need to become real production integrations for:

- storage
- share
- analytics
- ads
- platform identity
- locale
- config

The remaining work is no longer "invent the architecture". It is now "finish the actual adapters and platform-specific behavior".

### 2. QA And Automation

Current QA is good enough for local iteration, not for shipping.

What remains:

- stronger unit coverage around progression and share payload behavior
- E2E coverage for the actual current scene flow
- regression tests for replay, persistence, unlocks, reward flow, discovery-feed selection behavior, locale switching, and share-card generation
- Android lifecycle QA
- certification-style checks for later platforms

### 3. Product Depth

The current content set proves the concept, but it does not yet prove long-term retention.

What remains:

- more tests
- more result bands where needed
- more result variants where repetition is obvious
- better copy polish
- better event rotation
- better progression pacing
- stronger feed freshness and ranking behavior
- more editorial card diversity and seasonal/live content cadence

### 4. Measurement And Live Tuning

The project still lacks the tuning loop needed for a product in this genre.

What remains:

- real analytics
- shared event schema discipline
- conversion and retention instrumentation
- feature flags / balance tuning strategy
- a practical content iteration workflow

### 5. Localization Maturity

The game now supports multiple locales in code, but localization still needs to become release-grade.

What remains:

- native-speaker review
- terminology consistency pass
- line-length / overflow QA across devices
- localized content operations for future live-feed updates

## What Still Needs To Be Implemented

This is the durable backlog view.

### Foundation Work

- finish the new platform-injection foundation by making all platform adapters conform to the same real production expectations
- remove browser-only assumptions from flows that will later run inside Android, Facebook Instant, or YouTube Playables
- separate platform-safe behavior for share, ads, and persistence
- keep the shared feed contract, API workspace, and runtime fetch path aligned as the discovery surface grows

### Android Release Work

- continue expanding the real Capacitor platform behavior now that storage/share/lifecycle wiring exists
- verify back button, pause/resume, and background behavior on real Android hardware
- return to WhatsApp/native-share debugging after the current gameplay/UI pass
- continue refining icons, splash assets, app theme polish, and release signing process
- prepare privacy policy, target audience, content rating, and store listing assets
- run closed testing if the account type requires it
- test on real Android hardware
- add production analytics and crash monitoring

### Current Android QA Status

- Android Studio can now sync the shell and launch the app on a real phone
- the old home-screen scroll bug was reproduced on-device and then fixed
- the home surface was then redesigned into a white editorial feed
- the newest QA issues shifted toward feed interaction details rather than shell bootstrap

### Product Work Before Shipping

- continue fixing short-height and edge-case layout issues
- keep polishing the white editorial home/feed until it fully sells the genre
- expand the content catalog meaningfully beyond the current starter set
- reduce result repetition
- strengthen the result-card and replay loop until retention feels real
- improve feed ranking, feed freshness, and live-content controls beyond the local API baseline
- validate that share, replay, and progression feel satisfying on repeat sessions
- validate localization quality and layout quality across supported locales

### Facebook Instant Work Later

- implement the real Facebook adapter
- support platform identity, locale, share surfaces, storage, and ads
- verify the current Meta onboarding / platform path before committing schedule time
- add any backend verification needed for social or monetized features

### YouTube Playables Work Later

- create a dedicated Playables build target
- integrate the Playables SDK correctly
- replace browser local storage with Playables save/load behavior
- remove any disallowed in-game share or external-link behaviors
- ensure monetization behavior is Playables-compliant
- certify the UI across aspect ratios and resize cases

## Recommended Implementation Order

Use this order unless product strategy changes:

1. finish local UX and content polish until the browser build is genuinely fun
2. finish the adapter-level work that builds on the new platform injection path
3. finish Android shell hardening and Google Play readiness
4. launch Android and learn from real metrics
5. only then begin a Facebook Instant branch or a YouTube Playables branch

## Current Best Next Step

The immediate next engineering step is now:

- run and fix full on-device gameplay QA issues across the feed, thread selection, reading, result, replay, share, back-button, background/resume, persistence, and locale-switching flows

The next strategic step after that is:

- deepen the Android-native layer beyond the current storage/share/lifecycle baseline, while also maturing the new feed/live-content path

## External Research Notes

This document is also based on platform and reference-product research gathered during analysis.

Important references:

- NameTests FAQ: `https://www.socialsweethearts.de/ntfaq-en`
- Social Sweethearts about page: `https://socialsweethearts.de/about-us`
- Google Play target API requirement: `https://support.google.com/googleplay/android-developer/answer/11926878?hl=en`
- Google Play testing requirement for new personal accounts: `https://support.google.com/googleplay/android-developer/answer/14151465?hl=en`
- Google Play content rating: `https://support.google.com/googleplay/android-developer/answer/9859655?hl=en`
- Google Play store assets: `https://support.google.com/googleplay/android-developer/answer/9866151?hl=en`
- Google Play store listing best practices: `https://support.google.com/googleplay/android-developer/answer/13393723?hl=en`
- YouTube Playables certification docs: `https://developers.google.com/youtube/gaming/playables/certification/requirements`
- YouTube Playables design requirements: `https://developers.google.com/youtube/gaming/playables/certification/requirements_design`
- YouTube Playables integration requirements: `https://developers.google.com/youtube/gaming/playables/certification/requirements_integration`
- YouTube Playables privacy/data requirements: `https://developers.google.com/youtube/gaming/playables/certification/requirements_privacydata`
- YouTube Playables monetization requirements: `https://developers.google.com/youtube/gaming/playables/certification/requirements_monetization`
- YouTube Playables stability requirements: `https://developers.google.com/youtube/gaming/playables/certification/requirements_stability`
- YouTube Playables localization requirements: `https://developers.google.com/youtube/gaming/playables/certification/requirements_i18n_l10n`
- YouTube Playables trust and safety requirements: `https://developers.google.com/youtube/gaming/playables/certification/requirements_trustsafety`
- Google Play Instant checklist noting the end of new publishing: `https://developer.android.com/topic/google-play-instant/instant-play-games-checklist`
- Meta official sample repo for FB Instant: `https://github.com/fbsamples/fbinstant-samples`

### Confidence Note

Google Play and YouTube points above were checked against official docs during analysis.

Facebook Instant details are based on:

- the current repo structure
- the NameTests FAQ
- Meta's official archived sample repo

That means the Facebook-specific guidance here is a strong engineering inference, but it should still be re-verified against the live Meta ecosystem before implementation starts.
