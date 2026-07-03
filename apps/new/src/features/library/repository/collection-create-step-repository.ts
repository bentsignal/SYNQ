import { assertCollectionName } from "../services/collection-metadata-service";

type CollectionCreateKind = "album" | "artist" | "playlist";
type CreatedCollectionKind = "Album" | "Artist" | "Playlist";

export type CollectionCreateNameDependencies = {
  assertUniqueCollectionName: (params: {
    kind: CollectionCreateKind;
    name: string;
  }) => Promise<void>;
};

export type CollectionCreateImageDependencies = {
  saveCoverImage: (coverImage?: string | null) => Promise<string | null>;
};

export const getUniqueCollectionCreateName = async ({
  dependencies,
  kind,
  name,
}: {
  dependencies: CollectionCreateNameDependencies;
  kind: CollectionCreateKind;
  name: string;
}) => {
  const cleanName = assertCollectionName({ kind, name });

  await dependencies.assertUniqueCollectionName({
    kind,
    name: cleanName,
  });

  return cleanName;
};

export const getRequiredCollectionCoverCreate = ({
  coverImage,
  dependencies,
}: {
  coverImage?: string | null;
  dependencies: CollectionCreateImageDependencies;
}) => dependencies.saveCoverImage(coverImage);

export const getOptionalCollectionProfileImageCreate = async ({
  dependencies,
  profileImage,
}: {
  dependencies: CollectionCreateImageDependencies;
  profileImage?: string | null;
}) =>
  profileImage !== undefined
    ? { profileImage: await dependencies.saveCoverImage(profileImage) }
    : {};

export const assertCreatedCollectionId = ({
  id,
  kind,
}: {
  id: number | null;
  kind: CreatedCollectionKind;
}) => {
  if (!id) {
    throw new Error(`${kind} could not be created.`);
  }

  return id;
};
