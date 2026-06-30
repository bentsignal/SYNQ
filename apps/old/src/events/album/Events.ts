export enum AlbumBusEvent {
  ALBUM_CREATED = 'album_created',
  ALBUM_DELETED = 'album_deleted',
  ALBUM_MODIFIED = 'album_modified',
  ALBUM_REORDERED = 'album_reordered',
}

export type AlbumModifiedEvent = {
  id: number;
  name: string;
  year?: number;
}

export type AlbumReorderedEvent = {
  albumId: number;
}
