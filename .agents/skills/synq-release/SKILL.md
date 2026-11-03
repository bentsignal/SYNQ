---
name: synq-release
description: Run a SYNQ store build, upload it to App Store Connect, or prepare an App Store version. Use when Shawn asks to cut a build, release, put a build in App Store Connect or TestFlight, or submit to the App Store.
---

# Release SYNQ

Follow [docs/releasing.md](../../../docs/releasing.md).

- Do only the step Shawn named. A build isn't a submission, and neither is an
  over-the-air update.
- Build from a clean `main`, and check the IPA before uploading: bundle ID
  `com.directedbyshawn.synq`, the expected version and build number, channel
  `production`, runtime matching `RUNTIME_VERSION`.
- Never submit for review, release a version, or take products off sale unless
  Shawn asks for that by name in this thread.
- Report the build number and tag, and anything that didn't work.
