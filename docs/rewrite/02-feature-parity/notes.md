# Feature Parity Notes

- Treat `apps/old` as the truth source for expected behavior unless a new
  design decision is explicitly documented.
- Parity evidence should be stronger than "tests pass"; record command output,
  manual checks, screenshots, or smoke coverage where appropriate.
- Do not remove old-app behavior until new-app parity is proven.

## Route Audit Evidence

- Old `/import/export` has no direct new route. New import save exposes draft
  export via `use-import-save-export-actions.ts` and `ImportSaveActions.tsx`, so
  this is a step/route-shape parity question rather than obviously missing
  export capability.
- Old `/ingest/*` has no new `apps/new/app/ingest` or
  `apps/new/src/features/ingest` equivalent. Decide whether the old ingest stack
  is obsolete or must be rebuilt into the new import feature.
- Old top-level collection and song routes mostly moved under
  `/(tabs)/library/*`. Treat route-shape changes as acceptable only after each
  linked flow is manually checked from new navigation.
- Old `/album/reorder` has no obvious new route/action. New collection detail
  supports row-level up/down persistence, but there is no dedicated album
  reorder screen.
- Old `/player/edit` exposed active-track options from the player. New player
  has transport controls and a queue link; song edit exists from library song
  detail but active-player edit/options access needs a parity decision.
- New settings privacy/support routes are additional surface, not old-to-new
  gaps. Old support/social actions were inline settings actions.
- Backup and premium have no obvious primary route gaps in the first-pass audit.
