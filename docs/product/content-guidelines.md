# Content Guidelines

This guide is for adding or editing tests.

## Goals

Content should feel:

- flattering
- playful
- screenshot-friendly
- replayable

## Good Content Characteristics

- Results feel specific, even when generated from lightweight logic
- Low-tier results are still fun, not insulting
- High-tier results feel collectible and shareable
- Copy is short enough to read fast on mobile

## Avoid

- Exact imitation of third-party branded games
- Harsh or embarrassing results
- Claims that sound medically, legally, or scientifically real
- Long paragraphs that are hard to scan on a result card

## Test Design Tips

- Give each test a clear fantasy
  Examples: romance, drama, fame, friendship, aura, destiny
- Use strong result-band names
- Add variant insight text so repeated plays feel less identical
- Keep unlock timing meaningful but not frustrating

## Where To Add Content

- new test JSON: `packages/content-packs/src/tests`
- test labels: `packages/content-packs/src/copy/en/tests.json`
- result text: `packages/content-packs/src/copy/en/results.json`
- manifest registration: `packages/content-packs/src/manifests/default.manifest.json`
