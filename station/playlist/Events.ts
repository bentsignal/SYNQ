export enum PlaylistBusEvent {
  PLAYLIST_MODIFIED = 'playlist_modified',
}

export type PlaylistModifiedEvent = {
  id: number;
}