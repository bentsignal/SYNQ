import type { CollectionFormKind } from "./collection-form-service";

export type EditCollectionFormCopy = {
  editLabel: string;
  kicker: string;
  namePlaceholder: string;
  title: string;
};

export type CreateCollectionFormCopy = {
  createLabel: string;
  duplicateNoun: string;
  kicker: string;
  namePlaceholder: string;
  title: string;
};

export const getCreateCollectionFormCopy = (
  kind: CollectionFormKind,
): CreateCollectionFormCopy => {
  switch (kind) {
    case "album":
      return {
        createLabel: "Create album",
        duplicateNoun: "album",
        kicker: "Album",
        namePlaceholder: "Album name",
        title: "Create album",
      };
    case "artist":
      return {
        createLabel: "Create artist",
        duplicateNoun: "artist",
        kicker: "Artist",
        namePlaceholder: "Artist name",
        title: "Create artist",
      };
    case "playlist":
      return {
        createLabel: "Create playlist",
        duplicateNoun: "playlist",
        kicker: "Playlist",
        namePlaceholder: "Playlist name",
        title: "Create playlist",
      };
  }
};

export const getCreateCollectionFormSubtitle = ({
  duplicateNoun,
}: {
  duplicateNoun: string;
}) =>
  `Name the ${duplicateNoun}, choose optional artwork, and start organizing your music.`;

export const getEditCollectionFormSubtitle = () =>
  "Update the name, artwork, and details shown across your library.";

export const getEditCollectionFormCopy = (
  kind: CollectionFormKind,
): EditCollectionFormCopy => {
  switch (kind) {
    case "album":
      return {
        editLabel: "Save album",
        kicker: "Album",
        namePlaceholder: "Album name",
        title: "Edit album",
      };
    case "artist":
      return {
        editLabel: "Save artist",
        kicker: "Artist",
        namePlaceholder: "Artist name",
        title: "Edit artist",
      };
    case "playlist":
      return {
        editLabel: "Save playlist",
        kicker: "Playlist",
        namePlaceholder: "Playlist name",
        title: "Edit playlist",
      };
  }
};

export const getCollectionFormPreviewInitial = ({
  fallback,
  name,
}: {
  fallback: string;
  name: string;
}) => name.trim().slice(0, 1).toUpperCase() || fallback;

export const getCollectionFormSaveLabel = ({
  defaultLabel,
  isSaving,
  savingLabel,
}: {
  defaultLabel: string;
  isSaving: boolean;
  savingLabel: string;
}) => (isSaving ? savingLabel : defaultLabel);

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

export const getCollectionFormActionState = ({
  isMissing = false,
  isSaving,
  name,
}: {
  isMissing?: boolean;
  isSaving: boolean;
  name: string;
}) => {
  const hasName = name.trim().length > 0;
  const canEdit = !isSaving && !isMissing;
  const canSave = hasName && canEdit;

  return {
    canEdit,
    canPickImage: canEdit,
    canSave,
    hasName,
  };
};

export type CollectionFormActionState = ReturnType<
  typeof getCollectionFormActionState
>;
