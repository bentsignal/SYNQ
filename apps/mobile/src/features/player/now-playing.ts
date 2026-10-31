/**
 * The song that's playing, for rows to mark it (accent title and a
 * `waveform` symbol). Contract only, until the player lands.
 */
export function useNowPlaying() {
  return nowPlaying(null, false);
}

function nowPlaying(songId: number | null, playing: boolean) {
  return { playing, songId };
}
