import { draft as albumDraft } from "./album-draft";
import { draft as songDraft } from "./song-draft";

/**
 * The edit sheet under a create sheet that one of its lists opened. What the
 * create sheet makes is already saved, and joins that sheet's choices.
 */
export type PickFor = "album" | "song";

interface Created {
  id: number;
  name: string;
}

export function pickNewArtist(pickFor: PickFor, { id, name }: Created) {
  const pick = { id, name };
  if (pickFor === "album") {
    albumDraft.update(({ artists }) => ({ artists: [...artists, pick] }));
  } else {
    songDraft.update(({ artists }) => ({ artists: [...artists, pick] }));
  }
}

/** Only a song's Albums list makes an album. */
export function pickNewAlbum({ id, name }: Created) {
  const pick = { id, name };
  songDraft.update(({ albums }) => ({ albums: [...albums, pick] }));
}
