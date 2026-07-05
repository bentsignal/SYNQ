import { getLibrarySongDetailBackHref } from "./library-song-navigation-service";

export const getLibraryInvalidSongState = () => ({
  backLink: {
    href: getLibrarySongDetailBackHref(),
    label: "Back to Library",
  },
  body: "This route needs a numeric id.",
  kicker: "Song",
  title: "Invalid song",
});
