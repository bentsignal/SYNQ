/**
 * Albums and artists, which match by name. See docs/rewrite.md → Restoring a
 * backup. A backup row with no match becomes a new row only if something
 * needs it; two with the same name become one.
 */
import type { ArtworkKind } from "../library/artwork.ts";
import type { Album, Artist } from "../schema.ts";
import type { MergeIds, PlanFiles } from "./plan-files.ts";
import { NameMatcher } from "../library/matching.ts";
import { cleanName } from "../library/text.ts";

/** Each backup row's matching current row, by name: backup id → current id. */
export function matchNames(
  rows: readonly { id: number; name: string }[],
  currentRows: readonly { id: number; name: string }[],
) {
  const matcher = new NameMatcher(currentRows);
  const targets = new Map<number, number>();
  for (const row of rows) {
    const found = matcher.find(row.name);
    if (found !== undefined) targets.set(row.id, found.id);
  }
  return targets;
}

interface NamedRowsOptions<Row extends Album | Artist> {
  kind: ArtworkKind;
  table: keyof MergeIds;
  rows: readonly Row[];
  currentRows: readonly Row[];
  /** Backup id → current id; gains the new rows' ids. */
  targets: Map<number, number>;
  files: PlanFiles;
  /** Whether a row with no match should exist in the library. */
  isNeeded: (row: Row) => boolean;
  /** A backup row matched `existing`, whose blanks can fill in. */
  onExisting: (row: Row, existing: Row) => void;
  /** What makes two new rows one; by default, their name. */
  identity?: (row: Row) => string;
  /** Another backup row of the same name as a row that's new. */
  onSameName: (row: Row, created: Row) => void;
}

/** Returns the rows that are new. */
export function planNamedRows<Row extends Album | Artist>(
  options: NamedRowsOptions<Row>,
) {
  const { currentRows, files, kind, targets } = options;
  const current = new Map(currentRows.map((row) => [row.id, row]));
  const created = new Map<string, Row>();
  for (const row of options.rows) {
    const existing = current.get(targets.get(row.id) ?? 0);
    if (existing !== undefined) {
      options.onExisting(row, existing);
      continue;
    }
    if (!options.isNeeded(row)) continue;
    const name = options.identity?.(row) ?? cleanName(row.name);
    const same = created.get(name);
    if (same !== undefined) {
      targets.set(row.id, same.id);
      same.artworkVersion ??= files.newCovers(kind, row, same.id);
      options.onSameName(row, same);
      continue;
    }
    const id = files.allocate(options.table, kind);
    targets.set(row.id, id);
    created.set(name, {
      ...row,
      artworkVersion: files.newCovers(kind, row, id),
      id,
    });
  }
  return [...created.values()];
}

/** Rows that join two things, without a pair that's already there. */
export function newPairs<Row, Pair>(
  rows: readonly Row[],
  existing: Iterable<string>,
  toPair: (row: Row) => { key: string; pair: Pair } | null,
) {
  const seen = new Set(existing);
  return rows.flatMap((row) => {
    const result = toPair(row);
    if (result === null || seen.has(result.key)) return [];
    seen.add(result.key);
    return [result.pair];
  });
}

export function pairKey(left: number, right: number) {
  return `${String(left)}:${String(right)}`;
}
