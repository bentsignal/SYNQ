export type LibrarySongDetailSongRow = {
  coverImage: string | null;
  duration: number | null;
  fileType: string | null;
  originalFileName: string | null;
  pathToFile: string | null;
  title: string | null;
};

export type LibrarySongDetailAlbumRow = {
  coverImage: string | null;
  id: number;
  name: string | null;
  track: number | null;
  year: number | null;
};

export type LibrarySongDetailArtistRow = {
  id: number;
  name: string | null;
};

export type LibrarySongDetailPlaylistRow = {
  id: number;
  name: string | null;
};

export type LibrarySongDetailLikedRow = {
  id: number;
};

export type LibrarySongDetail = {
  albumLabel: string;
  albums: {
    detail: string;
    id: number;
    title: string;
    track: number | null;
  }[];
  artistLabel: string;
  artists: {
    id: number;
    title: string;
  }[];
  coverImagePath: string | null;
  duration: number | null;
  durationLabel: string;
  fileType: string;
  isLiked: boolean;
  isMissing: boolean;
  originalFileName: string;
  pathToFile: string | null;
  playlists: {
    id: number;
    title: string;
  }[];
  relationshipSummary: string;
  title: string;
  updatedAt: number;
};
