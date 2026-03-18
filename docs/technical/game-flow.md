# Game Flow

This file explains the runtime flow from startup to result.

## Startup

1. `apps/game-web/src/main.ts` calls `createGame()`
2. `createGame()` builds the Phaser instance
3. Phaser registers scenes
4. `BootScene` starts `PreloadScene`
5. `PreloadScene` calls `runtime.init()`

## What `runtime.init()` Does

`apps/game-web/src/GameRuntime.ts` is the main orchestration layer.

It:

- loads fallback or configured remote config
- loads stored progress from browser storage
- claims the daily reward if needed
- computes the daily featured test
- computes unlocked tests
- creates the initial session

This means the scenes do not need to know how remote config or progress loading works.

## Home Screen

`HomeScene` shows:

- current selected test
- daily featured test
- active event
- streak count
- session count
- reward coins
- collection count
- available and locked tests

The actual form and buttons are built using `showHomeOverlay()`, which is a DOM overlay.

## Running A Test

After the player enters names:

1. names are sanitized and validated
2. `runtime.startSession()` creates a session for the selected test
3. `TestScene` plays a multi-step reveal sequence themed by the selected test
4. the reveal can be skipped with a tap/click for faster repeat sessions
5. `runtime.completeSession()` runs the logic

## What `runtime.completeSession()` Does

It delegates to `GameFlow.runSession()` in `packages/core`.

That flow:

- runs the scoring formula
- selects the matching result band
- updates streak/session progress
- updates unlocked test ids
- adds the result key to the collection

## Result Screen

`ResultScene` reads the finished session and builds a result card.

That card includes:

- headline
- body
- score
- insight
- signature
- accent color

The result screen supports:

- replay
- share
- secret reading

## Share Flow

The share button:

1. builds a branded image with `buildShareCard()`
2. builds a share payload from game state
3. passes both to the browser share adapter

If file sharing is not available, the browser adapter falls back to text copy and image download.

## Secret Reading Flow

The reward scene simulates a rewarded unlock.

Current behavior:

- reward availability is stubbed
- browser reward returns success
- result is presented as an upgraded secret-reading variant

This is good enough for local gameplay testing, but it will need real ad integration later.
