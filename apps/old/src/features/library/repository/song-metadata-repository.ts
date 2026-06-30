import { getAlbumFromMetadata } from "@/src/controllers/AlbumController";
import { getArtistsFromMetadata } from "@/src/controllers/ArtistController";
import { saveCoverImage } from "@/src/lib/image-utils";
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

export const updateLibrarySongCover = async (songId: number, cover: string) => {
  const coverImage = await saveCoverImage(cover);

  if (!coverImage) {
    return;
  }

  const albumsContainingSong = await db
    .select({ albumId: schema.albumSongs.albumId })
    .from(schema.albumSongs)
    .where(eq(schema.albumSongs.songId, songId))
    .limit(1);
  const albumId = albumsContainingSong[0]?.albumId;

  if (albumId) {
    await db
      .update(schema.albums)
      .set({ coverImage })
      .where(eq(schema.albums.id, albumId));
    return;
  }

  await db
    .update(schema.songs)
    .set({ coverImage })
    .where(eq(schema.songs.id, songId));
};
