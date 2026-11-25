import type { Metadata } from "next";

import { HomeLink } from "~/components/home-link";

export const metadata = {
  title: "Privacy Policy",
} satisfies Metadata;

export default function Privacy() {
  return (
    <main className="page">
      <HomeLink />
      <h1>Privacy Policy</h1>
      <p className="date">Effective November 2026, for SYNQ 3.0 and later</p>

      <h2>Your music stays on your iPhone</h2>
      <p>
        Your songs, artwork, playlists and settings are stored on your device.
        SYNQ has no accounts and never uploads your library. Backups and exports
        are files you create and choose where to keep.
      </p>

      <h2>Wi-Fi Transfer</h2>
      <p>
        Wi-Fi Transfer runs a small web server on your iPhone while you use it,
        so a computer on the same network can send it files. Those files go
        directly between the two devices.
      </p>

      <h2>Analytics</h2>
      <p>
        SYNQ doesn&apos;t collect analytics or usage data, and doesn&apos;t
        track you across other apps or websites.
      </p>

      <h2>App updates</h2>
      <p>
        SYNQ checks Expo&apos;s update service for fixes when it opens, which
        shares your IP address with that service.
      </p>

      <h2>Earlier versions</h2>
      <p>
        Versions before 3.0 also used RevenueCat for purchases and the Facebook
        SDK. SYNQ 3.0 removes both. Until November 2026, SYNQ also sent usage
        events to PostHog, an analytics service: features used, such as starting
        an import, with a random ID that isn&apos;t tied to your name or Apple
        ID. They never included your song titles, file names or music.
      </p>

      <h2>Deleting your data</h2>
      <p>
        Deleting the app removes your library and its settings from your iPhone.
        To ask about usage data earlier versions sent, email us.
      </p>

      <h2>Children</h2>
      <p>
        SYNQ isn&apos;t directed at children under 13, and we don&apos;t
        knowingly collect their personal information.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the new version will be posted on this page with
        a new date.
      </p>

      <h2>Contact</h2>
      <p>
        Shawn Rodgers,{" "}
        <a href="mailto:help@bentsignal.com">help@bentsignal.com</a>
      </p>
    </main>
  );
}
