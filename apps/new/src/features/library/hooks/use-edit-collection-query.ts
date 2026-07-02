import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
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
    const row = album.data?.[0];
    return {
      error: album.error,
      imagePath: row?.coverImage
        ? getImagePathFromHash(row.coverImage).pathToSmallImage
        : null,
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
      imagePath: row?.profileImage
        ? getImagePathFromHash(row.profileImage).pathToSmallImage
        : null,
      isMissing: Boolean(artist.updatedAt) && !row,
      name: row?.name ?? "",
      updatedAt: artist.updatedAt,
      year: "",
    };
  }

  const row = playlist.data?.[0];
  return {
    error: playlist.error,
    imagePath: row?.coverImage
      ? getImagePathFromHash(row.coverImage).pathToSmallImage
      : null,
    isMissing: Boolean(playlist.updatedAt) && !row,
    name: row?.name ?? "",
    updatedAt: playlist.updatedAt,
    year: "",
  };
}
