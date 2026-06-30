# SYNQ Rewrite Backlog

This branch uses `apps/old` as the runnable reference app and `apps/new` as the
rewrite target. Keep old working while moving behavior into smaller, typed,
feature-oriented packages.

## Current Verification

- `pnpm install` succeeds for the workspace.
- `pnpm lint` succeeds through Turbo with warnings only.
- `pnpm --filter @synq/old exec expo export --platform ios --output-dir dist-export-smoke`
  succeeds, proving the old app still bundles from `apps/old`.
- `pnpm --filter @synq/old typecheck` fails on pre-existing strict-null and
  third-party type issues. Treat this as a tracked cleanup lane, not a monorepo
  migration blocker.

## Priority Lanes

1. Stabilize database ownership.
   - Make Drizzle migrations the single schema owner.
   - Retire legacy `Model.createTables()` / manual SQL setup after validating
     backup and restore flows.
   - Audit legacy models for writes to removed columns such as `artists`,
     `album`, `genre`, `fileName`, and `edited`.

2. Build typed repositories and reactive query hooks.
   - Start with songs because they touch player, library, import, edit, and
     queue flows.
   - Add hooks such as `useLibrarySongsQuery`, `useSongRelationsQuery`, and
     `usePlaylistSongsQuery`.
   - Avoid per-row live queries in large lists.

3. Replace event buses.
   - Current buses live under `apps/old/src/events`.
   - Convert one domain at a time to database-backed reactive queries or typed
     domain actions.
   - Good first targets: playlist refresh and song metadata refresh.

4. Split ingest/media.
   - Current checkpoint files: `apps/old/src/hooks/use-ingest.ts`,
     `apps/old/src/lib/ingest.ts`, `apps/old/src/lib/audio-utils.ts`, and
     `apps/old/src/lib/image-utils.ts`.
   - Target packages/folders: `shared/audio`, `shared/db`, and
     `apps/new/src/features/ingest`.
   - Keep Effect at workflow boundaries; keep UI state minimal and observable.

5. Break up global state.
   - `apps/old/src/context/GlobalProvider.js` owns too many concerns.
   - Split into notifications, selections, sheets, ads, and ingest/import state.
   - Prefer typed hooks/stores with narrow ownership.

6. Extract playback orchestration.
   - `apps/old/app/(tabs)/index.tsx` still coordinates player setup, ad timing,
     import entrypoints, and UI.
   - Move playback and ad timing into hooks/services before rebuilding the home
     screen in `apps/new`.

7. Build feature-first app structure.
   - Prefer `features/<domain>/{components,hooks,queries,repository,effects}`.
   - Keep reusable UI in `shared/ui-mobile` only after it is genuinely shared.
   - Avoid moving old code wholesale into shared packages.

## Suggested Agent Tasks

- Worker A: create `shared/db` with Drizzle schema/migration exports and no UI
  dependencies; update `apps/old` imports with minimal path churn.
- Worker B: create song repository/query hooks and convert library songs screen
  away from manual controller refresh.
- Worker C: audit event bus usage and produce a domain-by-domain removal plan
  with exact call sites.
- Worker D: scaffold `apps/new` Expo app after `apps/old` has a committed
  monorepo baseline; do not copy old monolithic components.
- Worker E: fix typecheck by domain, starting with `SongType` nullability and
  player `undefined` handling.

## Guardrails

- Commit after each coherent migration checkpoint.
- Keep `pnpm lint` passing.
- Run an old-app Expo export or native build smoke after path/config changes.
- Do not introduce Convex or Ruby product dependencies.
- Do not remove `apps/old` until `apps/new` has equivalent verified behavior.
