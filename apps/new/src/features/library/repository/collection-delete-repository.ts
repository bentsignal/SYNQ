import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import {
  likedSongsPlaylistId,
  systemPlaylistId,
} from "../services/library-playlist-constants-service";
import {
  deleteCollectionWithDependencies,
  type CollectionDeleteDependencies,
  type DeletableCollectionKind,
} from "./collection-delete-executor-repository";

const collectionDeleteDependencies: CollectionDeleteDependencies = {
  deleteAlbumArtistRows: async (albumId) => {
    await db
      .delete(schema.artistsAlbums)
      .where(eq(schema.artistsAlbums.albumId, albumId));
  },
  deleteAlbumRow: async (albumId) => {
    await db.delete(schema.albums).where(eq(schema.albums.id, albumId));
  },
  deleteAlbumSongRows: async (albumId) => {
    await db.delete(schema.albumSongs).where(eq(schema.albumSongs.albumId, albumId));
  },
  deleteArtistAlbumRows: async (artistId) => {
    await db
      .delete(schema.artistsAlbums)
      .where(eq(schema.artistsAlbums.artistId, artistId));
  },
  deleteArtistRow: async (artistId) => {
    await db.delete(schema.artists).where(eq(schema.artists.id, artistId));
  },
  deleteArtistSongRows: async (artistId) => {
    await db
      .delete(schema.artistSongs)
      .where(eq(schema.artistSongs.artistId, artistId));
  },
  deletePlaylistRow: async (playlistId) => {
    await db.delete(schema.playlists).where(eq(schema.playlists.id, playlistId));
  },
  deletePlaylistSongRows: async (playlistId) => {
    await db
      .delete(schema.playlistSongs)
      .where(eq(schema.playlistSongs.playlistId, playlistId));
  },
  likedSongsPlaylistId,
  systemPlaylistId,
};

export async function deleteCollection({
  id,
  kind,
}: {
  id: number;
  kind: DeletableCollectionKind;
}) {
  await deleteCollectionWithDependencies(
    { id, kind },
    collectionDeleteDependencies,
  );
}
