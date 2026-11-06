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
        The App Store version of SYNQ sends usage events to PostHog, an
        analytics service. These include:
      </p>
      <ul>
        <li>
          features used, such as starting an import or an export, and opening
          the app
        </li>
        <li>
          how many songs an import added, and the theme or app icon chosen
        </li>
        <li>
          a random ID created by the app, which isn&apos;t tied to your name or
          Apple ID
        </li>
        <li>device and app details, such as the iOS version and app version</li>
        <li>your IP address, as part of any connection to the service</li>
      </ul>
      <p>
        They never include your song titles, file names or music. We use them to
        see how the app is used and to improve it. We don&apos;t sell this data
        or use it for advertising, and SYNQ doesn&apos;t track you across other
        apps or websites.
      </p>

      <h2>App updates</h2>
      <p>
        SYNQ checks Expo&apos;s update service for fixes when it opens, which
        shares your IP address with that service.
      </p>

      <h2>Earlier versions</h2>
      <p>
        Versions before 3.0 also used RevenueCat for purchases and the Facebook
        SDK. SYNQ 3.0 removes both.
      </p>

      <h2>Deleting your data</h2>
      <p>
        Deleting the app removes your library and its settings from your iPhone.
        To ask about analytics data, email us.
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
