import type { ArtworkChange } from "./artwork-change";
import type { Pick } from "./pick";
import { KEEP_ARTWORK } from "./artwork-change";
import { createDraft } from "./draft";
import { changesArtworkTarget } from "./song-artwork";

/** What Edit Info's screens share until Done saves it. */
export interface SongDraft {
  title: string;
  artists: readonly Pick[];
  /** The song's album, or none: one at most (`ChoiceList`'s `single`). */
  albums: readonly Pick[];
  /** Applies to the album's cover or the song's own: see `artworkAlbum`. */
  artwork: ArtworkChange;
  useAlbumArtwork: boolean;
}

export const draft = createDraft<SongDraft>("song");

/** Sets the song's albums, dropping a photo meant for what it no longer edits. */
export function chooseAlbums(albums: readonly Pick[]) {
  draft.update((current) => ({
    albums,
    artwork: changesArtworkTarget(current, { ...current, albums })
      ? KEEP_ARTWORK
      : current.artwork,
  }));
}
