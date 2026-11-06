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
        <Link href="/">
          <img
            className="icon"
            src="/icon.png"
            alt="SYNQ"
            width={112}
            height={112}
          />
        </Link>
        <h1 className="plain">Help</h1>
        <p className="line">
          Questions, bugs and ideas all go to the same inbox.
        </p>
        <a className="store" href="mailto:help@bentsignal.com">
          Email help@bentsignal.com
        </a>
      </main>
      <Footer
        links={[
          { href: "/", label: "SYNQ" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
    </div>
  );
}
