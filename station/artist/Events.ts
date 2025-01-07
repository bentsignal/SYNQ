export enum ArtistBusEvent {
  ARTIST_CREATED = 'artist_created',
  ARTIST_DELETED = 'artist_deleted',
  ARTIST_MODIFIED = 'artist_modified',
  ARTIST_IMAGE_MODIFIED = 'artist_image_modified',
  ARTIST_TOGGLED_ON_SONG = 'artist_toggled_on_song',
  ARTIST_TOGGLED_ON_ALBUM = 'artist_toggled_on_album',
}

export type ArtistModifiedEvent = {
  id: number;
  name: string;
}

export type ArtistImageModifiedEvent = {
  id: number;
  image?: string;
}

export type ArtistToggledOnSongEvent = {
  artistId: number;
  songId: number;
  add?: boolean;
}

export type ArtistToggledOnAlbumEvent = {
  artistId: number;
  albumId: number;
  add?: boolean;
}
