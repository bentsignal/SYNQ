/**
 * Songs, and what their rows bring along: a new song gets a fresh id and
 * folder; a match keeps its own row, and only its blanks fill in.
 */
import type { Song } from "../schema.ts";
import type { PathIndex } from "./file-index.ts";
import type { PlanFiles } from "./plan-files.ts";
import type { LibrarySnapshot } from "./types.ts";
import { songFilePath } from "./match-songs.ts";
import { songFileIn } from "./plan-files.ts";

export interface SongsContext {
  current: LibrarySnapshot;
  backup: LibrarySnapshot;
  /** Backup song id → the current song it is, from `matchSongs`. */
  matches: ReadonlyMap<number, number>;
  fs: PathIndex;
  files: PlanFiles;
  /** Existing songs whose tags changed, so their next export retags them. */
  retag: Set<number>;
}

function fillExisting(
  context: SongsContext,
  song: Song,
  existing: Song,
  audio: string | null,
) {
  const { files, fs, retag } = context;
  if (files.fillCovers("song", song, existing)) retag.add(existing.id);
  const path = songFilePath(existing);
  const hasAudio = path !== null && fs.exists("library", path);
  if (audio === null || hasAudio) return null;
  const filePath = files.fillAudio(existing.id, audio);
  return filePath === null ? null : { filePath, id: existing.id };
}

export function planSongs(context: SongsContext) {
  const { backup, current, files, fs, matches } = context;
  const currentSongs = new Map(current.songs.map((song) => [song.id, song]));
  const targets = new Map<number, number>();
  const songs = new Array<Song>();
  const audioFills = new Array<{ id: number; filePath: string }>();
  for (const song of backup.songs) {
    const path = songFilePath(song);
    const audio = path !== null && fs.exists("backup", path) ? path : null;
    const existing = currentSongs.get(matches.get(song.id) ?? 0);
    if (existing !== undefined) {
      targets.set(song.id, existing.id);
      const fill = fillExisting(context, song, existing, audio);
      if (fill !== null) audioFills.push(fill);
      continue;
    }
    const id = files.allocate("songs", "song");
    targets.set(song.id, id);
    const filePath = audio === null ? null : songFileIn(id, audio);
    if (audio !== null && filePath !== null) files.move(audio, filePath);
    songs.push({
      ...song,
      artworkVersion: files.newCovers("song", song, id),
      filePath,
      id,
    });
  }
  return { audioFills, songs, targets };
}

/**
 * The backup's rows about songs that come across: all of a new song's, and
 * on a match, only the kind it has none of. It wins otherwise.
 */
export function carriedRows<Row extends { songId: number }>(
  rows: readonly Row[],
  currentRows: readonly { songId: number }[],
  targets: ReadonlyMap<number, number>,
  context: Pick<SongsContext, "matches" | "retag">,
) {
  const hasSome = new Set(currentRows.map((row) => row.songId));
  return rows.filter((row) => {
    const target = targets.get(row.songId);
    if (target === undefined) return false;
    if (!context.matches.has(row.songId)) return true;
    if (hasSome.has(target)) return false;
    context.retag.add(target);
    return true;
  });
}
