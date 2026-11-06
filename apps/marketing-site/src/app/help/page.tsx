import type { Metadata } from "next";

import { Footer } from "~/components/footer";
import { HomeLink } from "~/components/home-link";

export const metadata = {
  title: "Help",
  description: "Get help with SYNQ by email.",
} satisfies Metadata;

export default function Help() {
  return (
    <div className="home">
      <main className="intro">
        <h1 className="visually-hidden">Help</h1>
        <HomeLink />
        <a className="store" href="mailto:help@bentsignal.com">
          help@bentsignal.com
        </a>
      </main>
      <Footer page="help" />
    </div>
  );
}
