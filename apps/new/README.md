# SYNQ New App

This package is the target for the rewrite. Keep `apps/old` runnable as the
reference implementation while rebuilding features here behind cleaner feature,
state, database, and UI boundaries.

Routes should stay thin. Put screens, components, hooks, and service boundaries
under `src/features/<feature-name>` so each feature can be ported from
`apps/old` without spreading rewrite logic through the router.
