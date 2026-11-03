/** Albums, their tracks, and their artists. See `planMerge`. */
import type { PlanFiles } from "./plan-files.ts";
import type { LibrarySnapshot } from "./types.ts";
import { cleanName, nameKey } from "../library/text.ts";
import { groupBy } from "./plan-helpers.ts";
import { pairKey, planNamedRows } from "./plan-names.ts";

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

/** Each album's artists, as name keys: ids mean nothing across two libraries. */
function albumArtistKeys(library: LibrarySnapshot) {
  const names = new Map(
    library.artists.map((artist) => [artist.id, nameKey(artist.name)]),
  );
  const keys = new Map<number, Set<string>>();
  for (const row of library.albumArtists) {
    const name = names.get(row.artistId);
    if (name === undefined) continue;
    const set = keys.get(row.albumId) ?? new Set<string>();
    set.add(name);
    keys.set(row.albumId, set);
  }
  return keys;
}

const NO_ARTISTS = new Set<string>();

function inCommon(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  return [...a].filter((name) => b.has(name)).length;
}

/**
 * Each backup album's matching current album, by the rule import uses
 * (docs/rewrite.md → Same-named albums): the same name and artists in common.
 * A song on both says they're one album whatever their artists say: that's a
 * renamed artist on one side, like Bjork to Björk. An album with no artists
 * has nothing to say otherwise, so it matches on name alone.
 */
function matchAlbums(context: AlbumsContext) {
  const { backup, current, songTargets } = context;
  const backupArtists = albumArtistKeys(backup);
  const currentArtists = albumArtistKeys(current);
  const sameName = new Map<string, LibrarySnapshot["albums"]>();
  for (const album of [...current.albums].sort((a, b) => a.id - b.id)) {
    const key = nameKey(album.name);
    sameName.set(key, [...(sameName.get(key) ?? []), album]);
  }
  const songsOn = new Set(
    current.albumSongs.map((row) => pairKey(row.albumId, row.songId)),
  );
  const backupSongs = groupBy(backup.albumSongs, (row) => row.albumId);
  const targets = new Map<number, number>();
  for (const album of backup.albums) {
    const artists = backupArtists.get(album.id) ?? NO_ARTISTS;
    const exact = cleanName(album.name);
    const candidates = (sameName.get(nameKey(album.name)) ?? []).map(
      (candidate) => {
        const theirs = currentArtists.get(candidate.id) ?? NO_ARTISTS;
        const common = inCommon(artists, theirs);
        return {
          common,
          exact: cleanName(candidate.name) === exact,
          id: candidate.id,
          noArtists: theirs.size === 0,
          same: common === artists.size && common === theirs.size,
          sharesSong: (backupSongs.get(album.id) ?? []).some((row) =>
            songsOn.has(
              pairKey(candidate.id, songTargets.get(row.songId) ?? 0),
            ),
          ),
        };
      },
    );
    const usable = candidates.filter(
      (candidate) =>
        candidate.sharesSong ||
        candidate.common > 0 ||
        candidate.noArtists ||
        artists.size === 0,
    );
    usable.sort(
      (a, b) =>
        Number(b.sharesSong) - Number(a.sharesSong) ||
        Number(b.same) - Number(a.same) ||
        b.common - a.common ||
        Number(b.noArtists) - Number(a.noArtists) ||
        Number(b.exact) - Number(a.exact) ||
        a.id - b.id,
    );
    const [best] = usable;
    if (best !== undefined) targets.set(album.id, best.id);
  }
  return { backupArtists, targets };
}

export function planAlbums(context: AlbumsContext) {
  const { backup, current, files, memberships, retag } = context;
  const { backupArtists, targets } = matchAlbums(context);
  const tracks = trackFills(context, targets);
  const withSongs = new Set(backup.albumSongs.map((row) => row.albumId));
  const used = new Set(memberships.map((row) => row.albumId));
  const songsOf = groupBy(current.albumSongs, (row) => row.albumId);
  const years = new Map<number, number>();
  const albums = planNamedRows({
    currentRows: current.albums,
    files,
    // Two new albums are one only by the same name and the same artists.
    identity: (album) =>
      JSON.stringify([
        cleanName(album.name),
        [...(backupArtists.get(album.id) ?? NO_ARTISTS)].sort(),
      ]),
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
