export type CollectionFormKind = "album" | "artist" | "playlist";

export type EditCollectionFormCopy = {
  editLabel: string;
  kicker: string;
  namePlaceholder: string;
  title: string;
};

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

export const parseAlbumYearInput = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const year = Number(trimmed);

  if (!Number.isInteger(year) || year < 0) {
    throw new Error("Album year must be a positive whole number.");
  }

  return year;
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
