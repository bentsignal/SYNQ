import {
  getQueryResultErrors,
  getQueryResultUpdatedAt,
} from "./library-query-result-metadata-service";

export const getAddableCollectionSongsErrors = ({
  linkedRowsError,
  songRowsError,
}: {
  linkedRowsError: unknown;
  songRowsError: unknown;
}) => getQueryResultErrors([songRowsError, linkedRowsError]);

export const getAddableCollectionSongsUpdatedAt = ({
  linkedRowsUpdatedAt,
  songRowsUpdatedAt,
}: {
  linkedRowsUpdatedAt: Date | null | undefined;
  songRowsUpdatedAt: Date | null | undefined;
}) => getQueryResultUpdatedAt([songRowsUpdatedAt, linkedRowsUpdatedAt]);
