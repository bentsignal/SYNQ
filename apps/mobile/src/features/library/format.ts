/** Words for library counts and durations, as Apple Music writes them. */
import type { AlbumListItem, SongListItem } from "@synq/db";

function plural(count: number, one: string, many: string) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;
}

/** "1 song", "1,204 songs". */
export function songCount(count: number) {
  return plural(count, "song", "songs");
}

export function albumCount(count: number) {
  return plural(count, "album", "albums");
}

/** A collection's total length: "52 minutes", "1 hour, 4 minutes". */
export function totalDuration(durationMs: number) {
  const minutes = Math.round(durationMs / 60_000);
  if (minutes < 60) return plural(minutes, "minute", "minutes");
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourText = plural(hours, "hour", "hours");
  return rest === 0
    ? hourText
    : `${hourText}, ${plural(rest, "minute", "minutes")}`;
}

/** "14 songs, 52 minutes", or just "No songs". */
export function collectionSummary(count: number, durationMs: number) {
  if (count === 0) return "No songs";
  return `${songCount(count)}, ${totalDuration(durationMs)}`;
}

/** A track's time: "3:07", "1:02:45". */
export function trackTime(durationMs: number) {
  const seconds = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${secs}`
    : `${minutes}:${secs}`;
}

/** Names joined for a row: "Mara Lind, Kestrel". */
export function names(credits: readonly { name: string }[]) {
  return credits.map((credit) => credit.name).join(", ");
}

/** Non-empty parts joined with a middle dot: "Kestrel · Northbound". */
export function dotted(...parts: (string | number | null | undefined)[]) {
  return parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .join(" · ");
}

/** The unknown artist's name where a song credits nobody. */
export const UNKNOWN_ARTIST = "Unknown Artist";

/** `artist · album` under a song's title. */
export function songDetail(song: SongListItem) {
  return dotted(names(song.artists) || UNKNOWN_ARTIST, song.albums[0]?.name);
}

/** "Mara Lind · 2023" under an album's name. */
export function albumDetail(album: AlbumListItem) {
  return dotted(names(album.artists), album.year);
}
