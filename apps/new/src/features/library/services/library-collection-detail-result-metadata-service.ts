import {
  getQueryResultErrors,
  getQueryResultUpdatedAt,
} from "./library-query-result-metadata-service";

export const getCollectionDetailResultUpdatedAt = (
  collectionUpdatedAt: Date | null | undefined,
  songsUpdatedAt: Date | null | undefined,
) =>
  getQueryResultUpdatedAt([collectionUpdatedAt, songsUpdatedAt]);

export const getCollectionDetailResultErrors = (
  collectionError: unknown,
  songsError: unknown,
) => getQueryResultErrors([collectionError, songsError]);
