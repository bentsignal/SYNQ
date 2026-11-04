import type { ArtworkChange } from "./artwork-change";
import type { Pick } from "./pick";
import { createDraft } from "./draft";

/** What Edit Info's screens share until Done saves it. */
export interface SongDraft {
  title: string;
  artists: readonly Pick[];
  /** In album order: the first is the song's primary album. */
  albums: readonly Pick[];
  artwork: ArtworkChange;
}

export const draft = createDraft<SongDraft>("song");
