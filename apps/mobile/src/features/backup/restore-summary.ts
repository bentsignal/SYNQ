import type { MergeSummary } from "@synq/db/merge";

function count(n: number, one: string, many: string) {
  return `${String(n)} ${n === 1 ? one : many}`;
}

function listed(parts: readonly string[]) {
  if (parts.length <= 2) return parts.join(" and ");
  return `${parts.slice(0, -1).join(", ")}, and ${String(parts.at(-1))}`;
}

/** What the alert after a restore says, from what the merge added. */
export function restoreSummary(summary: MergeSummary) {
  const added = [
    summary.songs > 0 ? count(summary.songs, "song", "songs") : null,
    summary.albums > 0 ? count(summary.albums, "album", "albums") : null,
    summary.artists > 0 ? count(summary.artists, "artist", "artists") : null,
    summary.playlists > 0
      ? count(summary.playlists, "playlist", "playlists")
      : null,
  ].filter((part) => part !== null);
  const sentences = new Array<string>();
  if (added.length > 0) sentences.push(`Added ${listed(added)}.`);
  if (summary.playlistsExtended > 0) {
    sentences.push(
      `Added songs to ${count(summary.playlistsExtended, "playlist", "playlists")}.`,
    );
  }
  if (summary.filled > 0) sentences.push("Filled in missing details.");
  return sentences.length === 0
    ? {
        message: "Everything in this backup is already in your library.",
        title: "Nothing to Add",
      }
    : { message: sentences.join(" "), title: "Backup Restored" };
}
