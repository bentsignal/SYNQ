import {
  assertCreatedCollectionId,
  getRequiredCollectionCoverCreate,
  getUniqueCollectionCreateName,
  type CollectionCreateImageDependencies,
  type CollectionCreateNameDependencies,
} from "./collection-create-step-repository";

export type AlbumCreateDependencies = CollectionCreateNameDependencies &
  CollectionCreateImageDependencies & {
    insertAlbumRow: (params: {
      coverImage: string | null;
      name: string;
      year?: number;
    }) => Promise<number | null>;
  };

export async function createAlbumWithDependencies(
  {
    coverImage,
    name,
    year,
  }: {
    coverImage?: string | null;
    name: string;
    year?: number;
  },
  dependencies: AlbumCreateDependencies,
) {
  const cleanName = await getUniqueCollectionCreateName({
    dependencies,
    kind: "album",
    name,
  });

  const id = assertCreatedCollectionId({
    id: await dependencies.insertAlbumRow({
      coverImage: await getRequiredCollectionCoverCreate({
        coverImage,
        dependencies,
      }),
      name: cleanName,
      year,
    }),
    kind: "Album",
  });

  return {
    id,
    name: cleanName,
    year,
  };
}
