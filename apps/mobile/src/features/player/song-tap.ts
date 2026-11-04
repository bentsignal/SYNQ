import type { PlaybackStatus } from "@synq/audio";

import type { PlaybackSource } from "./types.ts";

function sameSource(a: PlaybackSource, b: PlaybackSource) {
  return (
    a.kind === b.kind && ("id" in a ? a.id : null) === ("id" in b ? b.id : null)
  );
}

/**
 * What a tap on a song does, given what's playing. A song that's already on
 * carries on where it is: from the list it's playing from, nothing else
 * changes; from another list, that list becomes what plays next. A song that
 * finished or failed isn't on any more, so it starts again.
 */
export function songTapEffect({
  chosen,
  current,
  status,
}: {
  chosen: { songId: number; source: PlaybackSource } | null;
  current: { songId: number; source: PlaybackSource | null } | null;
  status: PlaybackStatus;
}) {
  if (chosen === null || current?.songId !== chosen.songId) return "start";
  if (status !== "playing" && status !== "loading" && status !== "paused") {
    return "start";
  }
  return current.source !== null && sameSource(current.source, chosen.source)
    ? "carry-on"
    : "carry-on-with-new-list";
}
