/**
 * Works out what a backup adds to the library, and changes nothing: the rows
 * to insert, the blanks to fill, the files to move. The rules are in
 * docs/rewrite.md → Restoring a backup. In short, nothing the library has is
 * replaced; what's missing is added, and what's blank is filled in.
 */
import type { PathIndex } from "./file-index.ts";
import type { MergeIds } from "./plan-files.ts";
import type { LibrarySnapshot } from "./types.ts";
import { oneAlbumEach } from "../library/one-album.ts";
import { carriedAlbumArtists, planAlbums } from "./plan-albums.ts";
import { PlanFiles } from "./plan-files.ts";
import { matchNames, newPairs, pairKey, planNamedRows } from "./plan-names.ts";
import { planPlaylists } from "./plan-playlists.ts";
import { carriedRows, planSongs } from "./plan-songs.ts";

interface PlanOptions {
  current: LibrarySnapshot;
  backup: LibrarySnapshot;
  /** Backup song id → the current song it is, from `matchSongs`. */
  matches: ReadonlyMap<number, number>;
  fs: PathIndex;
  /** The AUTOINCREMENT counters (`sqlite_sequence`), so no id is reissued. */
  sequences: Readonly<Partial<MergeIds>>;
}

function highest(
  rows: readonly { id: number }[],
  sequence: number | undefined,
) {
  return rows.reduce((top, row) => Math.max(top, row.id), sequence ?? 0);
}

/** The last id used in each table, whichever of its rows or counter is higher. */
export function lastIds(
  current: LibrarySnapshot,
  sequences: Readonly<Partial<MergeIds>>,
) {
  return {
    albums: highest(current.albums, sequences.albums),
    artists: highest(current.artists, sequences.artists),
    playlists: highest(current.playlists, sequences.playlists),
    songs: highest(current.songs, sequences.songs),
  } satisfies MergeIds;
}

/** Album artists go after an album's own, in the backup's order. */
function appendedAlbumArtists(
  rows: LibrarySnapshot["albumArtists"],
  current: LibrarySnapshot["albumArtists"],
  albumTargets: ReadonlyMap<number, number>,
  artistTargets: ReadonlyMap<number, number>,
) {
  const last = new Map<number, number>();
  for (const row of current) {
    last.set(row.albumId, Math.max(last.get(row.albumId) ?? -1, row.position));
  }
  const sorted = [...rows].sort(
    (a, b) => a.albumId - b.albumId || a.position - b.position,
  );
  const pairs = newPairs(
    sorted,
    current.map((row) => pairKey(row.albumId, row.artistId)),
    (row) => {
      const albumId = albumTargets.get(row.albumId);
      const artistId = artistTargets.get(row.artistId);
      if (albumId === undefined || artistId === undefined) return null;
      return { key: pairKey(albumId, artistId), pair: { albumId, artistId } };
    },
  );
  return pairs.map((pair) => {
    const position = (last.get(pair.albumId) ?? -1) + 1;
    last.set(pair.albumId, position);
    return { ...pair, position };
  });
}

function planArtists(
  { backup, current }: Pick<PlanOptions, "backup" | "current">,
  files: PlanFiles,
  carried: readonly { artistId: number }[],
) {
  const targets = matchNames(backup.artists, current.artists);
  const credited = new Set(
    [...backup.songArtists, ...backup.albumArtists].map((row) => row.artistId),
  );
  const used = new Set(carried.map((row) => row.artistId));
  const artists = planNamedRows({
    currentRows: current.artists,
    files,
    isNeeded: (artist) => !credited.has(artist.id) || used.has(artist.id),
    kind: "artist",
    onExisting: (artist, existing) => {
      files.fillCovers("artist", artist, existing);
    },
    onSameName: () => undefined,
    rows: backup.artists,
    table: "artists",
    targets,
  });
  return { artists, targets };
}

interface JoinRowsOptions {
  current: LibrarySnapshot;
  credits: LibrarySnapshot["songArtists"];
  memberships: LibrarySnapshot["albumSongs"];
  songTargets: ReadonlyMap<number, number>;
  albumTargets: ReadonlyMap<number, number>;
  artistTargets: ReadonlyMap<number, number>;
}

/** The song-artist and album-song rows, in the library's ids. */
function joinRows(options: JoinRowsOptions) {
  const { albumTargets, artistTargets, current, songTargets } = options;
  return {
    albumSongs: newPairs(
      options.memberships,
      current.albumSongs.map((row) => pairKey(row.albumId, row.songId)),
      (row) => {
        const albumId = albumTargets.get(row.albumId);
        const songId = songTargets.get(row.songId);
        if (albumId === undefined || songId === undefined) return null;
        return {
          key: pairKey(albumId, songId),
          pair: { albumId, position: row.position, songId, track: row.track },
        };
      },
    ),
    songArtists: newPairs(
      options.credits,
      current.songArtists.map((row) => pairKey(row.songId, row.artistId)),
      (row) => {
        const songId = songTargets.get(row.songId);
        const artistId = artistTargets.get(row.artistId);
        if (songId === undefined || artistId === undefined) return null;
        return {
          key: pairKey(songId, artistId),
          pair: { artistId, position: row.position, songId },
        };
      },
    ),
  };
}

export function planMerge(options: PlanOptions) {
  const { backup, current, fs, matches, sequences } = options;
  const files = new PlanFiles(fs, lastIds(current, sequences));
  const retag = new Set<number>();
  const song = planSongs({ backup, current, files, fs, matches, retag });
  const carry = { matches, retag };
  const credits = carriedRows(
    backup.songArtists,
    current.songArtists,
    song.targets,
    carry,
  );
  // A backup from before a song had one album can still have several.
  const covered = new Set(
    backup.albums
      .filter((row) => row.artworkVersion !== null)
      .map((row) => row.id),
  );
  const memberships = oneAlbumEach(
    carriedRows(backup.albumSongs, current.albumSongs, song.targets, carry),
    (id) => covered.has(id),
  );
  const albumContext = {
    backup,
    current,
    files,
    memberships,
    retag,
    songTargets: song.targets,
  };
  const album = planAlbums(albumContext);
  const albumArtistRows = carriedAlbumArtists(
    albumContext,
    album.targets,
    new Set(album.albums.map((row) => row.id)),
  );
  const artist = planArtists(options, files, [...credits, ...albumArtistRows]);
  const playlist = planPlaylists(options, files, song.targets);
  const fill = {
    artwork: files.artworkFills,
    audio: song.audioFills,
    retag: [...retag],
    tracks: album.tracks,
    years: album.years,
  };
  const songsFilled = new Set(
    [...credits, ...memberships]
      .filter((row) => matches.has(row.songId))
      .map((row) => song.targets.get(row.songId)),
  );
  return {
    ...joinRows({
      albumTargets: album.targets,
      artistTargets: artist.targets,
      credits,
      current,
      memberships,
      songTargets: song.targets,
    }),
    addedFiles: files.addedFiles,
    albumArtists: appendedAlbumArtists(
      albumArtistRows,
      current.albumArtists,
      album.targets,
      artist.targets,
    ),
    albums: album.albums,
    artists: artist.artists,
    fill,
    moves: files.moves,
    newFolders: [...files.newFolders],
    playlistAppends: playlist.playlistAppends,
    playlists: playlist.playlists,
    reservedIds: files.ids,
    songs: song.songs,
    summary: {
      albums: album.albums.length,
      artists: artist.artists.length,
      filled:
        fill.artwork.length +
        fill.audio.length +
        fill.tracks.length +
        fill.years.length +
        songsFilled.size,
      playlists: playlist.playlists.length,
      playlistsExtended: playlist.extended,
      songs: song.songs.length,
    },
  };
}

export type MergePlan = ReturnType<typeof planMerge>;

/** Whether a plan does nothing: the backup was already all here. */
export function isEmptyPlan(plan: MergePlan) {
  const { fill } = plan;
  return [
    plan.songs,
    plan.artists,
    plan.albums,
    plan.playlists,
    plan.songArtists,
    plan.albumSongs,
    plan.albumArtists,
    plan.playlistAppends,
    plan.moves,
    fill.artwork,
    fill.audio,
    fill.tracks,
    fill.years,
  ].every((rows) => rows.length === 0);
}
