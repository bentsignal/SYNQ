import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  buildEditCollectionState,
  type EditCollectionAlbumRow,
  type EditCollectionArtistRow,
  type EditCollectionKind,
  type EditCollectionPlaylistRow,
} from "../services/edit-collection-query-service";

type EditCollectionQueryOptions = {
  id: number;
  kind: EditCollectionKind;
};

export type { EditCollectionKind } from "../services/edit-collection-query-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

export function useEditCollectionQuery({
  id,
  kind,
}: EditCollectionQueryOptions) {
  const playlist = useLiveQuery(
    db
      .select({
        coverImage: schema.playlists.coverImage,
        name: schema.playlists.name,
      })
      .from(schema.playlists)
      .where(eq(schema.playlists.id, id)),
  );
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
  const artist = useLiveQuery(
    db
      .select({
        name: schema.artists.name,
        profileImage: schema.artists.profileImage,
      })
      .from(schema.artists)
      .where(eq(schema.artists.id, id)),
  );

  if (kind === "album") {
    return {
      error: album.error,
      ...buildEditCollectionState({
        albumRow: album.data?.[0] as EditCollectionAlbumRow | undefined,
        getImagePath: getSmallImagePath,
        hasLoaded: Boolean(album.updatedAt),
        kind,
      }),
      updatedAt: album.updatedAt,
    };
  }

  if (kind === "artist") {
    return {
      error: artist.error,
      ...buildEditCollectionState({
        artistRow: artist.data?.[0] as EditCollectionArtistRow | undefined,
        getImagePath: getSmallImagePath,
        hasLoaded: Boolean(artist.updatedAt),
        kind,
      }),
      updatedAt: artist.updatedAt,
    };
  }

  return {
    error: playlist.error,
    ...buildEditCollectionState({
      getImagePath: getSmallImagePath,
      hasLoaded: Boolean(playlist.updatedAt),
      kind,
      playlistRow: playlist.data?.[0] as EditCollectionPlaylistRow | undefined,
    }),
    updatedAt: playlist.updatedAt,
  };
}
