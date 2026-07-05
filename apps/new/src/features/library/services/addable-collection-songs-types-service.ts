export type AddableCollectionSong = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  isLinked: boolean;
  title: string;
};

export type AddableCollectionSongRow = {
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  songId: number;
  title: string | null;
};

export type AddableCollectionLinkedSongRow = {
  songId: number | null;
};
