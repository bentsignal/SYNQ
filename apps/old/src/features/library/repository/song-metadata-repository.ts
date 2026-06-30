import { getAlbumFromMetadata } from "@/src/controllers/AlbumController";
import { getArtistsFromMetadata } from "@/src/controllers/ArtistController";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

type UpdateLibrarySongMetadataInput = {
  id: number;
  title?: string;
  artist?: string;
  album?: string;
};

const replaceSongArtists = async (songId: number, artistValue: string) => {
  const artists = await getArtistsFromMetadata(artistValue);

  await db
    .delete(schema.artistSongs)
    .where(eq(schema.artistSongs.songId, songId));

  if (artists.length === 0) {
    return;
  }

  await db.insert(schema.artistSongs).values(
    artists.map((artist) => ({
      artistId: artist.id,
      songId,
    })),
  );
};

const replaceSongAlbum = async (songId: number, albumValue: string) => {
  const album = await getAlbumFromMetadata(albumValue);

  await db
    .delete(schema.albumSongs)
    .where(eq(schema.albumSongs.songId, songId));

  if (!album) {
    return;
  }

  await db.insert(schema.albumSongs).values({
    albumId: album.id,
    songId,
  });
};

export const updateLibrarySongMetadata = async ({
  id,
  title,
  artist,
  album,
}: UpdateLibrarySongMetadataInput) => {
  await db
    .update(schema.songs)
    .set({
      title,
    })
    .where(eq(schema.songs.id, id));

  if (artist !== undefined) {
    await replaceSongArtists(id, artist);
  }

  if (album !== undefined) {
    await replaceSongAlbum(id, album);
  }
};
