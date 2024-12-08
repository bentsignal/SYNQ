export enum PlaylistBusEvent {
  PLAYLIST_NAME_MODIFIED = 'playlist_name_modified',
  PLAYLIST_IMAGE_MODIFIED = 'playlist_image_modified',
  PLAYLIST_SONG_COUNT_MODIFIED = 'playlist_song_count_modified',
  PLAYLIST_CONTENT_MODIFIED = 'playlist_content_modified',
  PLAYLIST_CREATED = 'playlist_created',
}

export type PlaylistNameModifiedEvent = {
  id: number;
  name: string;
}

export type PlaylistImageModifiedEvent = {
  id: number;
  image?: string;
}

export type PlaylistSongCountModifiedEvent = {
  id: number;
  songCount: number;
}