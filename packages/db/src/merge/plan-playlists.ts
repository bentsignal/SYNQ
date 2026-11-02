/**
 * Playlists. Liked Songs is whatever each side calls it, others go by name; a
 * match keeps its order and appends the backup's other songs, in its order.
 */
import type { Playlist } from "../schema.ts";
import type { PlanFiles } from "./plan-files.ts";
import type { LibrarySnapshot } from "./types.ts";
import { NameMatcher } from "../library/matching.ts";
import { cleanName } from "../library/text.ts";
import { groupBy } from "./plan-helpers.ts";

/** Can't be a playlist's name, since names are cleaned. */
const LIKED_KEY = "\0liked";

export function planPlaylists(
  { backup, current }: { backup: LibrarySnapshot; current: LibrarySnapshot },
  files: PlanFiles,
  songTargets: ReadonlyMap<number, number>,
) {
  const liked = current.playlists.find((p) => p.kind === "liked");
  const matcher = new NameMatcher(
    current.playlists.filter((p) => p.kind === "user"),
  );
  const created = new Map<string, Playlist>();
  function target(playlist: Playlist) {
    const isLiked = playlist.kind === "liked";
    const existing = isLiked ? liked : matcher.find(playlist.name);
    if (existing !== undefined) {
      files.fillCovers("playlist", playlist, existing);
      return existing.id;
    }
    const key = isLiked ? LIKED_KEY : cleanName(playlist.name);
    const same = created.get(key);
    if (same !== undefined) return same.id;
    const id = files.allocate("playlists", "playlist");
    created.set(key, {
      ...playlist,
      artworkVersion: files.newCovers("playlist", playlist, id),
      id,
    });
    return id;
  }

  const inPlaylist = new Map<number, Set<number>>();
  for (const [id, rows] of groupBy(
    current.playlistSongs,
    (r) => r.playlistId,
  )) {
    inPlaylist.set(id, new Set(rows.map((row) => row.songId)));
  }
  const backupRows = groupBy(backup.playlistSongs, (r) => r.playlistId);
  const appends = new Map<number, number[]>();
  for (const playlist of backup.playlists) {
    const id = target(playlist);
    const present = inPlaylist.get(id) ?? new Set<number>();
    inPlaylist.set(id, present);
    const rows = [...(backupRows.get(playlist.id) ?? [])].sort(
      (a, b) => a.position - b.position,
    );
    for (const row of rows) {
      const songId = songTargets.get(row.songId);
      if (songId === undefined || present.has(songId)) continue;
      present.add(songId);
      const list = appends.get(id);
      if (list === undefined) appends.set(id, [songId]);
      else list.push(songId);
    }
  }
  const currentIds = new Set(current.playlists.map((p) => p.id));
  return {
    extended: [...appends.keys()].filter((id) => currentIds.has(id)).length,
    playlistAppends: [...appends].map(([playlistId, songIds]) => ({
      playlistId,
      songIds,
    })),
    playlists: [...created.values()],
  };
}
