# Shared Packages

Use this folder for small workspace packages extracted from `apps/old` only
after the monorepo move is stable.

Planned packages:

- `config`: app constants and environment adapters.
- `std`: generic utilities with no React Native dependency.
- `db`: Drizzle schema, migrations, repositories, and reactive query hooks.
- `audio`: media metadata, artwork, duration, and ingest helpers.
- `ui-mobile`: reusable React Native UI primitives.
- `features`: feature-level code shared between old and new apps only when the
  boundary is genuinely stable.
