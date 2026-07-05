import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";

export const getPlayableCollectionSongs = (
  songs: LibraryCollectionDetailSong[],
) => songs.filter((song) => song.pathToFile !== null);
