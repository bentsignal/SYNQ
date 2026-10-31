#!/usr/bin/env bash
# Runs when T3 Code creates a worktree (t3.json): installs dependencies and
# makes sure a plain `git push` can't push into the base branch.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
# A new branch can inherit its base as upstream; a plain `git push` must
# never push into the base branch.
branch="$(git branch --show-current)"
upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
if [ -n "$branch" ] && [ -n "$upstream" ] && [ "$upstream" != "origin/$branch" ]; then
  git branch --unset-upstream
  echo "cleared upstream $upstream; push with: git push -u origin HEAD"
fi

pnpm install --frozen-lockfile
