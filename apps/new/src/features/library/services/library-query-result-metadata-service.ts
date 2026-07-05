export const getQueryResultErrors = (errors: unknown[]) =>
  errors.filter(Boolean);

export const getQueryResultUpdatedAt = (
  updatedAtValues: (Date | null | undefined)[],
) =>
  Math.max(
    0,
    ...updatedAtValues.map((updatedAt) => updatedAt?.getTime() ?? 0),
  );
