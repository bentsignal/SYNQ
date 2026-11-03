#!/usr/bin/env bash
# Claude Code Stop hook: a turn that ends waits on Shawn, and a simulator
# left up while he reads holds 2 to 4 GB of the Mac every worktree (SYNQ's
# and Vera's) shares. If this worktree's simulator is still up, send the
# agent back once to shut it down (the synq-simulator skill, "Shutting
# down"). It also stops phone servers, in any worktree, that the phone
# hasn't loaded from in a day (`scripts/phone.sh sweep`).
set -euo pipefail
input="$(cat)"
root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"
"$root/scripts/phone.sh" sweep >/dev/null 2>&1 || true
# Already sent back once this turn; let it end rather than loop.
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi
grep -Eq '^DEVICE=.+' "$root/.cache/sim/ios" 2>/dev/null || exit 0
reason="This worktree's iOS simulator is still up. Before ending your turn, close it in T3's Device panel (device_close, if it's open there), then run: scripts/sim.sh down. A device you leave up holds memory every other worktree needs while Shawn reads; \`scripts/sim.sh up\` brings it back in about a minute."
printf '{"decision":"block","reason":%s}\n' "$(node -p 'JSON.stringify(process.argv[1])' "$reason")"
