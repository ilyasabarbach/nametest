# Save Data

The local game currently stores progress in browser local storage.

## Where The Keys Live

See:

- `packages/core/src/utils/storage.ts`

## What Is Stored

The most important stored value right now is player progress.

That includes:

- sessions played
- streak
- daily reward claim date
- unlocked tests
- reward coins
- collected result keys
- favorite result key

## Where Loading Happens

Progress is loaded in:

- `apps/game-web/src/GameRuntime.ts`

## Important Behavior

- If storage is missing or invalid, the game falls back to a clean progress object
- Progress is persisted when session state updates
- Daily reward logic is applied during runtime initialization

## Future Considerations

When Android publishing or cloud save work begins, this document should be updated with:

- migration rules
- versioning rules
- fallback behavior between local and remote data
