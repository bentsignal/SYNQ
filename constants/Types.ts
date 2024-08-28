export type InfoType = {
  "fileType"?: string;
  "format"?: string;
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
  "info": InfoType
};

export type InstructionsModalProps = {
  dontShowOption?: boolean;
};

export enum NotificationType {
  GENERAL = 1,
  ERROR = 2,
}