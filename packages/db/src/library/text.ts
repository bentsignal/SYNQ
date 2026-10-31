/**
 * Text comparison for sorting, searching, and name matching.
 *
 * Sorting and search run in JavaScript rather than SQL because SQLite's
 * `NOCASE` and `LOWER()` only fold ASCII: "Édith" would sort after "Zola" and
 * "é" wouldn't find "É". Libraries are thousands of rows at most, so loading
 * a list and sorting it with ICU (Hermes' `Intl.Collator`) is cheap and
 * matches how iOS sorts.
 */

const collator = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
});

/** Locale-aware, case- and accent-insensitive comparison. */
export function compareText(a: string, b: string) {
  return collator.compare(a, b);
}

/** Trimmed, whitespace-collapsed, NFC: how names are stored. */
export function cleanName(name: string) {
  return name.normalize("NFC").trim().replace(/\s+/g, " ");
}

/**
 * The key two names share when they should be treated as the same artist or
 * album: case-insensitive, and blind to spacing around commas so
 * "Tyler,The Creator" matches "Tyler, The Creator".
 */
export function nameKey(name: string) {
  return cleanName(name)
    .replace(/\s*,\s*/g, ", ")
    .toLowerCase();
}

const combiningMarks = /[̀-ͯ]/g;

/** Lowercased, accent-stripped form used for search matching. */
export function searchKey(text: string) {
  return text.normalize("NFD").replace(combiningMarks, "").toLowerCase();
}

/**
 * True when every whitespace-separated term of `query` appears in at least
 * one of `fields` (so "beatles abbey" finds a song by The Beatles on Abbey
 * Road). An empty query matches everything.
 */
export function matchesSearch(
  query: string | undefined,
  fields: readonly (string | null | undefined)[],
) {
  const terms = searchTerms(query);
  if (terms.length === 0) return true;
  const haystacks = fields
    .filter((field): field is string => !!field)
    .map(searchKey);
  return terms.every((term) =>
    haystacks.some((haystack) => haystack.includes(term)),
  );
}

export function searchTerms(query: string | undefined) {
  if (!query) return [];
  return searchKey(query).split(/\s+/).filter(Boolean);
}

export type SortOrder = "asc" | "desc";

/**
 * Sorts by `keys` in order; empty strings and nulls sort last in both
 * directions (an untitled song shouldn't lead a descending list).
 */
export function sortBy<T>(
  items: T[],
  order: SortOrder,
  keys: readonly ((item: T) => string | number | null | undefined)[],
) {
  const direction = order === "desc" ? -1 : 1;
  return items.sort((a, b) => {
    for (const key of keys) {
      const left = key(a);
      const right = key(b);
      const emptyRank = compareEmpty(left, right);
      if (emptyRank !== null) {
        if (emptyRank !== 0) return emptyRank;
        continue;
      }
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : compareText(String(left), String(right));
      if (result !== 0) return result * direction;
    }
    return 0;
  });
}

function isEmpty(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "";
}

/** Null when both keys have a value; otherwise how the empty one ranks (empty last, whatever the direction). */
function compareEmpty(
  left: string | number | null | undefined,
  right: string | number | null | undefined,
) {
  const leftEmpty = isEmpty(left);
  const rightEmpty = isEmpty(right);
  if (!leftEmpty && !rightEmpty) return null;
  if (leftEmpty && rightEmpty) return 0;
  return leftEmpty ? 1 : -1;
}
