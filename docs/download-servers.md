# Download servers

Download sends a link to a server the person runs themselves, and imports the
audio files it sends back. SYNQ doesn't host, name, or recommend a server, and
knows nothing about where a server gets its files. Everything after the link is
the server's business.

## Builds

Download exists only where `EXPO_PUBLIC_DOWNLOADS=1` at bundle time: SYNQ Dev
(`scripts/lib/metro.sh`) and the `development` and `internal` EAS profiles.
**Store builds leave it out**, and CI fails if its code reaches their bundle.

The flag has to stay a literal `process.env.EXPO_PUBLIC_DOWNLOADS === "1"`, which
Metro folds at build time. Never turn it into a runtime switch or remote flag:
dormant features in a store binary break App Review guideline 2.5.19.

Putting Download in a store build is Shawn's decision, and means adding the flag
to the `production` profile and describing the feature specifically in that
version's Notes for Review (guideline 2.3.1), including that it downloads audio
from links through a server the person runs. Guideline 5.2.3 restricts
downloading media from third-party sources, so expect App Review to ask.

## The app's side

- Addresses are preferences (`synq.downloadServers` in `preferences.db`). Tokens
  are in the Keychain, because `preferences.db` is under `Documents/`, which the
  Files app shows. Neither touches the library, so a 2.5.2 install upgrades
  through this with nothing to migrate.
- Servers need HTTPS or a local network address (App Transport Security).
- Songs go through the ordinary import queue, so a server's files are read like
  any others and must carry their own tags and artwork.
- Downloads run while the app is in front and resume when it returns
  (`features/download/engine.ts`). In-progress downloads are saved in
  `synq.downloads`.
- Everything a server sends is checked (`contract.ts`), and it can't choose a
  file's path or type.

## API, version 1

Every request has `Authorization: Bearer <token>`. An error is
`{ "error": { "code", "message" } }` with a message written to be shown.

| Request                                      | Response                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `GET /v1/me`                                 | `{ api, name, limits: { maxTracks }, token: { name, dailyLimit, usedToday } }` |
| `POST /v1/downloads` with `{ "url" }`        | 202 and a job                                                             |
| `GET /v1/downloads/:id`                      | A job                                                                     |
| `DELETE /v1/downloads/:id`                   | Cancels it                                                                |
| `GET /v1/downloads/:id/tracks/:trackId/file` | The audio, with tags and artwork inside; 404 until the track is `ready`   |
| `DELETE /v1/downloads/:id/tracks/:trackId`   | The phone has it, so the server can delete it. Returns the job            |

A job:

```json
{
  "id": "…",
  "state": "resolving | running | done | failed",
  "title": "…",
  "error": { "code": "…", "message": "…" },
  "tracks": [
    {
      "id": "…",
      "state": "queued | working | ready | delivered | failed",
      "title": "…",
      "artist": "…",
      "album": "…",
      "fileName": "…",
      "mimeType": "…",
      "error": "…"
    }
  ]
}
```

Anything but `id` and `state` may be null. The app takes songs in order, and
acknowledges each, which is what lets a server limit how far ahead it works.
