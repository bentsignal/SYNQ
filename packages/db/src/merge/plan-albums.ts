/** Albums, their tracks, and their artists. See `planMerge`. */
import type { PlanFiles } from "./plan-files.ts";
import type { LibrarySnapshot } from "./types.ts";
import { groupBy } from "./plan-helpers.ts";
import { matchNames, pairKey, planNamedRows } from "./plan-names.ts";

export interface AlbumsContext {
  current: LibrarySnapshot;
  backup: LibrarySnapshot;
  files: PlanFiles;
  retag: Set<number>;
  songTargets: ReadonlyMap<number, number>;
  /** The album rows coming across (see `carriedRows`). */
  memberships: LibrarySnapshot["albumSongs"];
}

/** A blank track on a song that's in the same album on both sides. */
function trackFills(context: AlbumsContext, albumTargets: Map<number, number>) {
  const { backup, current, memberships, retag, songTargets } = context;
  const carried = new Set(memberships);
  const mine = new Map(
    current.albumSongs.map((row) => [pairKey(row.albumId, row.songId), row]),
  );
  const fills = new Array<{ albumId: number; songId: number; track: number }>();
  for (const row of backup.albumSongs) {
    if (carried.has(row) || row.track === null) continue;
    const albumId = albumTargets.get(row.albumId) ?? 0;
    const songId = songTargets.get(row.songId) ?? 0;
    const existing = mine.get(pairKey(albumId, songId));
    if (existing?.track !== null) continue;
    existing.track = row.track;
    fills.push({ albumId, songId, track: row.track });
    retag.add(songId);
  }
  return fills;
}

export function planAlbums(context: AlbumsContext) {
  const { backup, current, files, memberships, retag } = context;
  const targets = matchNames(backup.albums, current.albums);
  const tracks = trackFills(context, targets);
  const withSongs = new Set(backup.albumSongs.map((row) => row.albumId));
  const used = new Set(memberships.map((row) => row.albumId));
  const songsOf = groupBy(current.albumSongs, (row) => row.albumId);
  const years = new Map<number, number>();
  const albums = planNamedRows({
    currentRows: current.albums,
    files,
    // One whose songs all matched and kept their albums is the other side of
    // an edit, and the current library won.
    isNeeded: (album) => !withSongs.has(album.id) || used.has(album.id),
    kind: "album",
    onExisting: (album, existing) => {
      const filledCover = files.fillCovers("album", album, existing);
      const fillYear =
        existing.year === null &&
        album.year !== null &&
        !years.has(existing.id);
      if (fillYear && album.year !== null) years.set(existing.id, album.year);
      if (!filledCover && !fillYear) return;
      for (const row of songsOf.get(existing.id) ?? []) retag.add(row.songId);
    },
    onSameName: (album, created) => {
      created.year ??= album.year;
    },
    rows: backup.albums,
    table: "albums",
    targets,
  });
  return {
    albums,
    targets,
    tracks,
    years: [...years].map(([id, year]) => ({ id, year })),
  };
}

/**
 * An album's artists: a new or empty album takes the backup's, and one gaining
 * songs adds the backup's after its own. Any other keeps what it has.
 */
export function carriedAlbumArtists(
  { backup, current, memberships }: AlbumsContext,
  targets: ReadonlyMap<number, number>,
  newAlbumIds: ReadonlySet<number>,
) {
  const gaining = new Set(
    memberships.map((row) => targets.get(row.albumId) ?? 0),
  );
  const credited = new Set(current.albumArtists.map((row) => row.albumId));
  return backup.albumArtists.filter((row) => {
    const albumId = targets.get(row.albumId);
    return (
      albumId !== undefined &&
      (gaining.has(albumId) ||
        newAlbumIds.has(albumId) ||
        !credited.has(albumId))
    );
  });
}
