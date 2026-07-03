import { assertCollectionName } from "../services/collection-metadata-service";

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

const assertCreatedCollectionId = ({
  id,
  kind,
}: {
  id: number | null;
  kind: "Album" | "Artist" | "Playlist";
}) => {
  if (!id) {
    throw new Error(`${kind} could not be created.`);
  }

  return id;
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
  const cleanName = assertCollectionName({ kind: "album", name });

  await dependencies.assertUniqueCollectionName({
    kind: "album",
    name: cleanName,
  });

  const id = assertCreatedCollectionId({
    id: await dependencies.insertAlbumRow({
      coverImage: await dependencies.saveCoverImage(coverImage),
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
  const cleanName = assertCollectionName({ kind: "artist", name });

  await dependencies.assertUniqueCollectionName({
    kind: "artist",
    name: cleanName,
  });

  const id = assertCreatedCollectionId({
    id: await dependencies.insertArtistRow({
      ...(profileImage !== undefined
        ? { profileImage: await dependencies.saveCoverImage(profileImage) }
        : {}),
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
  const cleanName = assertCollectionName({ kind: "playlist", name });

  await dependencies.assertUniqueCollectionName({
    kind: "playlist",
    name: cleanName,
  });

  const id = assertCreatedCollectionId({
    id: await dependencies.insertPlaylistRow({
      coverImage: await dependencies.saveCoverImage(coverImage),
      name: cleanName,
    }),
    kind: "Playlist",
  });

  return {
    id,
    name: cleanName,
  };
}
