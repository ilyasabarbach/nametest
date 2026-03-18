# Analytics Plan

Real analytics are not connected yet.

## Current State

The browser analytics adapter logs events to the console only.

See:

- `packages/platform-sdk/src/browser/index.ts`

## Events That Already Exist In Code

- `app_open`
- `test_started`
- `test_completed`
- `reward_prompt_viewed`
- `reward_granted`
- `result_shared`

## Why This Still Matters

Even though analytics are deferred, the event vocabulary already exists.

That means future analytics work can plug into an existing behavior model instead of inventing events from scratch.

## Suggested Future Work

When analytics becomes active, track:

- which tests are played most
- where players drop in the flow
- which results are shared most
- how often rewards are used
- which unlock thresholds feel too slow or too fast
