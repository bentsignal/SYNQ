export type LibraryCollectionListKind = "albums" | "artists" | "playlists";

export type LibraryCollectionListHref =
  | "/(tabs)/library"
  | "/(tabs)/library/album/create"
  | "/(tabs)/library/artist/create"
  | "/(tabs)/library/playlist/create";

export const getLibraryCollectionListBackHref =
  (): LibraryCollectionListHref => "/(tabs)/library";

export const getLibraryCollectionCreateHref = (
  kind: LibraryCollectionListKind,
): LibraryCollectionListHref => {
  switch (kind) {
    case "albums":
      return "/(tabs)/library/album/create";
    case "artists":
      return "/(tabs)/library/artist/create";
    case "playlists":
    default:
      return "/(tabs)/library/playlist/create";
  }
};

export const getLibraryCollectionListCopy = (
  kind: LibraryCollectionListKind,
) => {
  const shared = {
    backLink: {
      href: getLibraryCollectionListBackHref(),
      label: "Library",
    },
    createLink: {
      href: getLibraryCollectionCreateHref(kind),
      label: "Create",
    },
    kicker: "Library",
  };

  switch (kind) {
    case "albums":
      return {
        ...shared,
        empty: "No albums in library",
        placeholder: "Search albums or artists",
        title: "Albums",
      };
    case "artists":
      return {
        ...shared,
        empty: "No artists in library",
        placeholder: "Search artists",
        title: "Artists",
      };
    case "playlists":
    default:
      return {
        ...shared,
        empty: "No playlists in library",
        placeholder: "Search playlists",
        title: "Playlists",
      };
  }
};

export type LibraryCollectionListCopy = ReturnType<
  typeof getLibraryCollectionListCopy
>;
