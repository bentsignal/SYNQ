export type LibraryCollectionDetailSong = {
  album: string;
  artworkUri?: string | null;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
  track: number | null;
};

export type LibraryCollectionDetailSongRow = {
  albumCoverImage?: string | null;
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  pathToFile: string | null;
  songCoverImage?: string | null;
  songId: number;
  title: string | null;
  track: number | null;
};

export { rowsToCollectionDetailSongs } from "./library-collection-detail-song-mapper-service";
