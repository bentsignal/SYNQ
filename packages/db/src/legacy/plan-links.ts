/** Deduplicates and renumbers 2.5.2's join tables, dropping rows whose ends are gone. */
import type { PlanContext } from "./plan-context.ts";
import type { LegacyLinkRow } from "./read-legacy-db.ts";
import { oneAlbumEach } from "../library/one-album.ts";
import { LEGACY_LIBRARY_PLAYLIST_ID } from "./plan-context.ts";

export interface PlannedIds {
  songIds: ReadonlySet<number>;
  artistIds: ReadonlySet<number>;
  albumIds: ReadonlySet<number>;
  /** Albums with a cover: a song on several keeps one of these first. */
  coveredAlbumIds: ReadonlySet<number>;
  playlistIds: ReadonlySet<number>;
}

export function planLinks(
  { snapshot, warnings }: PlanContext,
  { songIds, artistIds, albumIds, coveredAlbumIds, playlistIds }: PlannedIds,
) {
  const tally = {
    orphans: new Map<string, number>(),
    duplicates: new Map<string, number>(),
  };

  const packedTracks = new Array<number>();

  const songArtists = linkRows(
    {
      table: "artistSongs",
      links: snapshot.artistSongs,
      valid: (l) => artistIds.has(l.left) && songIds.has(l.right),
      groupOf: (l) => l.right,
    },
    tally,
  ).map(({ link, position }) => ({
    songId: link.right,
    artistId: link.left,
    position,
  }));

  const allAlbumSongs = linkRows(
    {
      table: "albumSongs",
      links: snapshot.albumSongs,
      valid: (l) => albumIds.has(l.left) && songIds.has(l.right),
      groupOf: (l) => l.right,
    },
    tally,
  ).map(({ link, position, duplicates }) => {
    // 2.5.2 updated every duplicate's track together; take the first one set.
    const stored =
      link.track ?? duplicates.find((d) => d.track !== null)?.track ?? null;
    const track = unpackTrack(stored);
    if (track !== stored) packedTracks.push(link.right);
    return { albumId: link.left, songId: link.right, track, position };
  });
  const albumSongs = oneAlbumEach(allAlbumSongs, (id) =>
    coveredAlbumIds.has(id),
  ).map((row) => ({ ...row, position: 0 }));

  const albumArtists = linkRows(
    {
      table: "artistsAlbums",
      links: snapshot.artistsAlbums,
      valid: (l) => artistIds.has(l.left) && albumIds.has(l.right),
      groupOf: (l) => l.right,
    },
    tally,
  ).map(({ link, position }) => ({
    albumId: link.right,
    artistId: link.left,
    position,
  }));

  // Positions follow playlistSongs.id, the add order. 2.5.2 queried with no
  // ORDER BY and so displayed songs-table order; see docs/migration.md.
  const playlistSongs = linkRows(
    {
      table: "playlistSongs",
      links: snapshot.playlistSongs.filter(
        (l) => l.left !== LEGACY_LIBRARY_PLAYLIST_ID,
      ),
      valid: (l) => playlistIds.has(l.left) && songIds.has(l.right),
      groupOf: (l) => l.left,
    },
    tally,
  ).map(({ link, position }) => ({
    id: link.rowid,
    playlistId: link.left,
    songId: link.right,
    position: position + 1,
  }));

  if (tally.orphans.size > 0) {
    warnings.push({
      code: "orphan-join-rows",
      message: `Dropped orphan rows: ${describe(tally.orphans)}`,
    });
  }
  if (tally.duplicates.size > 0) {
    warnings.push({
      code: "duplicate-join-rows",
      message: `Dropped duplicate rows: ${describe(tally.duplicates)}`,
    });
  }
  if (albumSongs.length < allAlbumSongs.length) {
    const collapsed = new Set(
      allAlbumSongs.filter((row) => row.position > 0).map((row) => row.songId),
    );
    warnings.push({
      code: "song-albums-collapsed",
      message: `Kept one album for each song on several (${collapsed.size})`,
      ids: [...collapsed].sort((a, b) => a - b),
    });
  }
  if (packedTracks.length > 0) {
    warnings.push({
      code: "packed-track-number",
      message: `Decoded packed m4a track numbers (${packedTracks.length})`,
      ids: [...new Set(packedTracks)].sort((a, b) => a - b),
    });
  }
  return { songArtists, albumSongs, albumArtists, playlistSongs };
}

/**
 * 2.5.2 read an m4a's `trkn` atom ("1 of 3") as one integer,
 * `total << 16 | n` (196609 for 1 of 3). No real track number exceeds
 * 0xFFFF, so anything larger is decoded to its low 16 bits (null if those
 * are 0, as 2.5.2 stored "no track").
 */
function unpackTrack(track: number | null) {
  if (track === null || track <= 0xffff) return track;
  return track % 0x10000 || null;
}

/**
 * Keeps the first (lowest rowid) of each (left, right) pair whose ends both
 * exist, numbering positions 0.. within `groupOf` in rowid order.
 */
function linkRows(
  spec: {
    table: string;
    links: readonly LegacyLinkRow[];
    valid: (link: LegacyLinkRow) => boolean;
    groupOf: (link: LegacyLinkRow) => number;
  },
  tally: { orphans: Map<string, number>; duplicates: Map<string, number> },
) {
  const { table, links, valid, groupOf } = spec;
  const firsts = new Map<
    string,
    { link: LegacyLinkRow; duplicates: LegacyLinkRow[] }
  >();
  for (const link of [...links].sort((a, b) => a.rowid - b.rowid)) {
    if (!valid(link)) {
      tally.orphans.set(table, (tally.orphans.get(table) ?? 0) + 1);
      continue;
    }
    const key = `${link.left}:${link.right}`;
    const first = firsts.get(key);
    if (first) {
      first.duplicates.push(link);
      tally.duplicates.set(table, (tally.duplicates.get(table) ?? 0) + 1);
    } else {
      firsts.set(key, { link, duplicates: [] });
    }
  }
  const nextPosition = new Map<number, number>();
  return [...firsts.values()].map((entry) => {
    const group = groupOf(entry.link);
    const position = nextPosition.get(group) ?? 0;
    nextPosition.set(group, position + 1);
    return { ...entry, position };
  });
}

function describe(counts: Map<string, number>) {
  return [...counts].map(([table, n]) => `${table} ${n}`).join(", ");
}
