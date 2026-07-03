import { assertCollectionName } from "../services/collection-metadata-service";

type CollectionUpdateKind = "album" | "artist" | "playlist";

export type CollectionUpdateNameDependencies = {
  assertUniqueCollectionName: (params: {
    excludeId: number;
    kind: CollectionUpdateKind;
    name: string;
  }) => Promise<void>;
};

export type CollectionUpdateImageDependencies = {
  saveCoverImage: (coverImage?: string | null) => Promise<string | null>;
};

export const getUniqueCollectionUpdateName = async ({
  dependencies,
  id,
  kind,
  name,
}: {
  dependencies: CollectionUpdateNameDependencies;
  id: number;
  kind: CollectionUpdateKind;
  name: string;
}) => {
  const cleanName = assertCollectionName({ kind, name });

  await dependencies.assertUniqueCollectionName({
    excludeId: id,
    kind,
    name: cleanName,
  });

  return cleanName;
};

export const getOptionalCollectionCoverUpdate = async ({
  coverImage,
  dependencies,
}: {
  coverImage?: string | null;
  dependencies: CollectionUpdateImageDependencies;
}) =>
  coverImage !== undefined
    ? { coverImage: await dependencies.saveCoverImage(coverImage) }
    : {};

export const getOptionalCollectionProfileImageUpdate = async ({
  dependencies,
  profileImage,
}: {
  dependencies: CollectionUpdateImageDependencies;
  profileImage?: string | null;
}) =>
  profileImage !== undefined
    ? { profileImage: await dependencies.saveCoverImage(profileImage) }
    : {};

export const assertCanUpdatePlaylist = ({
  id,
  isProtectedPlaylistId,
}: {
  id: number;
  isProtectedPlaylistId: (id: number) => boolean;
}) => {
  if (isProtectedPlaylistId(id)) {
    throw new Error("This protected playlist cannot be edited.");
  }
};
