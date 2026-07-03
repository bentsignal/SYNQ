import { assertCollectionName } from "../services/collection-metadata-service";

type CollectionUpdateBaseDependencies = {
  assertUniqueCollectionName: (params: {
    excludeId: number;
    kind: "album" | "artist" | "playlist";
    name: string;
  }) => Promise<void>;
  saveCoverImage: (coverImage?: string | null) => Promise<string | null>;
};

export type AlbumUpdateDependencies = CollectionUpdateBaseDependencies & {
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

export type ArtistUpdateDependencies = CollectionUpdateBaseDependencies & {
  updateArtistRow: (params: {
    id: number;
    name: string;
    profileImage?: string | null;
  }) => Promise<void>;
};

export type PlaylistUpdateDependencies = CollectionUpdateBaseDependencies & {
  isProtectedPlaylistId: (id: number) => boolean;
  updatePlaylistRow: (params: {
    coverImage?: string | null;
    id: number;
    name: string;
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
  const cleanName = assertCollectionName({ kind: "album", name });

  await dependencies.assertUniqueCollectionName({
    excludeId: id,
    kind: "album",
    name: cleanName,
  });

  await dependencies.updateAlbumRow({
    ...(coverImage !== undefined
      ? { coverImage: await dependencies.saveCoverImage(coverImage) }
      : {}),
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
  const cleanName = assertCollectionName({ kind: "artist", name });

  await dependencies.assertUniqueCollectionName({
    excludeId: id,
    kind: "artist",
    name: cleanName,
  });

  await dependencies.updateArtistRow({
    ...(profileImage !== undefined
      ? { profileImage: await dependencies.saveCoverImage(profileImage) }
      : {}),
    id,
    name: cleanName,
  });

  return {
    id,
    name: cleanName,
  };
}

export async function updatePlaylistWithDependencies(
  {
    coverImage,
    id,
    name,
  }: {
    coverImage?: string | null;
    id: number;
    name: string;
  },
  dependencies: PlaylistUpdateDependencies,
) {
  if (dependencies.isProtectedPlaylistId(id)) {
    throw new Error("This protected playlist cannot be edited.");
  }

  const cleanName = assertCollectionName({ kind: "playlist", name });

  await dependencies.assertUniqueCollectionName({
    excludeId: id,
    kind: "playlist",
    name: cleanName,
  });

  await dependencies.updatePlaylistRow({
    ...(coverImage !== undefined
      ? { coverImage: await dependencies.saveCoverImage(coverImage) }
      : {}),
    id,
    name: cleanName,
  });

  return {
    id,
    name: cleanName,
  };
}
