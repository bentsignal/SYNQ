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
  "data": string;
  "info": InfoType;
  "pageType"?: PageType;
  "sourceType"?: SourceType;
  "sourceId"?: number;
  "edited"?: boolean;
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

export type InstructionsModalProps = {
  dontShowOption?: boolean;
};

export enum NotificationType {
  GENERAL = 1,
  ERROR = 2,
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
}

export enum SourceType {
  PLAYLIST = 1,
  ALBUM = 2,
  ARTIST = 3,
}

export enum CoverType {
  SONG = 1,
  PLAYLIST = 2,
  ALBUM = 3,
}

export type PlaylistType = {
  id: number;
  name: string;
  songCount: number;
  pageType?: PageType;
};
