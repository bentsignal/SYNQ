export enum ArtistBusEvent {
  ARTIST_CREATED = 'artist_created',
  ARTIST_DELETED = 'artist_deleted',
}

export type ArtistNameModifiedEvent = {
  id: number;
  name: string;
}

export type ArtistImageModifiedEvent = {
  id: number;
  image?: string;
}