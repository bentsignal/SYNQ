# Shared Packages

Use this folder for small workspace packages extracted from `apps/old` only
after the monorepo move is stable.

Current packages:

- `db`: Drizzle schema, migrations, repositories, and reactive query hooks.
- `audio`: Expo-bound audio duration, metadata, supported file-type, and
  track-number helpers shared by ingest flows.

Planned packages:

- `config`: app constants and environment adapters.
- `std`: generic utilities with no React Native dependency.
- `ui-mobile`: reusable React Native UI primitives.
- `features`: feature-level code shared between old and new apps only when the
  boundary is genuinely stable.
