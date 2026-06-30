export enum ArtistBusEvent {
  ARTIST_CREATED = 'artist_created',
  ARTIST_DELETED = 'artist_deleted',
  ARTIST_MODIFIED = 'artist_modified',
  ARTIST_IMAGE_MODIFIED = 'artist_image_modified',
}

export type ArtistModifiedEvent = {
  id: number;
  name: string;
}

export type ArtistImageModifiedEvent = {
  id: number;
  image?: string;
}
