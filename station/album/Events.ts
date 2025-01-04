export enum AlbumBusEvent {
  ALBUM_CREATED = 'album_created',
  ALBUM_DELETED = 'album_deleted',
  ALBUM_MODIFIED = 'album_modified',
  ALBUM_IMAGE_MODIFIED = 'album_image_modified',
  ALBUM_TOGGLED_ON_SONG = 'album_toggled_on_song',
}

export type AlbumModifiedEvent = {
  id: number;
  name: string;
  year?: number;
}

export type AlbumImageModifiedEvent = {
  id: number;
  image?: string;
}

export type AlbumToggledOnSongEvent = {
  albumId: number;
  songId: number;
  add?: boolean;
} 