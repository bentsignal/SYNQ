const unknownLabels = new Set(["", "unknown", "unknown artist", "unknown album"]);

export const normalizeSongMetadataRelationshipName = (name: string) =>
  name.trim();

const hasMeaningfulRelationshipName = (name: string) =>
  !unknownLabels.has(normalizeSongMetadataRelationshipName(name).toLowerCase());

export const splitSongMetadataRelationshipNames = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map(normalizeSongMetadataRelationshipName)
        .filter(hasMeaningfulRelationshipName),
    ),
  );
