export function groupBy<Row>(rows: readonly Row[], key: (row: Row) => number) {
  const groups = new Map<number, Row[]>();
  for (const row of rows) {
    const list = groups.get(key(row));
    if (list === undefined) groups.set(key(row), [row]);
    else list.push(row);
  }
  return groups;
}
