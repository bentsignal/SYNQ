/**
 * `@synq/db`: the 3.0 library database. Schema and migrations, typed
 * library queries and writes, and (in `@synq/db/legacy`) the 2.5.2 importer.
 */
export type { LibraryDb, LibrarySchema } from "./client.ts";
export * as schema from "./schema.ts";
export type {
  Album,
  Artist,
  LegacyImportCounts,
  LegacyImportRow,
  LegacyImportSource,
  Playlist,
  PlaylistKind,
  PlaylistSong,
  Song,
} from "./schema.ts";
export { libraryMigrations } from "./migrations.ts";

export { canAddAlbumNamed, VARIOUS_ARTISTS } from "./library/album-identity.ts";
export * from "./library/album-tracks.ts";
export * from "./library/albums.ts";
export * from "./library/artists.ts";
export * from "./library/artwork.ts";
export * from "./library/changes.ts";
export * from "./library/errors.ts";
export * from "./library/home.ts";
export type { AlbumRef, ArtistRef } from "./library/find-or-create.ts";
export { splitArtistNames } from "./library/matching.ts";
export * from "./library/playlist-songs.ts";
export * from "./library/playlists.ts";
export * from "./library/search.ts";
export type {
  AlbumCredit,
  ArtistCredit,
  SongListItem,
} from "./library/song-items.ts";
export { coverAlbum } from "./library/song-items.ts";
export * from "./library/song-files.ts";
export * from "./library/song-writes.ts";
export * from "./library/songs.ts";
export { compareText, matchesSearch, type SortOrder } from "./library/text.ts";
