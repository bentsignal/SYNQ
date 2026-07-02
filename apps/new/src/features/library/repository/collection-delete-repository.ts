import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import type { CollectionMetadataKind } from "../services/collection-metadata-service";

type DeletableCollectionKind = CollectionMetadataKind;

export async function deleteCollection({
  id,
  kind,
}: {
  id: number;
  kind: DeletableCollectionKind;
}) {
  switch (kind) {
    case "album":
      await db.delete(schema.albumSongs).where(eq(schema.albumSongs.albumId, id));
      await db
        .delete(schema.artistsAlbums)
        .where(eq(schema.artistsAlbums.albumId, id));
      await db.delete(schema.albums).where(eq(schema.albums.id, id));
      return;
    case "artist":
      await db
        .delete(schema.artistSongs)
        .where(eq(schema.artistSongs.artistId, id));
      await db
        .delete(schema.artistsAlbums)
        .where(eq(schema.artistsAlbums.artistId, id));
      await db.delete(schema.artists).where(eq(schema.artists.id, id));
      return;
    case "playlist":
      if (id === 1 || id === 2) {
        throw new Error("This system playlist cannot be deleted.");
      }

      await db
        .delete(schema.playlistSongs)
        .where(eq(schema.playlistSongs.playlistId, id));
      await db.delete(schema.playlists).where(eq(schema.playlists.id, id));
  }
}
