export type CollectionMetadataKind = "album" | "artist" | "playlist";

export const normalizeCollectionName = (name: string) => name.trim();

export const getCollectionRequiredNameMessage = (
  kind: CollectionMetadataKind,
) => {
  switch (kind) {
    case "album":
      return "Album name is required.";
    case "artist":
      return "Artist name is required.";
    case "playlist":
      return "Playlist name is required.";
  }
};

export const getCollectionDuplicateNameMessage = (
  kind: CollectionMetadataKind,
) => {
  const article = kind === "playlist" ? "A" : "An";

  return `${article} ${kind} with this name already exists.`;
};

export const assertCollectionName = ({
  kind,
  name,
}: {
  kind: CollectionMetadataKind;
  name: string;
}) => {
  const cleanName = normalizeCollectionName(name);

  if (!cleanName) {
    throw new Error(getCollectionRequiredNameMessage(kind));
  }

  return cleanName;
};
