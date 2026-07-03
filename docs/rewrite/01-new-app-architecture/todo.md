# New App Architecture Todo

- [ ] Continue slimming remaining large hooks, providers, screens, and services.
- [ ] Keep moving route/copy/action/status state out of UI components and into
  focused feature services.
- [ ] Continue extracting repository boundaries where UI hooks still import
  database schema or broad mutation services directly.
- [ ] Keep import/save orchestration moving toward small command, reducer,
  filesystem, and repository services.
- [ ] Keep playback queue/player synchronization small enough to reason about.
- [ ] Keep collection list helpers aligned with the song query/helper pattern.

