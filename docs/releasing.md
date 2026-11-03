# Releasing SYNQ

Merging to `main` ships nothing. Shawn decides when to release, and asks for
each step by name.

| Step | Who | How |
| --- | --- | --- |
| Store build | Agent | The commands below, from a clean `main` |
| App Store metadata | Shawn, or an agent he asks | App Store Connect (app `6624313712`) |
| Submit for review | Only when Shawn says so | App Store Connect, or the API |
| Over-the-air update | Only when Shawn says so | `eas update --channel production` |

## Store build

From a clean `main`, with release Xcode, under the heavy-work lock:

```sh
cd apps/mobile
source ~/.appstoreconnect/vera.env
export PATH="/opt/homebrew/bin:$HOME/.rbenv/shims:$PATH"
export DEVELOPER_DIR=/Applications/Xcode-27.app/Contents/Developer
../../scripts/bench/with-lock.sh eas build -p ios --profile production \
  --local --non-interactive --output /tmp/synq-production.ipa
xcrun altool --upload-app -f /tmp/synq-production.ipa -t ios \
  --apiKey "$EXPO_ASC_KEY_ID" --apiIssuer "$EXPO_ASC_ISSUER_ID"
```

EAS keeps the build number (`appVersionSource: remote`) and raises it on each
build. A build that fails after that leaves a gap, which is harmless. Tag what
was uploaded and push the tag:

```sh
git tag -a mobile/build/<n> -m "commit: $(git rev-parse HEAD)"
git push origin mobile/build/<n>
```

If signing fails, `eas credentials -p ios` manages the certificate and profile.
The team's one valid distribution certificate is shared with Shawn's other apps,
so never revoke or delete one.

## Versions and over-the-air updates

`version` in `app.config.ts` is the marketing version. An update reaches only
binaries with the same `RUNTIME_VERSION`; raise it only when the JavaScript
needs native code older binaries lack.

## The App Store version

An App Store version is created once per marketing version, with the release
type set to manual so nothing goes live on approval until Shawn releases it.
`docs/rewrite.md` → Launch day lists what happens once 3.0 is live.

## Website

`apps/site` is the static site at [synq.bentsignal.com](https://synq.bentsignal.com),
behind the App Store's marketing, support (`/help`) and privacy (`/privacy`) links.
It has no build step, and pushes don't deploy it. Deploy it by hand:

```sh
cd apps/site
vercel deploy --prod --yes --scope bsx-sh
```

Update its privacy policy whenever what the app collects changes.

## Design files

[design-assets.md](design-assets.md) says where the App Store art and its sources live.
