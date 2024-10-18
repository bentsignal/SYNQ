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
  "data": string;
  "info": InfoType;
  "pageType"?: PageType;
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
}