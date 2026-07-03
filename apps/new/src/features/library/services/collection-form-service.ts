export type CollectionFormKind = "album" | "artist" | "playlist";

export const parseAlbumYearInput = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const year = Number(trimmed);

  if (!Number.isInteger(year) || year < 0) {
    throw new Error("Album year must be a positive whole number.");
  }

  return year;
};

export const getCollectionFormErrorMessage = ({
  caughtError,
  fallbackMessage,
}: {
  caughtError: unknown;
  fallbackMessage: string;
}) => (caughtError instanceof Error ? caughtError.message : fallbackMessage);

type CollectionFormOperation = "create" | "update";
export const getCollectionFormFallbackMessage = ({
  kind,
  operation,
}: {
  kind: CollectionFormKind;
  operation: CollectionFormOperation;
}) => {
  const noun = `${kind[0]?.toUpperCase() ?? ""}${kind.slice(1)}`;
  const verb = operation === "create" ? "created" : "updated";

  return `${noun} could not be ${verb}.`;
};
