/** What a picker's Done changes: the songs left in, and the songs added. */
export interface SongPick<Song> {
  /** The ids of the songs that were there and stay, in their order. */
  kept: readonly number[];
  /** The new songs, in the order they were chosen. */
  added: readonly Song[];
}

/**
 * The song picker's selection, outside React so a tap re-renders only the
 * row it changed and the toolbar, not a list of thousands. `present` is what
 * the album or playlist holds now: those start chosen and keep their order,
 * even if they're unchosen and chosen again, and new songs follow in the
 * order they were chosen.
 */
export function createSongSelection<Song extends { id: number }>(
  present: readonly number[] = [],
) {
  const original = new Set(present);
  const kept = new Set(present);
  const added = new Map<number, Song>();
  const listeners = new Set<() => void>();
  function has(id: number) {
    return kept.has(id) || added.has(id);
  }
  function add(song: Song) {
    if (original.has(song.id)) kept.add(song.id);
    else if (!added.has(song.id)) added.set(song.id, song);
  }
  function remove(id: number) {
    kept.delete(id);
    added.delete(id);
  }
  function changed() {
    for (const listener of listeners) listener();
  }
  return {
    /** Whether every one of `songs` is chosen (and there are some). */
    allChosen: (songs: readonly Song[]) =>
      songs.length > 0 && songs.every((song) => has(song.id)),
    /** Chooses every one of `songs`, after those already chosen. */
    choose: (songs: readonly Song[]) => {
      for (const song of songs) add(song);
      changed();
    },
    /** Whether Done would change anything. */
    hasChanges: () => added.size > 0 || kept.size !== original.size,
    has,
    /** The songs that were there when the picker opened. */
    isOriginal: (id: number) => original.has(id),
    pick: () =>
      ({
        added: [...added.values()],
        kept: present.filter((id) => kept.has(id)),
      }) satisfies SongPick<Song>,
    size: () => kept.size + added.size,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    toggle: (song: Song) => {
      if (has(song.id)) remove(song.id);
      else add(song);
      changed();
    },
    unchoose: (songs: readonly Song[]) => {
      for (const song of songs) remove(song.id);
      changed();
    },
  };
}

/** A sheet's rows after a pick: those kept, where they were, then the new ones. */
export function applySongPick<Song, Row extends { key: string }>(
  rows: readonly Row[],
  pick: SongPick<Song>,
  toRow: (song: Song) => Row,
) {
  const kept = new Set(pick.kept.map(String));
  return [...rows.filter((row) => kept.has(row.key)), ...pick.added.map(toRow)];
}
