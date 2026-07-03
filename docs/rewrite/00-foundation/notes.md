# Foundation Notes

- `apps/old` is the reference app; do not delete it until final parity audit is
  complete.
- `apps/new` is the rewrite target.
- `pnpm verify:rewrite` is the checkpoint gate and includes typecheck, lint,
  hygiene scans, deterministic smoke, and old/new iOS export smokes.
- `favicon.ico` has repeatedly appeared as an unrelated untracked file and
  should not be staged unless the user explicitly asks.

