import {
  getOptionalCollectionCoverUpdate,
  getUniqueCollectionUpdateName,
  type CollectionUpdateImageDependencies,
  type CollectionUpdateNameDependencies,
} from "./collection-update-step-repository";

export type AlbumUpdateDependencies = CollectionUpdateNameDependencies &
  CollectionUpdateImageDependencies & {
    replaceAlbumArtists: (params: {
      albumId: number;
      artistNames: string;
    }) => Promise<void>;
    updateAlbumRow: (params: {
      coverImage?: string | null;
      id: number;
      name: string;
      year?: number | null;
    }) => Promise<void>;
  };

export async function updateAlbumWithDependencies(
  {
    artistNames,
    coverImage,
    id,
    name,
    year,
  }: {
    artistNames?: string;
    coverImage?: string | null;
    id: number;
    name: string;
    year?: number | null;
  },
  dependencies: AlbumUpdateDependencies,
) {
  const cleanName = await getUniqueCollectionUpdateName({
    dependencies,
    id,
    kind: "album",
    name,
  });

  await dependencies.updateAlbumRow({
    ...(await getOptionalCollectionCoverUpdate({ coverImage, dependencies })),
    id,
    name: cleanName,
    year,
  });

  if (artistNames !== undefined) {
    await dependencies.replaceAlbumArtists({ albumId: id, artistNames });
  }

  return {
    id,
    name: cleanName,
    year,
  };
}
