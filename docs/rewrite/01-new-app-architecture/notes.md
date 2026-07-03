# New App Architecture Notes

- Prefer feature-first modules over file-type buckets.
- Prefer pure services plus deterministic smoke where behavior can be tested
  without native APIs.
- Leave native bridge, Expo filesystem, and audio APIs behind small services so
  bundling/export smokes can verify integration.
- Repeated component styling can be temporarily shared as primitives, but the
  longer-term styling target is utility classes with lint enforcement.

