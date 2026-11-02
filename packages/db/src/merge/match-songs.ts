/**
 * Which backup songs are already in the library. Ids can't say: a backup's
 * come from another install, where song 7 may be a different song. See
 * docs/rewrite.md → Restoring a backup.
 *
 * When both sides have the audio file, the file's bytes decide (size, then
 * hash, so only same-sized files get read). 3.0 and 2.5.2 keep audio exactly
 * as imported, and edits only change the database, so the same song edited
 * differently on each side still matches. Only when a side has no file is
 * there nothing to compare, and then the title, duration, and artists have
 * to agree. Two files that differ are never the same song, even with the
 * same tags: wrongly merging them would lose one, and a duplicate loses
 * nothing.
 */
import type { Song } from "../schema.ts";
import type { LibrarySnapshot, MergeFileSystem, MergeSide } from "./types.ts";
import { nameKey } from "../library/text.ts";

/** 2.5.2 floored durations to whole seconds. */
const DURATION_TOLERANCE_MS = 1000;

/** A song's path if it stays inside `library/`; a backup's rows aren't trusted. */
export function songFilePath(song: Pick<Song, "filePath">) {
  const path = song.filePath;
  if (path === null) return null;
  const segments = path.split("/");
  const safe =
    segments.length >= 3 &&
    segments[0] === "library" &&
    segments.every((part) => part !== "" && part !== "." && part !== "..");
  return safe ? path : null;
}

interface MatchOptions {
  current: LibrarySnapshot;
  backup: LibrarySnapshot;
  fs: MergeFileSystem;
  /** Fraction of the bytes to compare that have been read. */
  onProgress?: (fraction: number) => void;
  /** Called between files, to let the UI run if it's been waiting. */
  pause?: () => Promise<void>;
}

type Sizes = ReadonlyMap<number, number | null>;

async function readSizes(
  options: MatchOptions,
  side: MergeSide,
  songs: readonly Song[],
) {
  const sizes = new Map<number, number | null>();
  for (const song of songs) {
    const path = songFilePath(song);
    const size = path === null ? null : options.fs.size(side, path);
    // An empty file has no audio to compare, and every empty file would match.
    sizes.set(song.id, size === 0 ? null : size);
    await options.pause?.();
  }
  return sizes;
}

/** The songs on one side whose size also appears on the other: the only ones worth reading. */
function comparable(songs: readonly Song[], mine: Sizes, theirs: Sizes) {
  const other = new Set(theirs.values());
  return songs.filter((song) => {
    const size = mine.get(song.id) ?? null;
    return size !== null && other.has(size);
  });
}

function totalSize(songs: readonly Song[], sizes: Sizes) {
  return songs.reduce((sum, song) => sum + (sizes.get(song.id) ?? 0), 0);
}

/** One side's comparable songs grouped by what's in their files. */
async function groupByContent(
  options: MatchOptions,
  {
    side,
    sizes,
    songs,
  }: { side: MergeSide; songs: readonly Song[]; sizes: Sizes },
  onRead: (bytes: number) => void,
) {
  const groups = new Map<string, Song[]>();
  for (const song of songs) {
    const path = songFilePath(song);
    const size = sizes.get(song.id) ?? 0;
    if (path === null) continue;
    const key = `${String(size)}:${await options.fs.hash(side, path)}`;
    const group = groups.get(key);
    if (group === undefined) groups.set(key, [song]);
    else group.push(song);
    onRead(size);
    await options.pause?.();
  }
  return groups;
}

/** The pairs found so far, each current song taken once. */
class Pairs {
  readonly matches = new Map<number, number>();
  readonly #taken = new Set<number>();

  add(backupId: number, currentId: number) {
    this.matches.set(backupId, currentId);
    this.#taken.add(currentId);
  }

  isFree(currentId: number) {
    return !this.#taken.has(currentId);
  }
}

/**
 * The same file can be in a library twice, under different titles. Each copy
 * pairs with one copy, same titles first, so restoring keeps every copy and
 * restoring again adds none.
 */
function pairCopies(
  pairs: Pairs,
  copies: readonly Song[],
  candidates: readonly Song[],
) {
  const unpaired = new Array<Song>();
  for (const song of copies) {
    const same = candidates.find(
      (c) => pairs.isFree(c.id) && nameKey(c.title) === nameKey(song.title),
    );
    if (same === undefined) unpaired.push(song);
    else pairs.add(song.id, same.id);
  }
  for (const song of unpaired) {
    const any = candidates.find((c) => pairs.isFree(c.id));
    if (any !== undefined) pairs.add(song.id, any.id);
  }
}

function artistKeys(library: LibrarySnapshot) {
  const names = new Map(library.artists.map((a) => [a.id, nameKey(a.name)]));
  const keys = new Map<number, Set<string>>();
  for (const { songId, artistId } of library.songArtists) {
    const name = names.get(artistId);
    if (name === undefined) continue;
    const set = keys.get(songId) ?? new Set<string>();
    set.add(name);
    keys.set(songId, set);
  }
  return keys;
}

function shareOneOrBlank(
  left: Set<string> | undefined,
  right: Set<string> | undefined,
) {
  if (left === undefined || right === undefined) return true;
  return [...left].some((name) => right.has(name));
}

function sameDuration(left: number, right: number) {
  return (
    left === 0 || right === 0 || Math.abs(left - right) <= DURATION_TOLERANCE_MS
  );
}

/** Only pairs where a side has no file: otherwise the bytes already said no. */
function pairByMetadata(
  pairs: Pairs,
  { backup, current }: MatchOptions,
  backupSizes: Sizes,
  currentSizes: Sizes,
) {
  const backupArtists = artistKeys(backup);
  const currentArtists = artistKeys(current);
  const byTitle = new Map<string, Song[]>();
  for (const song of current.songs) {
    const key = nameKey(song.title);
    const list = byTitle.get(key);
    if (list === undefined) byTitle.set(key, [song]);
    else list.push(song);
  }
  for (const song of backup.songs) {
    if (pairs.matches.has(song.id)) continue;
    const hasFile = (backupSizes.get(song.id) ?? null) !== null;
    const found = byTitle.get(nameKey(song.title))?.find((candidate) => {
      const bothHaveFiles =
        hasFile && (currentSizes.get(candidate.id) ?? null) !== null;
      return (
        pairs.isFree(candidate.id) &&
        !bothHaveFiles &&
        sameDuration(song.durationMs, candidate.durationMs) &&
        shareOneOrBlank(
          backupArtists.get(song.id),
          currentArtists.get(candidate.id),
        )
      );
    });
    if (found !== undefined) pairs.add(song.id, found.id);
  }
}

/** The current song each matching backup song is: backup id → current id. */
export async function matchSongs(options: MatchOptions) {
  const { backup, current, onProgress } = options;
  const backupSizes = await readSizes(options, "backup", backup.songs);
  const currentSizes = await readSizes(options, "library", current.songs);
  const backupSongs = comparable(backup.songs, backupSizes, currentSizes);
  const currentSongs = comparable(current.songs, currentSizes, backupSizes);
  const total =
    totalSize(backupSongs, backupSizes) + totalSize(currentSongs, currentSizes);
  let read = 0;
  function onRead(bytes: number) {
    read += bytes;
    onProgress?.(read / total);
  }
  const backupGroups = await groupByContent(
    options,
    { side: "backup", sizes: backupSizes, songs: backupSongs },
    onRead,
  );
  const currentGroups = await groupByContent(
    options,
    { side: "library", sizes: currentSizes, songs: currentSongs },
    onRead,
  );
  const pairs = new Pairs();
  for (const [key, copies] of backupGroups) {
    pairCopies(pairs, copies, currentGroups.get(key) ?? []);
  }
  pairByMetadata(pairs, options, backupSizes, currentSizes);
  return pairs.matches;
}
