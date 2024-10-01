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
  "audio"?: string;
  "artwork"?: string;
  "artwork_small"?: string;
};

export type InstructionsModalProps = {
  dontShowOption?: boolean;
};

export enum NotificationType {
  GENERAL = 1,
  ERROR = 2,
}