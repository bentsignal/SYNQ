/** Deduplicates and renumbers 2.5.2's join tables, dropping rows whose ends are gone. */
import type { PlanContext } from "./plan-context.ts";
import type { LegacyLinkRow } from "./read-legacy-db.ts";
import { LEGACY_LIBRARY_PLAYLIST_ID } from "./plan-context.ts";

export interface PlannedIds {
  songIds: ReadonlySet<number>;
  artistIds: ReadonlySet<number>;
  albumIds: ReadonlySet<number>;
  playlistIds: ReadonlySet<number>;
}

export function planLinks(
  { snapshot, warnings }: PlanContext,
  { songIds, artistIds, albumIds, playlistIds }: PlannedIds,
) {
  const tally = {
    orphans: new Map<string, number>(),
    duplicates: new Map<string, number>(),
  };

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

  const albumSongs = linkRows(
    {
      table: "albumSongs",
      links: snapshot.albumSongs,
      valid: (l) => albumIds.has(l.left) && songIds.has(l.right),
      groupOf: (l) => l.right,
    },
    tally,
  ).map(({ link, position, duplicates }) => ({
    albumId: link.left,
    songId: link.right,
    // 2.5.2 updated every duplicate's track together; take the first one set.
    track:
      link.track ?? duplicates.find((d) => d.track !== null)?.track ?? null,
    position,
  }));

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
  return { songArtists, albumSongs, albumArtists, playlistSongs };
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
