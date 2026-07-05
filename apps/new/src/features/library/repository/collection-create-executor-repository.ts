import {
  createAlbumWithDependencies,
  type AlbumCreateDependencies,
} from "./album-create-executor-repository";
import {
  assertCreatedCollectionId,
  getOptionalCollectionProfileImageCreate,
  getRequiredCollectionCoverCreate,
  getUniqueCollectionCreateName,
} from "./collection-create-step-repository";

export type CollectionCreateDependencies = AlbumCreateDependencies & {
  assertUniqueCollectionName: (params: {
    kind: "album" | "artist" | "playlist";
    name: string;
  }) => Promise<void>;
  insertArtistRow: (params: {
    name: string;
    profileImage?: string | null;
  }) => Promise<number | null>;
  insertPlaylistRow: (params: {
    coverImage: string | null;
    name: string;
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
  dependencies: CollectionCreateDependencies,
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

export async function createPlaylistWithDependencies(
  {
    coverImage,
    name,
  }: {
    coverImage?: string | null;
    name: string;
  },
  dependencies: CollectionCreateDependencies,
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

export { createAlbumWithDependencies, type AlbumCreateDependencies };
