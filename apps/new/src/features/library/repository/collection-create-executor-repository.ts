import {
  assertCreatedCollectionId,
  getOptionalCollectionProfileImageCreate,
  getRequiredCollectionCoverCreate,
  getUniqueCollectionCreateName,
} from "./collection-create-step-repository";

export type CollectionCreateDependencies = {
  assertUniqueCollectionName: (params: {
    kind: "album" | "artist" | "playlist";
    name: string;
  }) => Promise<void>;
  insertAlbumRow: (params: {
    coverImage: string | null;
    name: string;
    year?: number;
  }) => Promise<number | null>;
  insertArtistRow: (params: {
    name: string;
    profileImage?: string | null;
  }) => Promise<number | null>;
  insertPlaylistRow: (params: {
    coverImage: string | null;
    name: string;
  }) => Promise<number | null>;
  saveCoverImage: (coverImage?: string | null) => Promise<string | null>;
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
  dependencies: CollectionCreateDependencies,
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
