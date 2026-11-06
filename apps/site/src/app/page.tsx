import type { Metadata } from "next";

import { Footer } from "~/components/footer";

export const metadata = {
  description:
    "SYNQ is a music player for iPhone that plays the audio files you own, offline.",
  itunes: { appId: "6624313712" },
} satisfies Metadata;

export default function Home() {
  return (
    <div className="home">
      <main className="intro">
        <h1 className="logo">
          <img
            className="icon"
            src="/icon.png"
            alt="SYNQ"
            width={112}
            height={112}
          />
        </h1>
        <p className="line">
          A music player for the files you own. It works offline, for free, with
          no account and no ads.
        </p>
        <a className="badge" href="https://apps.apple.com/app/id6624313712">
          <img
            src="/app-store-badge.svg"
            alt="Download on the App Store"
            width={150}
            height={50}
          />
        </a>
      </main>
      <Footer
        links={[
          { href: "/help", label: "Help" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
    </div>
  );
}
