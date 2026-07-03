import { db } from "@synq/db";
import * as schema from "@synq/db/schema";

export const importLibraryPlaylistId = 1;

export const linkImportSongToLibraryPlaylist = async (songId: number) => {
  await db.insert(schema.playlistSongs).values({
    playlistId: importLibraryPlaylistId,
    songId,
  });
};

export const linkImportSongArtist = async ({
  artistId,
  songId,
}: {
  artistId: number;
  songId: number;
}) => {
  await db.insert(schema.artistSongs).values({
    artistId,
    songId,
  });
};

export const linkImportSongAlbum = async ({
  albumId,
  songId,
  track,
}: {
  albumId: number;
  songId: number;
  track: number | null;
}) => {
  await db.insert(schema.albumSongs).values({
    albumId,
    songId,
    track,
  });
};

export const linkImportArtistAlbum = async ({
  albumId,
  artistId,
}: {
  albumId: number;
  artistId: number;
}) => {
  await db.insert(schema.artistsAlbums).values({
    albumId,
    artistId,
  });
};
