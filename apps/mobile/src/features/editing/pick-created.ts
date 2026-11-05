import { getAlbum } from "@synq/db";

import { libraryDb } from "~/features/library/database";
import { draft as albumDraft } from "./album-draft";
import { chooseAlbums, draft as songDraft } from "./song-draft";

/**
 * The edit sheet under a create sheet that one of its lists opened. What the
 * create sheet makes is already saved, and joins that sheet's choices.
 */
export type PickFor = "album" | "song";

export function pickNewArtist(
  pickFor: PickFor,
  { id, name }: { id: number; name: string },
) {
  const pick = { id, name };
  if (pickFor === "album") {
    albumDraft.update(({ artists }) => ({ artists: [...artists, pick] }));
  } else {
    songDraft.update(({ artists }) => ({ artists: [...artists, pick] }));
  }
}

/** The album as saved now, with whether it has a cover yet. */
function albumPick(id: number) {
  const album = getAlbum(libraryDb(), id);
  if (album === null) return undefined;
  return {
    artworkVersion: album.artwork?.version ?? null,
    id,
    name: album.name,
  };
}

/** Only a song's Album list makes an album, and it becomes the song's one. */
export function pickNewAlbum(id: number) {
  const pick = albumPick(id);
  if (pick !== undefined) chooseAlbums([pick]);
}

/** Its photo is written after its sheet closes, so the song's sheet catches up. */
export function refreshPickedAlbum(id: number) {
  const pick = albumPick(id);
  if (pick === undefined) return;
  chooseAlbums(
    songDraft
      .get()
      .albums.map((other) => ("id" in other && other.id === id ? pick : other)),
  );
}
