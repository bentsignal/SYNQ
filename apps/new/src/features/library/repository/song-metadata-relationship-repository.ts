import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import {
  replaceLibrarySongMetadataRelationshipsWithDependencies,
} from "./song-metadata-relationship-executor-repository";

const findArtistIdByName = async (name: string) => {
  const existing = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(eq(schema.artists.name, name))
    .limit(1);

  return existing[0]?.id ?? null;
};

const insertArtist = async (name: string) => {
  const inserted = await db
    .insert(schema.artists)
    .values({ name })
    .returning({ id: schema.artists.id });

  return inserted[0].id;
};

const findAlbumIdByName = async (name: string) => {
  const existing = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(eq(schema.albums.name, name))
    .limit(1);

  return existing[0]?.id ?? null;
};

const insertAlbum = async (name: string) => {
  const inserted = await db
    .insert(schema.albums)
    .values({ name })
    .returning({ id: schema.albums.id });

  return inserted[0].id;
};

const findAlbumArtistLinkId = async ({
  albumId,
  artistId,
}: {
  albumId: number;
  artistId: number;
}) => {
  const existing = await db
    .select({ id: schema.artistsAlbums.id })
    .from(schema.artistsAlbums)
    .where(
      and(
        eq(schema.artistsAlbums.albumId, albumId),
        eq(schema.artistsAlbums.artistId, artistId),
      ),
    )
    .limit(1);

  return existing[0]?.id ?? null;
};

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
      findAlbumArtistLinkId,
      findAlbumIdByName,
      findArtistIdByName,
      insertAlbum,
      insertAlbumArtistRows: async (rows) => {
        await db.insert(schema.artistsAlbums).values(rows);
      },
      insertAlbumSongRows: async (rows) => {
        await db.insert(schema.albumSongs).values(rows);
      },
      insertArtist,
      insertArtistSongRows: async (rows) => {
        await db.insert(schema.artistSongs).values(rows);
      },
    },
  );
}
