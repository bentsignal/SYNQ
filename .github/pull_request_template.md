## Summary

<!-- What changed and why, in a few sentences. Note any decisions you made on Shawn's behalf. -->

<!-- Fixing a GitHub issue? Add "Fixes #<issue>" (one line per issue). -->

## Evidence

<!-- Screenshots (before/after for UI changes) and videos for motion, from scripts/evidence.sh. Never commit them. -->

## Testing

<!-- What you exercised in the simulator, and the checks you ran. Anything that touches the library or preferences: how a 2.5.2 install upgrades (docs/rewrite.md → Migrating a 2.5.2 install). -->

- [ ] `pnpm run lint`
- [ ] `pnpm run typecheck`
- [ ] `pnpm run test`
- [ ] `pnpm run react-doctor --base origin/main` (app changes)

## Release notes

- 2.5.2 data: <!-- untouched / migrated: how this PR keeps every 2.5.2 user's library, settings, and icon (docs/rewrite.md) -->
- Native change: <!-- no / yes, compatible: native code changed, but binaries without it still run this JavaScript (any new native feature is optional and checked for), so updates keep reaching them and it ships in the next store build / yes, new runtime: this JavaScript needs native code older binaries lack, so this raises RUNTIME_VERSION in apps/mobile/app.config.ts and they stop getting updates until they install a store build. CI labels native changes "📱 Native Change". -->
