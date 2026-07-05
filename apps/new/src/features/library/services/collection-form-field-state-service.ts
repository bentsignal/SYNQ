import type { CollectionFormKind } from "./collection-form-domain-service";

export const getCollectionFormImageLabel = (kind: CollectionFormKind) =>
  kind === "artist" ? "Profile image" : "Cover image";

export const getSavedCollectionFormImageLabel = (
  kind: CollectionFormKind,
) => `Saved ${getCollectionFormImageLabel(kind).toLowerCase()}`;

export const getCollectionFormFieldState = (kind: CollectionFormKind) => {
  const showsYear = kind === "album";

  return {
    artistNamesPlaceholder: "Artist names",
    artistNamesReturnKeyType: "done",
    nameReturnKeyType: showsYear ? "next" : "done",
    showsArtistNames: kind === "album",
    showsYear,
    yearPlaceholder: "Album year",
    yearReturnKeyType: "done",
  } as const;
};
