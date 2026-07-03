# Quality And Release Notes

- The full rewrite gate is intentionally heavier than focused checks because it
  protects old/new mobile export behavior.
- Focused checks are useful during a slice, but a checkpoint is not complete
  until `pnpm verify:rewrite` passes.
- Record any intentionally skipped verification in the relevant phase notes.

