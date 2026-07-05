import {
  assertCreatedCollectionId,
  getOptionalCollectionProfileImageCreate,
  getUniqueCollectionCreateName,
  type CollectionCreateImageDependencies,
  type CollectionCreateNameDependencies,
} from "./collection-create-step-repository";

export type ArtistCreateDependencies = CollectionCreateNameDependencies &
  CollectionCreateImageDependencies & {
    insertArtistRow: (params: {
      name: string;
      profileImage?: string | null;
    }) => Promise<number | null>;
  };

export async function createArtistWithDependencies(
  {
    name,
    profileImage,
  }: {
    name: string;
    profileImage?: string | null;
  },
  dependencies: ArtistCreateDependencies,
) {
  const cleanName = await getUniqueCollectionCreateName({
    dependencies,
    kind: "artist",
    name,
  });

  const id = assertCreatedCollectionId({
    id: await dependencies.insertArtistRow({
      ...(await getOptionalCollectionProfileImageCreate({
        dependencies,
        profileImage,
      })),
      name: cleanName,
    }),
    kind: "Artist",
  });

  return {
    id,
    name: cleanName,
  };
}
