import { PageType } from "@/src/constants/Types";

export enum SongBusEvent {
  SONG_INFO_MODIFIED = 'song_info_modified',
  SONG_COVER_MODIFIED = 'song_cover_modified',
  SONG_DELETED = 'song_deleted',
}

export type SongInfoModifiedEvent = {
  id: number;
  type: PageType;
  title?: string;
  artist?: string;
  album?: string;
  image?: string;
}

export type SongCoverModifiedEvent = {
  id: number;
  type: PageType;
  cover?: string;
}
