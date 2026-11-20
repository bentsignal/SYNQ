import type { RowMark } from "./collection-row";

/** A playlist's mark as Add to Playlist opens: it holds all the songs, some, or none. */
export function markOf(held: number, total: number) {
  if (held === 0) return "off" satisfies RowMark;
  return held >= total ? ("on" satisfies RowMark) : ("mixed" satisfies RowMark);
}

/** A tap: a checked playlist unchecks; an empty or mixed one checks. */
export function toggled(mark: RowMark) {
  return mark === "on" ? ("off" satisfies RowMark) : ("on" satisfies RowMark);
}

/**
 * What Done writes: the playlists checked that didn't hold every song get
 * them, and those unchecked that held some lose them. `start` is each
 * playlist's mark from the library now; `chosen` the ones that were tapped.
 */
export function playlistChange(
  start: (playlistId: number) => RowMark,
  chosen: ReadonlyMap<number, RowMark>,
) {
  const add = new Array<number>();
  const remove = new Array<number>();
  for (const [playlistId, mark] of chosen) {
    if (mark === start(playlistId)) continue;
    if (mark === "on") add.push(playlistId);
    else remove.push(playlistId);
  }
  return { add, remove };
}
