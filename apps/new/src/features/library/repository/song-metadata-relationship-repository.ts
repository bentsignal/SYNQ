import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import {
  replaceLibrarySongMetadataRelationshipsWithDependencies,
} from "./song-metadata-relationship-executor-repository";
import {
  findSongMetadataAlbumArtistLinkId,
  findSongMetadataAlbumIdByName,
  findSongMetadataArtistIdByName,
  insertSongMetadataAlbum,
  insertSongMetadataArtist,
} from "./song-metadata-entity-repository";

export async function replaceLibrarySongMetadataRelationships({
  albumNames,
  artistNames,
  songId,
}: {
  albumNames: string;
  artistNames: string;
  songId: number;
}) {
  return replaceLibrarySongMetadataRelationshipsWithDependencies(
    {
      albumNames,
      artistNames,
      songId,
    },
    {
      deleteAlbumSongRows: async (songId) => {
        await db
          .delete(schema.albumSongs)
          .where(eq(schema.albumSongs.songId, songId));
      },
      deleteArtistSongRows: async (songId) => {
        await db
          .delete(schema.artistSongs)
          .where(eq(schema.artistSongs.songId, songId));
      },
      findAlbumArtistLinkId: findSongMetadataAlbumArtistLinkId,
      findAlbumIdByName: findSongMetadataAlbumIdByName,
      findArtistIdByName: findSongMetadataArtistIdByName,
      insertAlbum: insertSongMetadataAlbum,
      insertAlbumArtistRows: async (rows) => {
        await db.insert(schema.artistsAlbums).values(rows);
      },
      insertAlbumSongRows: async (rows) => {
        await db.insert(schema.albumSongs).values(rows);
      },
      insertArtist: insertSongMetadataArtist,
      insertArtistSongRows: async (rows) => {
        await db.insert(schema.artistSongs).values(rows);
      },
    },
  );
}
