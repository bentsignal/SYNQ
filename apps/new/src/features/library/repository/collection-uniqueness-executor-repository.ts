import {
  getCollectionDuplicateNameMessage,
  type CollectionMetadataKind,
} from "../services/collection-metadata-service";

export type UniqueCollectionNameParams = {
  excludeId?: number;
  kind: CollectionMetadataKind;
  name: string;
};

export type CollectionUniquenessDependencies = {
  hasMatchingAlbumName: (params: {
    excludeId?: number;
    name: string;
  }) => Promise<boolean>;
  hasMatchingArtistName: (params: {
    excludeId?: number;
    name: string;
  }) => Promise<boolean>;
  hasMatchingPlaylistName: (params: {
    excludeId?: number;
    name: string;
  }) => Promise<boolean>;
};

const hasMatchingCollectionName = async (
  {
    excludeId,
    kind,
    name,
  }: UniqueCollectionNameParams,
  dependencies: CollectionUniquenessDependencies,
) => {
  switch (kind) {
    case "album":
      return dependencies.hasMatchingAlbumName({ excludeId, name });
    case "artist":
      return dependencies.hasMatchingArtistName({ excludeId, name });
    case "playlist":
      return dependencies.hasMatchingPlaylistName({ excludeId, name });
  }
};

export const assertUniqueCollectionNameWithDependencies = async (
  params: UniqueCollectionNameParams,
  dependencies: CollectionUniquenessDependencies,
) => {
  if (await hasMatchingCollectionName(params, dependencies)) {
    throw new Error(getCollectionDuplicateNameMessage(params.kind));
  }
};
