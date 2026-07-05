import {
  assertCreatedCollectionId,
  getRequiredCollectionCoverCreate,
  getUniqueCollectionCreateName,
  type CollectionCreateImageDependencies,
  type CollectionCreateNameDependencies,
} from "./collection-create-step-repository";

export type PlaylistCreateDependencies = CollectionCreateNameDependencies &
  CollectionCreateImageDependencies & {
    insertPlaylistRow: (params: {
      coverImage: string | null;
      name: string;
    }) => Promise<number | null>;
  };

export async function createPlaylistWithDependencies(
  {
    coverImage,
    name,
  }: {
    coverImage?: string | null;
    name: string;
  },
  dependencies: PlaylistCreateDependencies,
) {
  const cleanName = await getUniqueCollectionCreateName({
    dependencies,
    kind: "playlist",
    name,
  });

  const id = assertCreatedCollectionId({
    id: await dependencies.insertPlaylistRow({
      coverImage: await getRequiredCollectionCoverCreate({
        coverImage,
        dependencies,
      }),
      name: cleanName,
    }),
    kind: "Playlist",
  });

  return {
    id,
    name: cleanName,
  };
}
