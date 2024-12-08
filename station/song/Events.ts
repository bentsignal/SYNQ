export enum SongBusEvent {
  SONG_MODIFIED = 'song_modified',
}

export type SongModifiedEvent = {
  id: number;
}