import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: { default: "SYNQ", template: "%s · SYNQ" },
  icons: { icon: "/icon.png", apple: "/icon.png" },
} satisfies Metadata;

export const viewport = {
  themeColor: "#141414",
  viewportFit: "cover",
} satisfies Viewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* The layout stays mounted between pages, so the page rises in once
            on load and later navigations swap instantly. */}
        <div className="enter">{children}</div>
      </body>
    </html>
  );
}
