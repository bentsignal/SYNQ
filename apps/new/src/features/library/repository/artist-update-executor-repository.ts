import {
  getOptionalCollectionProfileImageUpdate,
  getUniqueCollectionUpdateName,
  type CollectionUpdateImageDependencies,
  type CollectionUpdateNameDependencies,
} from "./collection-update-step-repository";

export type ArtistUpdateDependencies = CollectionUpdateNameDependencies &
  CollectionUpdateImageDependencies & {
    updateArtistRow: (params: {
      id: number;
      name: string;
      profileImage?: string | null;
    }) => Promise<void>;
  };

export async function updateArtistWithDependencies(
  {
    id,
    name,
    profileImage,
  }: {
    id: number;
    name: string;
    profileImage?: string | null;
  },
  dependencies: ArtistUpdateDependencies,
) {
  const cleanName = await getUniqueCollectionUpdateName({
    dependencies,
    id,
    kind: "artist",
    name,
  });

  await dependencies.updateArtistRow({
    ...(await getOptionalCollectionProfileImageUpdate({
      dependencies,
      profileImage,
    })),
    id,
    name: cleanName,
  });

  return {
    id,
    name: cleanName,
  };
}
