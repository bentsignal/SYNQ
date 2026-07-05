export type LibraryCollectionDetailSong = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
  track: number | null;
};

export type LibraryCollectionDetailSongRow = {
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  pathToFile: string | null;
  songId: number;
  title: string | null;
  track: number | null;
};

export { rowsToCollectionDetailSongs } from "./library-collection-detail-song-mapper-service";
