export type LibraryHomeStatusState = {
  hasErrors: boolean;
  isError: boolean;
  statusLabel: string;
};

export const getLibraryHomeQueryErrors = ({
  collectionErrors,
  songError,
  summaryErrors,
}: {
  collectionErrors: readonly unknown[];
  songError: unknown;
  summaryErrors: readonly unknown[];
}) => [
  ...summaryErrors,
  ...collectionErrors,
  ...(songError ? [songError] : []),
];

export const getLibraryHomeStatusState = ({
  collectionUpdatedAt,
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  songUpdatedAt,
  summaryUpdatedAt,
}: {
  collectionUpdatedAt: number;
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  songUpdatedAt: number;
  summaryUpdatedAt: number;
}): LibraryHomeStatusState => {
  const hasErrors = errors.length > 0;
  const latestUpdate = Math.max(
    summaryUpdatedAt,
    collectionUpdatedAt,
    songUpdatedAt,
  );

  return {
    hasErrors,
    isError: hasErrors,
    statusLabel: hasErrors
      ? "One or more library queries failed."
      : latestUpdate > 0
        ? `Updated ${formatUpdatedAt(latestUpdate)}`
        : "Waiting for library data",
  };
};
