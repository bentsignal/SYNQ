import type { NextConfig } from "next";

/**
 * The site is static: `next build` writes plain HTML, CSS, and JavaScript to
 * `out/`, which Vercel serves as files (docs/releasing.md → Website).
 */
const config: NextConfig = {
  output: "export",
  reactCompiler: true,
  images: { unoptimized: true },
  experimental: {
    // A stale build cache in `.next` made later builds panic ("ModuleGraph
    // ... was canceled"). The site builds in about a second without it.
    turbopackFileSystemCacheForBuild: false,
  },
};

export default config;
