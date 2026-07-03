# Rewrite Tracking

Use this folder for detailed rewrite tracking. Start with
`/Users/shawn/dev/projects/SYNQ/REWRITE_PLAN.md` for the high-level map.

## Structure

Each phase folder has the same shape:

- `completed.md`: verified work that has landed on `rewrite-2`.
- `todo.md`: actionable remaining work.
- `notes.md`: context, decisions, risks, and audit evidence.

The previous long-running backlog was archived rather than deleted:

- `archive/legacy-rewrite-backlog.md`

## Update Rules

- Keep `REWRITE_PLAN.md` short enough to scan.
- Put detailed task lists in phase `todo.md` files.
- Move finished work into the matching `completed.md` after a verified commit.
- Add exact commands, smoke evidence, and parity risks to `notes.md`.
- Do not use the archive as active tracking.

