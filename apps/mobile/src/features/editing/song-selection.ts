/**
 * The song picker's selection, outside React so a tap re-renders only the
 * row it changed and the toolbar, not a list of thousands. Songs stay in the
 * order they were chosen, which is the order they're added in.
 */
export function createSongSelection<Song extends { id: number }>() {
  const picked = new Map<number, Song>();
  const listeners = new Set<() => void>();
  function changed() {
    for (const listener of listeners) listener();
  }
  return {
    /** Whether every one of `songs` is chosen (and there are some). */
    allChosen: (songs: readonly Song[]) =>
      songs.length > 0 && songs.every((song) => picked.has(song.id)),
    /** Chooses every one of `songs`, after those already chosen. */
    choose: (songs: readonly Song[]) => {
      for (const song of songs) {
        if (!picked.has(song.id)) picked.set(song.id, song);
      }
      changed();
    },
    has: (id: number) => picked.has(id),
    size: () => picked.size,
    songs: () => [...picked.values()],
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    toggle: (song: Song) => {
      if (!picked.delete(song.id)) picked.set(song.id, song);
      changed();
    },
    unchoose: (songs: readonly Song[]) => {
      for (const song of songs) picked.delete(song.id);
      changed();
    },
  };
}
