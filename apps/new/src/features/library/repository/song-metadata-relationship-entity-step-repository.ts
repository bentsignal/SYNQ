export type SongMetadataRelationshipEntityDependencies = {
  findIdByName: (name: string) => Promise<number | null>;
  insert: (name: string) => Promise<number>;
};

export const ensureSongMetadataRelationshipEntity = async (
  name: string,
  dependencies: SongMetadataRelationshipEntityDependencies,
) => {
  const cleanName = name.trim();
  const existingId = await dependencies.findIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insert(cleanName);
};
