/**
 * Find-or-create rules for artists and albums named by imported tags.
 *
 * 2.5.2 matched artists case-sensitively and albums case-insensitively, and
 * split artist tags on every comma. 3.0 matches both case-insensitively
 * (after trimming and collapsing whitespace) so "BTS" and "bts" tags stop
 * forking an artist, but prefers an exact-case match, so the case-variant
 * duplicates some 2.5.2 libraries already have stay separate and keep their
 * songs. Comma splitting keeps 2.5.2's behaviour except that a run of comma
 * pieces naming an existing artist ("Tyler, The Creator") stays one artist.
 */
import { cleanName, nameKey } from "./text.ts";

export interface NamedRow {
  id: number;
  name: string;
}

/** An in-memory index of artist or album names, built once per write. */
export class NameMatcher<T extends NamedRow> {
  readonly #byKey = new Map<string, T[]>();

  constructor(rows: Iterable<T>) {
    for (const row of rows) this.add(row);
  }

  add(row: T): void {
    const key = nameKey(row.name);
    const list = this.#byKey.get(key);
    if (list) {
      list.push(row);
      list.sort((a, b) => a.id - b.id);
    } else {
      this.#byKey.set(key, [row]);
    }
  }

  /** The exact-case match if any, else the oldest case-insensitive match. */
  find(name: string): T | undefined {
    const candidates = this.#byKey.get(nameKey(name));
    if (!candidates) return undefined;
    const exact = cleanName(name);
    return (
      candidates.find((row) => cleanName(row.name) === exact) ?? candidates[0]
    );
  }

  has(name: string): boolean {
    return this.#byKey.has(nameKey(name));
  }

  /** Every row with this name, ignoring case, oldest first. */
  all(name: string): readonly T[] {
    return this.#byKey.get(nameKey(name)) ?? [];
  }
}

/**
 * Splits an artist tag into artist names. The whole tag wins if it names an
 * existing artist; otherwise it splits on commas, greedily re-joining the
 * longest run of pieces that names an existing artist.
 *
 * "Tyler, The Creator, Kali Uchis" with "Tyler, The Creator" known gives
 * ["Tyler, The Creator", "Kali Uchis"]; with nothing known it gives three
 * names, as 2.5.2 did.
 */
export function splitArtistNames(
  tag: string,
  isKnown: (name: string) => boolean,
) {
  const whole = cleanName(tag);
  if (whole === "") return [];
  if (isKnown(whole)) return [whole];
  const pieces = whole
    .split(",")
    .map(cleanName)
    .filter((piece) => piece !== "");
  const names = [];
  let start = 0;
  while (start < pieces.length) {
    let end = pieces.length;
    while (end > start + 1 && !isKnown(pieces.slice(start, end).join(", ")))
      end--;
    names.push(pieces.slice(start, end).join(", "));
    start = end;
  }
  return dedupeNames(names);
}

export function dedupeNames(names: readonly string[]) {
  const seen = new Set<string>();
  const result = [];
  for (const name of names) {
    const key = nameKey(name);
    if (key === "" || seen.has(key)) continue;
    seen.add(key);
    result.push(cleanName(name));
  }
  return result;
}
