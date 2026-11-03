import type { ArtworkKind } from "@synq/db";

import { failed } from "~/features/library/actions";
import { removeArtwork, writeArtwork } from "~/features/library/files";

/** What an edit sheet will do to the artwork when it's saved. */
export type ArtworkChange =
  | { kind: "keep" }
  | { kind: "picked"; uri: string; width: number }
  | { kind: "removed" };

export const KEEP_ARTWORK = { kind: "keep" } as const satisfies ArtworkChange;

/**
 * Saves an artwork change after its sheet has closed, reporting a failure
 * with an alert. Album and song covers mark their songs modified (setArtwork).
 */
export function saveArtworkChange(
  change: ArtworkChange,
  kind: ArtworkKind,
  id: number,
) {
  if (change.kind === "keep") return;
  if (change.kind === "removed") {
    try {
      removeArtwork(kind, id);
    } catch {
      failed("Couldn't Remove Artwork");
    }
    return;
  }
  void writeArtwork({ id, kind, uri: change.uri, width: change.width }).catch(
    () => failed("Couldn't Save Artwork"),
  );
}
