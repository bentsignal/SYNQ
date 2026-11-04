import { artworkRef, coverAlbum } from "@synq/db";

import type { Pick } from "./pick.ts";
import { pickKey } from "./pick.ts";

/** What in a song's edit sheet decides whose artwork it's editing. */
interface SongArtworkChoice {
  albums: readonly Pick[];
  useAlbumArtwork: boolean;
}

/**
 * The album whose artwork the sheet edits, by the rule the library shows it by
 * (`coverAlbum`), with its cover as saved now; undefined when it's editing the
 * song's own: the switch is off, or the song has no albums.
 */
export function artworkAlbum({ albums, useAlbumArtwork }: SongArtworkChoice) {
  if (!useAlbumArtwork) return undefined;
  const album = coverAlbum(
    albums.map((pick) => ({
      artworkVersion: "id" in pick ? (pick.artworkVersion ?? null) : null,
      pick,
    })),
  );
  if (album === undefined) return undefined;
  const { artworkVersion, pick } = album;
  return {
    cover: "id" in pick ? artworkRef("album", pick.id, artworkVersion) : null,
    key: pickKey(pick),
    name: pick.name,
  };
}

/**
 * Whether a change to the sheet moves its artwork edit from one thing to
 * another. A photo picked for one album must not land on another album, or
 * replace or remove the wrong cover at Done, so the sheet drops it.
 */
export function changesArtworkTarget(
  before: SongArtworkChoice,
  after: SongArtworkChoice,
) {
  return targetKey(before) !== targetKey(after);
}

function targetKey(choice: SongArtworkChoice) {
  return artworkAlbum(choice)?.key ?? "song";
}
