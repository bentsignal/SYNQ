export type LibrarySongPreview = {
  album: string;
  artworkUri?: string | null;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
};

export type LibrarySongPreviewSort = "album" | "artist" | "recent" | "title";

export type LibrarySongPreviewOrder = "asc" | "desc";

export type LibrarySongPreviewRow = {
  albumCoverImage?: string | null;
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  pathToFile: string | null;
  songCoverImage?: string | null;
  songId: number;
  title: string;
};
