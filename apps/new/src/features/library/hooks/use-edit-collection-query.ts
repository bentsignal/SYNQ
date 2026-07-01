import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import type { CollectionKind } from "../screens/EditCollectionScreen";

type EditCollectionQueryOptions = {
  id: number;
  kind: CollectionKind;
};

export function useEditCollectionQuery({
  id,
  kind,
}: EditCollectionQueryOptions) {
  const playlist = useLiveQuery(
    db
      .select({
        name: schema.playlists.name,
      })
      .from(schema.playlists)
      .where(eq(schema.playlists.id, id)),
  );
  const album = useLiveQuery(
    db
      .select({
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
      })
      .from(schema.artists)
      .where(eq(schema.artists.id, id)),
  );

  if (kind === "album") {
    const row = album.data?.[0];
    return {
      error: album.error,
      isMissing: Boolean(album.updatedAt) && !row,
      name: row?.name ?? "",
      updatedAt: album.updatedAt,
      year: row?.year?.toString() ?? "",
    };
  }

  if (kind === "artist") {
    const row = artist.data?.[0];
    return {
      error: artist.error,
      isMissing: Boolean(artist.updatedAt) && !row,
      name: row?.name ?? "",
      updatedAt: artist.updatedAt,
      year: "",
    };
  }

  const row = playlist.data?.[0];
  return {
    error: playlist.error,
    isMissing: Boolean(playlist.updatedAt) && !row,
    name: row?.name ?? "",
    updatedAt: playlist.updatedAt,
    year: "",
  };
}
