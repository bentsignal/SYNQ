import {
  assertCanUpdatePlaylist,
  getOptionalCollectionCoverUpdate,
  getOptionalCollectionProfileImageUpdate,
  getUniqueCollectionUpdateName,
} from "./collection-update-step-repository";

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
  assertCanUpdatePlaylist({
    id,
    isProtectedPlaylistId: dependencies.isProtectedPlaylistId,
  });

  const cleanName = await getUniqueCollectionUpdateName({
    dependencies,
    id,
    kind: "playlist",
    name,
  });

  await dependencies.updatePlaylistRow({
    ...(await getOptionalCollectionCoverUpdate({ coverImage, dependencies })),
    id,
    name: cleanName,
  });

  return {
    id,
    name: cleanName,
  };
}
