# Development

SYNQ is an offline music player for iOS. The plan is [rewrite.md](rewrite.md); how agents work here
is in [AGENTS.md](../AGENTS.md).

## Workspace

- `apps/mobile` (`@synq/mobile`): the Expo app. See its [README](../apps/mobile/README.md).
- `apps/site` (`@synq/site`): the website, a static Next.js export (`pnpm -F @synq/site dev`).
- `packages/db` (`@synq/db`): the library database and the 2.5.2 importer.
- `packages/audio` (`@synq/audio`): native playback.
- `tooling/{eslint,prettier,typescript,github}`: shared config, from Vera.
- `scripts/`: the simulator (`sim.sh`, and `simq.ts`, the simulator queue shared with Vera), the
  phone dev client (`phone.sh`), PR evidence (`evidence.sh`), and the heavy-work lock
  (`bench/with-lock.sh`).

## Commands

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm run react-doctor --base origin/main
pnpm perf               # Reassure render timings
scripts/sim.sh up       # this worktree's simulator (see the synq-simulator skill)
scripts/phone.sh up     # SYNQ Dev on Shawn's phone
```

Node 24 (`.nvmrc`) and pnpm 10.32.1.
