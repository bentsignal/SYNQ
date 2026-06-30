export enum PlaylistBusEvent {
  PLAYLIST_NAME_MODIFIED = 'playlist_name_modified',
  PLAYLIST_SONG_COUNT_MODIFIED = 'playlist_song_count_modified',
  PLAYLIST_CONTENT_MODIFIED = 'playlist_content_modified',
  PLAYLIST_CREATED = 'playlist_created',
  PLAYLIST_DELETED = 'playlist_deleted',
  PLAYLIST_SONGS_IMPORTED = 'playlist_songs_imported',
}

export type PlaylistNameModifiedEvent = {
  id: number;
  name: string;
}

export type PlaylistSongCountModifiedEvent = {
  id: number;
  songCount: number;
}
