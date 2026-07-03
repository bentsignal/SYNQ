# Quality And Release Todo

- [ ] Keep `pnpm verify:rewrite` passing at every checkpoint.
- [ ] Add deterministic smoke coverage whenever behavior moves out of UI or
  native-bound code.
- [x] Add a `StyleSheet.create` lint/hygiene rule after utility styling is
  configured.
- [x] Add a React context hygiene rule after Rostra migration starts.
- [x] Lower rewrite debt audit limits as StyleSheet and context migrations land.
- [ ] Run a final parity audit against `apps/old`.
- [ ] Decide release readiness criteria after parity and performance work land.
