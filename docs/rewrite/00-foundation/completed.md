# Foundation Completed

- Created `rewrite-2` from the completed rewrite checkpoint.
- Migrated the repo into a Turborepo workspace with `apps/*`, `shared/*`, and
  shared tooling.
- Preserved `apps/old` as the runnable reference implementation.
- Created `apps/new` as the rewrite target.
- Extracted shared database ownership into `shared/db`.
- Extracted reusable audio and metadata helpers into `shared/audio`.
- Added the normal verification gate: `pnpm verify:rewrite`.
- Kept old/new iOS export smokes in the rewrite verifier.

