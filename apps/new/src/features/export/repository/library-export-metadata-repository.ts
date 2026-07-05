import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export type {
  LibraryExportAlbumMetadataRow,
  LibraryExportArtistMetadataRow,
  LibraryExportSongMetadataRow,
} from "../services/library-export-metadata-row-types-service";

export const loadLibraryExportSongMetadataRow = async (songId: number) => {
  const songRows = await db
    .select({
      coverImage: schema.songs.coverImage,
      fileType: schema.songs.fileType,
      pathToFile: schema.songs.pathToFile,
      title: schema.songs.title,
    })
    .from(schema.songs)
    .where(eq(schema.songs.id, songId))
    .limit(1);

  return songRows[0] ?? null;
};

export const loadLibraryExportArtistMetadataRows = (songId: number) =>
  db
    .select({ name: schema.artists.name })
    .from(schema.artistSongs)
    .innerJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .where(eq(schema.artistSongs.songId, songId));

export const loadLibraryExportAlbumMetadataRows = (songId: number) =>
  db
    .select({
      coverImage: schema.albums.coverImage,
      name: schema.albums.name,
    })
    .from(schema.albumSongs)
    .innerJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
    .where(eq(schema.albumSongs.songId, songId));
