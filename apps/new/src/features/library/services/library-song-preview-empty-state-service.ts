import type { LibrarySongPreviewHref } from "./library-song-preview-navigation-service";

export const getLibrarySongPreviewEmptyState = () => ({
  body: "Import audio files to start building your song library.",
  link: {
    href: "/(tabs)/import" as LibrarySongPreviewHref,
    label: "Import music",
  },
  title: "No songs yet",
});
