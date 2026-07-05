import {
  assertCanUpdatePlaylist,
  getOptionalCollectionCoverUpdate,
  getUniqueCollectionUpdateName,
  type CollectionUpdateImageDependencies,
  type CollectionUpdateNameDependencies,
} from "./collection-update-step-repository";

export type PlaylistUpdateDependencies = CollectionUpdateNameDependencies &
  CollectionUpdateImageDependencies & {
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
