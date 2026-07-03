import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";

export type LibraryCollectionListHref =
  | "/(tabs)/library"
  | "/(tabs)/library/albums"
  | "/(tabs)/library/artists"
  | "/(tabs)/library/playlists";

export type LibraryCollectionActionHref =
  | `/(tabs)/library/${LibraryCollectionDetailKind}/add/${number}`
  | `/(tabs)/library/${LibraryCollectionDetailKind}/edit/${number}`;

export const getLibraryCollectionBackHref = (): LibraryCollectionListHref =>
  "/(tabs)/library";

export const getCollectionListHref = (
  kind: LibraryCollectionDetailKind,
): LibraryCollectionListHref => {
  switch (kind) {
    case "album":
      return "/(tabs)/library/albums";
    case "artist":
      return "/(tabs)/library/artists";
    case "playlist":
    default:
      return "/(tabs)/library/playlists";
  }
};

export const getCollectionEditHref = ({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}): LibraryCollectionActionHref => `/(tabs)/library/${kind}/edit/${id}`;

export const getCollectionAddSongsHref = ({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}): LibraryCollectionActionHref => `/(tabs)/library/${kind}/add/${id}`;

export const getLibraryInvalidCollectionState = ({
  kicker = "Library",
}: {
  kicker?: string;
} = {}) => ({
  backLink: {
    href: getLibraryCollectionBackHref(),
    label: "Back to Library",
  },
  body: "This route needs a numeric id.",
  kicker,
  title: "Invalid collection",
});
