/**
 * The Library tab's home: what's pinned, then everything else by how recently
 * it was played or added (docs/rewrite.md → Home). An item is a playlist,
 * album, artist, or song, and is shown once: a pinned item isn't also recent.
 */
import { desc, eq, inArray, isNotNull, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { AlbumListItem } from "./albums.ts";
import type { ArtistListItem } from "./artists.ts";
import type { LibraryTable, WriteOptions } from "./changes.ts";
import type { PlaylistListItem } from "./playlists.ts";
import type { SongListItem } from "./song-items.ts";
import { albums, artists, playlists, songs } from "../schema.ts";
import { loadAlbumItems } from "./albums.ts";
import { loadArtistItems } from "./artists.ts";
import { nowFrom, written } from "./changes.ts";
import { selectPlaylists } from "./playlists.ts";
import { loadSongItems } from "./song-items.ts";

export type HomeKind = "album" | "artist" | "playlist" | "song";

/** Which playlist, album, artist, or song. */
export interface HomeRef {
  kind: HomeKind;
  id: number;
}

export type HomeItem =
  | { kind: "album"; id: number; album: AlbumListItem }
  | { kind: "artist"; id: number; artist: ArtistListItem }
  | { kind: "playlist"; id: number; playlist: PlaylistListItem }
  | { kind: "song"; id: number; song: SongListItem };

const TABLES = {
  album: { changed: "albums", table: albums },
  artist: { changed: "artists", table: artists },
  playlist: { changed: "playlists", table: playlists },
  song: { changed: "songs", table: songs },
} as const satisfies Record<
  HomeKind,
  { changed: LibraryTable; table: unknown }
>;

function homeKey({ id, kind }: HomeRef) {
  return `${kind}:${String(id)}`;
}

/** The full items for `refs`, in their order, skipping any that have gone. */
function loadHomeItems(db: LibraryDb, refs: readonly HomeRef[]) {
  function ids(kind: HomeKind) {
    return refs.filter((ref) => ref.kind === kind).map((ref) => ref.id);
  }
  const items = new Map<string, HomeItem>();
  function add(item: HomeItem) {
    items.set(homeKey(item), item);
  }
  const albumIds = ids("album");
  const artistIds = ids("artist");
  const playlistIds = ids("playlist");
  const songIds = ids("song");
  if (albumIds.length > 0) {
    for (const album of loadAlbumItems(db, inArray(albums.id, albumIds))) {
      add({ album, id: album.id, kind: "album" });
    }
  }
  if (artistIds.length > 0) {
    for (const artist of loadArtistItems(db, inArray(artists.id, artistIds))) {
      add({ artist, id: artist.id, kind: "artist" });
    }
  }
  if (playlistIds.length > 0) {
    for (const playlist of selectPlaylists(
      db,
      inArray(playlists.id, playlistIds),
    )) {
      add({ id: playlist.id, kind: "playlist", playlist });
    }
  }
  if (songIds.length > 0) {
    for (const song of loadSongItems(db, inArray(songs.id, songIds))) {
      add({ id: song.id, kind: "song", song });
    }
  }
  return refs.flatMap((ref) => items.get(homeKey(ref)) ?? []);
}

function pinnedRefs(db: LibraryDb, kind: HomeKind) {
  const { table } = TABLES[kind];
  return db
    .select({ id: table.id, pinnedAt: table.pinnedAt })
    .from(table)
    .where(isNotNull(table.pinnedAt))
    .orderBy(desc(table.pinnedAt), desc(table.id))
    .all()
    .map(({ id, pinnedAt }) => ({ id, kind, pinnedAt: pinnedAt ?? 0 }));
}

/** Everything pinned, the latest pin first. Pins have no limit, so nor does this. */
export function listPinned(db: LibraryDb) {
  const refs = (["album", "artist", "playlist", "song"] as const)
    .flatMap((kind) => pinnedRefs(db, kind))
    .sort((a, b) => b.pinnedAt - a.pinnedAt);
  return loadHomeItems(db, refs);
}

function isHomeKind(kind: string): kind is HomeKind {
  return kind in TABLES;
}

/**
 * The newest `limit` items that aren't pinned, by when each was last played,
 * or added if it never has been, so a new import comes up first and a library
 * with no plays yet (every 2.5.2 upgrade) still has a home.
 *
 * Songs an album already stands for wait until they're played on their own.
 * An artist is only here once played, since an import adds them as a side
 * effect. Liked Songs has its own row until it's played.
 */
export function listRecents(db: LibraryDb, { limit }: { limit: number }) {
  const rows = db.all<{ id: number; kind: string }>(sql`
    SELECT kind, id FROM (
      SELECT 'album' AS kind, id, coalesce(last_played_at, added_at) AS at
      FROM albums
      WHERE pinned_at IS NULL AND id IN (SELECT album_id FROM album_songs)
      UNION ALL
      SELECT 'playlist', id, coalesce(last_played_at, created_at)
      FROM playlists
      WHERE pinned_at IS NULL AND (kind = 'user' OR last_played_at IS NOT NULL)
      UNION ALL
      SELECT 'artist', id, last_played_at
      FROM artists
      WHERE pinned_at IS NULL AND last_played_at IS NOT NULL
      UNION ALL
      SELECT 'song', id, coalesce(last_played_at, added_at)
      FROM songs
      WHERE pinned_at IS NULL
        AND (last_played_at IS NOT NULL OR id NOT IN (SELECT song_id FROM album_songs))
    )
    ORDER BY at DESC, kind, id DESC
    LIMIT ${limit}
  `);
  const refs = rows.flatMap(({ id, kind }) =>
    isHomeKind(kind) ? [{ id, kind }] : [],
  );
  return { hasMore: rows.length === limit, items: loadHomeItems(db, refs) };
}

/** Pins or unpins one item; playing it later doesn't change its pin. */
export function setPinned(
  db: LibraryDb,
  { id, kind }: HomeRef,
  pinned: boolean,
  options?: WriteOptions,
) {
  const { changed, table } = TABLES[kind];
  db.update(table)
    .set({ pinnedAt: pinned ? nowFrom(options) : null })
    .where(eq(table.id, id))
    .run();
  return written(undefined, [changed]);
}

/** Notes that `ref` was just played, which brings it to the top of Recents. */
export function recordPlayed(
  db: LibraryDb,
  { id, kind }: HomeRef,
  options?: WriteOptions,
) {
  const { changed, table } = TABLES[kind];
  db.update(table)
    .set({ lastPlayedAt: nowFrom(options) })
    .where(eq(table.id, id))
    .run();
  return written(undefined, [changed]);
}

/** As `recordPlayed`, for Liked Songs, which the player knows only by kind. */
export function recordLikedPlayed(db: LibraryDb, options?: WriteOptions) {
  db.update(playlists)
    .set({ lastPlayedAt: nowFrom(options) })
    .where(eq(playlists.kind, "liked"))
    .run();
  return written(undefined, ["playlists"]);
}
