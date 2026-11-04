# Download servers

Download sends a link to a server and imports the audio files it sends back.
SYNQ doesn't host, name, or recommend a server. Everything after the link is the
server's business.

## The app's side

- A server is one address. A private server can require a token in the query,
  such as `https://example.com/?token=abc`. The app keeps the query on every
  request and never shows the address unless asked.
- Addresses are in the Keychain, because `preferences.db` is under `Documents/`,
  which the Files app shows. Names are preferences (`synq.downloadServerNames`).
  Neither touches the library, so a 2.5.2 install upgrades through this with
  nothing to migrate.
- Servers need HTTPS or a local network address (App Transport Security).
- Songs go through the ordinary import queue, so a server's files are read like
  any others and must carry their own tags and artwork.
- Downloads run while the app is in front and resume when it returns
  (`features/download/engine.ts`). In-progress downloads are saved in
  `synq.downloads`.
- Everything a server sends is checked (`contract.ts`), and it can't choose a
  file's path or type.
- A binary without the feature's native modules doesn't show it
  (`features/download/feature.ts`), so an update can still reach it.

## API, version 1

Paths go after the address's own path, before its query. An error is
`{ "error": { "code", "message" } }` with a message written to be shown.

| Request                                      | Response                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `GET /v1/server`                             | `{ api, name, usage: { dailyLimit, usedToday } }`; `usage` is optional  |
| `POST /v1/downloads` with `{ "url" }`        | 202 and a job                                                           |
| `GET /v1/downloads/:id`                      | A job                                                                   |
| `DELETE /v1/downloads/:id`                   | Cancels it                                                              |
| `GET /v1/downloads/:id/tracks/:trackId/file` | The audio, with tags and artwork inside; 404 until the track is `ready` |
| `DELETE /v1/downloads/:id/tracks/:trackId`   | The phone has it, so the server can delete it. Returns the job          |

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
