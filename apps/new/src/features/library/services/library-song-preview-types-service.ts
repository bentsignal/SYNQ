export type LibrarySongPreview = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
};

export type LibrarySongPreviewSort = "album" | "artist" | "recent" | "title";

export type LibrarySongPreviewOrder = "asc" | "desc";

export type LibrarySongPreviewRow = {
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  pathToFile: string | null;
  songId: number;
  title: string;
};
