import {
  assertCanUpdatePlaylist,
  getOptionalCollectionCoverUpdate,
  getUniqueCollectionUpdateName,
} from "./collection-update-step-repository";
import {
  updateAlbumWithDependencies,
  type AlbumUpdateDependencies,
} from "./album-update-executor-repository";
import {
  updateArtistWithDependencies,
  type ArtistUpdateDependencies,
} from "./artist-update-executor-repository";

type CollectionUpdateBaseDependencies = {
  assertUniqueCollectionName: (params: {
    excludeId: number;
    kind: "album" | "artist" | "playlist";
    name: string;
  }) => Promise<void>;
  saveCoverImage: (coverImage?: string | null) => Promise<string | null>;
};

export type PlaylistUpdateDependencies = CollectionUpdateBaseDependencies & {
  isProtectedPlaylistId: (id: number) => boolean;
  updatePlaylistRow: (params: {
    coverImage?: string | null;
    id: number;
    name: string;
  }) => Promise<void>;
};

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

export {
  updateAlbumWithDependencies,
  type AlbumUpdateDependencies,
  updateArtistWithDependencies,
  type ArtistUpdateDependencies,
};
