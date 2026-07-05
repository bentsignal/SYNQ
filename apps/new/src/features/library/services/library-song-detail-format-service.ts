export const formatLibrarySongDetailCount = (
  count: number,
  singular: string,
  plural = `${singular}s`,
) => `${count} ${count === 1 ? singular : plural}`;

export const formatLibrarySongDetailNames = (names: string[]) =>
  names.length === 0
    ? "Unknown"
    : [...names].sort((first, second) => first.localeCompare(second)).join(", ");

export const uniqueLibrarySongDetailRowsById = <T extends { id: number }>(
  rows: T[],
) => {
  const map = new Map<number, T>();
  rows.forEach((row) => {
    map.set(row.id, row);
  });

  return Array.from(map.values());
};
