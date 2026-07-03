# SYNQ Rewrite Plan

This is the slim control panel for the rewrite. Detailed tracking lives under
`docs/rewrite/`; the old one-file backlog is preserved at
`docs/rewrite/archive/legacy-rewrite-backlog.md`.

## Current Status

- Branch: `rewrite-2`
- Checkpoint discipline: commit after each verified slice.
- Required gate: `pnpm verify:rewrite`
- Current strategy: keep `apps/old` runnable as the reference while `apps/new`
  moves toward feature-first modules, reactive state, slimmer components, and
  verified parity.

## Finish Line

- [ ] `apps/old` remains runnable until final parity is proven.
- [ ] `apps/new` implements import, library, collection, playback, backup,
  premium, and settings flows with feature-first modules.
- [ ] High-traffic state uses reactive Drizzle queries, reducers, typed hooks,
  or Rostra stores instead of event emitters, broad React context, direct
  storage calls, or screen-local orchestration.
- [ ] UI components are slim and mostly presentation-focused.
- [x] Styling uses configured utility classes instead of local `StyleSheet`
  objects, with hygiene enforcement blocking regressions in `apps/new`.
- [ ] Deterministic smoke coverage exists for import, save-to-library, playback
  queue/ad gate, library edits, backup, and final parity-sensitive behavior.
- [ ] `pnpm verify:rewrite` passes, including old/new mobile export smokes.
- [ ] A final parity audit against `apps/old` has no blocking gaps.

## Phase Map

| Phase | Status | Tracking |
| --- | --- | --- |
| Foundation and monorepo | Mostly done | `docs/rewrite/00-foundation/` |
| New app architecture | In progress | `docs/rewrite/01-new-app-architecture/` |
| Feature parity | In progress | `docs/rewrite/02-feature-parity/` |
| Performance and state | In progress | `docs/rewrite/03-performance-and-state/` |
| Quality and release | In progress | `docs/rewrite/04-quality-and-release/` |

## Next Best Work

1. Continue slimming mixed-responsibility feature services and UI components.
2. Continue extracting repository boundaries where UI hooks still import
   database schema or broad mutation services directly.
3. Expand deterministic smoke around behavior moved out of screens/hooks.
4. Start deeper old/new parity audits for import, library editing, playback,
   backup, premium, and settings.
5. Keep committing and pushing after each verified checkpoint.
