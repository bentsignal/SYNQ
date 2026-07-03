export type CollectionKind = "albums" | "artists" | "playlists";

export type LibraryCollectionPreview = {
  detail: string;
  id: number;
  imagePath: string | null;
  kind: CollectionKind;
  meta: string;
  title: string;
};

export type LibraryCollectionPreviewHref =
  | `/(tabs)/library/album/${number}`
  | `/(tabs)/library/artist/${number}`
  | `/(tabs)/library/playlist/${number}`;

export const getLibraryCollectionPreviewHref = (
  collection: Pick<LibraryCollectionPreview, "id" | "kind">,
): LibraryCollectionPreviewHref => {
  switch (collection.kind) {
    case "albums":
      return `/(tabs)/library/album/${collection.id}`;
    case "artists":
      return `/(tabs)/library/artist/${collection.id}`;
    case "playlists":
    default:
      return `/(tabs)/library/playlist/${collection.id}`;
  }
};

export const getLibraryCollectionPreviewEmptyState = () => ({
  body: "Create a playlist, album, or artist once you have songs to organize.",
  title: "No collections yet",
});
