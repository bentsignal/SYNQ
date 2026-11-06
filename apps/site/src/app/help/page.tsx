import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "~/components/footer";

export const metadata = {
  title: "Help",
  description: "Get help with SYNQ by email.",
} satisfies Metadata;

export default function Help() {
  return (
    <div className="home">
      <main className="intro">
        <h1 className="visually-hidden">Help</h1>
        <Link className="home-link" href="/">
          <span aria-hidden="true">←</span> Home
        </Link>
        <a className="store" href="mailto:help@bentsignal.com">
          help@bentsignal.com
        </a>
      </main>
      <Footer
        links={[
          { href: "/", label: "Home" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
    </div>
  );
}
