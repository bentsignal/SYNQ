export type InfoType = {
  "fileType"?: string;
  "format"?: string;
  "name"?: string;
  "metadata"?: {
    "album"?: string;
    "artist"?: string;
    "artwork"?: string;
    "name"?: string;
  };
};

export type SongType = {
  "name": string;
  "id": string;
  "uuid"?: string;
  "data"?: string;
  "info": InfoType;
  "pageType"?: PageType;
  "sourceType"?: SourceType;
  "sourceId"?: number;
  "edited"?: boolean;
  "importArtists"?: ArtistType[];
  "importAlbums"?: AlbumType[];
  "cacheUri"?: string;
};

export type TagsType = {
  title?: string;
  artist?: string;
  album?: string;
  APIC?: {
    description: string;
    imageBuffer: string;
    mime: string;
  }
};

export type SongResultType = {
  id?: number;
  title?: string;
  artists?: string;
  album?: string;
  genre?: string;
  duration?: number;
  fileType?: string;
  fileName?: string;
  edited?: boolean;
}

export type InstructionsModalProps = {
  dontShowOption?: boolean;
};

export enum NotificationType {
  GENERAL = 1,
  ERROR = 2,
}

export enum SortType {
  TITLE = 1,
  ARTIST = 2,
  ALBUM = 3,
  OLDEST = 4,
  NEWEST = 5,
}

export enum PageType {
  IMPORT = 1,
  LIBRARY = 2,
  PLAYER = 3,
  QUEUE = 4,
  PLAYLIST = 5,
  ALBUM = 6,
  ARTIST = 7,
  CREATE = 8,
  ADD = 9,
  EDIT = 10,
}

export enum SourceType {
  PLAYLIST = 1,
  ALBUM = 2,
  ARTIST = 3,
  SONG = 4,
}

export enum CoverType {
  SONG = 1,
  PLAYLIST = 2,
  ALBUM = 3,
  ARTIST = 4,
}

export type PlaylistType = {
  id: number;
  name: string;
  songCount: number;
  pageType?: PageType;
};

export type ArtistType = {
  id: number;
  name: string;
  image?: string;
  pageType?: PageType;
  sourceType?: SourceType;
};

export type AlbumType = {
  id: number;
  name: string;
  year?: number;
  image?: string;
  pageType?: PageType;
};