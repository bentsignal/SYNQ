import { PageType } from "@/constants/Types";

export enum SongBusEvent {
  SONG_INFO_MODIFIED = 'song_info_modified',
  SONG_COVER_MODIFIED = 'song_cover_modified',
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
