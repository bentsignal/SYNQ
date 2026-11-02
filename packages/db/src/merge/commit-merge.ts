/**
 * Writes a merge plan in one transaction, as a few statements that each take
 * their rows as one JSON array: the work happens in SQLite rather than row by
 * row in JavaScript, so a large restore barely holds up the JS thread.
 *
 * The plan was made a moment ago, and the person may have kept using the app
 * while the files moved, so a row that has since gone is skipped rather than
 * failing the restore, and a pair that has since appeared stays as it is.
 */
import { and, eq, isNull, sql } from "drizzle-orm";

import type { LibraryDb } from "../client.ts";
import type { MergePlan } from "./plan-merge.ts";
import { carrySequences } from "../legacy/write-import.ts";
import { changesOf } from "../library/changes.ts";
import { albums, albumSongs, artists, playlists, songs } from "../schema.ts";

function columnAt(index: number) {
  return `json_extract(value, '$[${String(index)}]')`;
}

function isIn(column: number, table: string) {
  return `${columnAt(column)} IN (SELECT id FROM ${table})`;
}

function insertRows(
  db: LibraryDb,
  into: {
    table: string;
    columns: readonly string[];
    where?: readonly string[];
  },
  rows: readonly (readonly unknown[])[],
) {
  if (rows.length === 0) return;
  const { columns, table, where = [] } = into;
  const values = columns.map((_, index) => columnAt(index)).join(", ");
  const filter = where.length === 0 ? "" : ` WHERE ${where.join(" AND ")}`;
  const insert = sql.raw(
    `INSERT OR IGNORE INTO ${table} (${columns.join(", ")}) SELECT ${values} FROM json_each(`,
  );
  db.run(sql`${insert}${JSON.stringify(rows)})${sql.raw(filter)}`);
}

function insertEntities(db: LibraryDb, plan: MergePlan) {
  insertRows(
    db,
    {
      columns: ["id", "name", "artwork_version", "added_at"],
      table: "artists",
    },
    plan.artists.map((a) => [a.id, a.name, a.artworkVersion, a.addedAt]),
  );
  insertRows(
    db,
    {
      columns: ["id", "name", "year", "artwork_version", "added_at"],
      table: "albums",
    },
    plan.albums.map((a) => [a.id, a.name, a.year, a.artworkVersion, a.addedAt]),
  );
  insertRows(
    db,
    {
      columns: [
        "id",
        "title",
        "file_path",
        "mime_type",
        "duration_ms",
        "artwork_version",
        "added_at",
        "modified_since_export",
      ],
      table: "songs",
    },
    plan.songs.map((s) => [
      s.id,
      s.title,
      s.filePath,
      s.mimeType,
      s.durationMs,
      s.artworkVersion,
      s.addedAt,
      s.modifiedSinceExport ? 1 : 0,
    ]),
  );
  insertRows(
    db,
    {
      columns: [
        "id",
        "name",
        "kind",
        "artwork_version",
        "created_at",
        "updated_at",
      ],
      table: "playlists",
    },
    plan.playlists.map((p) => [
      p.id,
      p.name,
      p.kind,
      p.artworkVersion,
      p.createdAt,
      p.updatedAt,
    ]),
  );
}

function insertJoins(db: LibraryDb, plan: MergePlan) {
  insertRows(
    db,
    {
      columns: ["song_id", "artist_id", "position"],
      table: "song_artists",
      where: [isIn(0, "songs"), isIn(1, "artists")],
    },
    plan.songArtists.map((r) => [r.songId, r.artistId, r.position]),
  );
  insertRows(
    db,
    {
      columns: ["album_id", "song_id", "track", "position"],
      table: "album_songs",
      where: [isIn(0, "albums"), isIn(1, "songs")],
    },
    plan.albumSongs.map((r) => [r.albumId, r.songId, r.track, r.position]),
  );
  insertRows(
    db,
    {
      columns: ["album_id", "artist_id", "position"],
      table: "album_artists",
      where: [isIn(0, "albums"), isIn(1, "artists")],
    },
    plan.albumArtists.map((r) => [r.albumId, r.artistId, r.position]),
  );
}

/** Appends after each playlist's last song, keeping the order given. */
function appendToPlaylists(db: LibraryDb, plan: MergePlan, now: number) {
  for (const { playlistId, songIds } of plan.playlistAppends) {
    const added = changesOf(
      db.run(sql`
        INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position)
        SELECT p.id, value, (
          SELECT coalesce(floor(max(position)), 0) + 1 FROM playlist_songs WHERE playlist_id = p.id
        ) + key
        FROM json_each(${JSON.stringify(songIds)}), playlists p
        WHERE p.id = ${playlistId} AND value IN (SELECT id FROM songs)
      `),
    );
    if (added > 0) {
      db.update(playlists)
        .set({ updatedAt: now })
        .where(eq(playlists.id, playlistId))
        .run();
    }
  }
}

function fillArtwork(
  db: LibraryDb,
  { id, kind }: MergePlan["fill"]["artwork"][number],
  now: number,
) {
  switch (kind) {
    case "song":
      db.update(songs)
        .set({ artworkVersion: now })
        .where(and(eq(songs.id, id), isNull(songs.artworkVersion)))
        .run();
      break;
    case "album":
      db.update(albums)
        .set({ artworkVersion: now })
        .where(and(eq(albums.id, id), isNull(albums.artworkVersion)))
        .run();
      break;
    case "artist":
      db.update(artists)
        .set({ artworkVersion: now })
        .where(and(eq(artists.id, id), isNull(artists.artworkVersion)))
        .run();
      break;
    case "playlist":
      db.update(playlists)
        .set({ artworkVersion: now, updatedAt: now })
        .where(and(eq(playlists.id, id), isNull(playlists.artworkVersion)))
        .run();
  }
}

/** Each update applies only while the value is still blank. */
function fillBlanks(db: LibraryDb, { fill }: MergePlan, now: number) {
  for (const { id, year } of fill.years) {
    db.update(albums)
      .set({ year })
      .where(and(eq(albums.id, id), isNull(albums.year)))
      .run();
  }
  for (const { albumId, songId, track } of fill.tracks) {
    db.update(albumSongs)
      .set({ track })
      .where(
        and(
          eq(albumSongs.albumId, albumId),
          eq(albumSongs.songId, songId),
          isNull(albumSongs.track),
        ),
      )
      .run();
  }
  for (const { filePath, id } of fill.audio) {
    db.update(songs).set({ filePath }).where(eq(songs.id, id)).run();
  }
  for (const artwork of fill.artwork) fillArtwork(db, artwork, now);
  if (fill.retag.length > 0) {
    db.run(
      sql`UPDATE songs SET modified_since_export = 1 WHERE id IN (SELECT value FROM json_each(${JSON.stringify(fill.retag)}))`,
    );
  }
}

/** Reserves the plan's new ids, so nothing the app adds meanwhile can take them. */
export function reserveMergeIds(db: LibraryDb, plan: MergePlan) {
  db.transaction((tx) => {
    carrySequences(tx, { ...plan.reservedIds });
  });
}

/** The merge token a transaction committed, the last time one did. */
export function committedMergeToken(db: LibraryDb) {
  const [row] = db.all<{ user_version: number }>(sql`PRAGMA user_version`);
  return row?.user_version ?? 0;
}

export function commitMerge(
  db: LibraryDb,
  plan: MergePlan,
  token: number,
  now: number,
) {
  db.transaction((tx) => {
    insertEntities(tx, plan);
    insertJoins(tx, plan);
    appendToPlaylists(tx, plan, now);
    fillBlanks(tx, plan, now);
    // Tells a later launch this merge committed (see `MergeJournal`). Part of
    // the transaction, so it can't say so unless every row above is in.
    tx.run(sql.raw(`PRAGMA user_version = ${String(token)}`));
  });
}
