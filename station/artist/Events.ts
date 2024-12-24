export enum ArtistBusEvent {
  ARTIST_CREATED = 'artist_created',
  ARTIST_DELETED = 'artist_deleted',
  ARTIST_NAME_MODIFIED = 'artist_name_modified',
  ARTIST_IMAGE_MODIFIED = 'artist_image_modified',
}

export type ArtistNameModifiedEvent = {
  id: number;
  name: string;
}

export type ArtistImageModifiedEvent = {
  id: number;
  image?: string;
}