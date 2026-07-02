import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  buildEditCollectionState,
  type EditCollectionAlbumRow,
  type EditCollectionArtistRow,
  type EditCollectionPlaylistRow,
} from "../services/edit-collection-query-service";

export type { EditCollectionKind } from "../services/edit-collection-query-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

const mapAlbumEditQuery = (album: ReturnType<typeof useEditAlbumRowQuery>) => ({
  error: album.error,
  ...buildEditCollectionState({
    albumRow: album.data?.[0] as EditCollectionAlbumRow | undefined,
    getImagePath: getSmallImagePath,
    hasLoaded: Boolean(album.updatedAt),
    kind: "album" as const,
  }),
  updatedAt: album.updatedAt,
});

const mapArtistEditQuery = (
  artist: ReturnType<typeof useEditArtistRowQuery>,
) => ({
  error: artist.error,
  ...buildEditCollectionState({
    artistRow: artist.data?.[0] as EditCollectionArtistRow | undefined,
    getImagePath: getSmallImagePath,
    hasLoaded: Boolean(artist.updatedAt),
    kind: "artist" as const,
  }),
  updatedAt: artist.updatedAt,
});

const mapPlaylistEditQuery = (
  playlist: ReturnType<typeof useEditPlaylistRowQuery>,
) => ({
  error: playlist.error,
  ...buildEditCollectionState({
    getImagePath: getSmallImagePath,
    hasLoaded: Boolean(playlist.updatedAt),
    kind: "playlist" as const,
    playlistRow: playlist.data?.[0] as EditCollectionPlaylistRow | undefined,
  }),
  updatedAt: playlist.updatedAt,
});

function useEditAlbumRowQuery(id: number) {
  const album = useLiveQuery(
    db
      .select({
        coverImage: schema.albums.coverImage,
        name: schema.albums.name,
        year: schema.albums.year,
      })
      .from(schema.albums)
      .where(eq(schema.albums.id, id)),
  );

  return album;
}

function useEditArtistRowQuery(id: number) {
  const artist = useLiveQuery(
    db
      .select({
        name: schema.artists.name,
        profileImage: schema.artists.profileImage,
      })
      .from(schema.artists)
      .where(eq(schema.artists.id, id)),
  );

  return artist;
}

function useEditPlaylistRowQuery(id: number) {
  const playlist = useLiveQuery(
    db
      .select({
        coverImage: schema.playlists.coverImage,
        name: schema.playlists.name,
      })
      .from(schema.playlists)
      .where(eq(schema.playlists.id, id)),
  );

  return playlist;
}

export function useEditAlbumCollectionQuery({ id }: { id: number }) {
  const album = useEditAlbumRowQuery(id);

  return mapAlbumEditQuery(album);
}

export function useEditArtistCollectionQuery({ id }: { id: number }) {
  const artist = useEditArtistRowQuery(id);

  return mapArtistEditQuery(artist);
}

export function useEditPlaylistCollectionQuery({ id }: { id: number }) {
  const playlist = useEditPlaylistRowQuery(id);

  return mapPlaylistEditQuery(playlist);
}

export type EditCollectionQueryResult = ReturnType<
  typeof useEditAlbumCollectionQuery
>;
