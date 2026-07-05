export type AddCollectionSongsStatusState = {
  isError: boolean;
  statusLabel: string;
  updatedLabel: string;
};

export const getAddCollectionSongsUpdatedLabel = ({
  formatTime = (updatedAt) => new Date(updatedAt).toLocaleTimeString(),
  updatedAt,
}: {
  formatTime?: (updatedAt: number) => string;
  updatedAt: number;
}) =>
  updatedAt > 0
    ? `Updated ${formatTime(updatedAt)}`
    : "Waiting for library data";

export const getAddCollectionSongsStatusState = ({
  errors,
  formatTime,
  mutationError,
  updatedAt,
}: {
  errors: readonly unknown[];
  formatTime?: (updatedAt: number) => string;
  mutationError: string | null;
  updatedAt: number;
}): AddCollectionSongsStatusState => {
  const updatedLabel = getAddCollectionSongsUpdatedLabel({
    formatTime,
    updatedAt,
  });

  if (mutationError !== null) {
    return {
      isError: true,
      statusLabel: mutationError,
      updatedLabel,
    };
  }

  if (errors.length > 0) {
    return {
      isError: true,
      statusLabel: "One or more song queries failed.",
      updatedLabel,
    };
  }

  return {
    isError: false,
    statusLabel: updatedLabel,
    updatedLabel,
  };
};
