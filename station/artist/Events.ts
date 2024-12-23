export enum ArtistBusEvent {
  ARTIST_CREATED = 'artist_created',
}

export type ArtistNameModifiedEvent = {
  id: number;
  name: string;
}

export type ArtistImageModifiedEvent = {
  id: number;
  image?: string;
}