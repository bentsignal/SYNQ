import type { CollectionFormKind } from "./collection-form-domain-service";

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
