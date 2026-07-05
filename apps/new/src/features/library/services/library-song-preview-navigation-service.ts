import type { LibrarySongPreview } from "./library-song-preview-service";

export type LibrarySongPreviewHref =
  | "/(tabs)/import"
  | "/player"
  | `/(tabs)/library/song/${number}`;

export const getLibrarySongPreviewDetailHref = (
  song: LibrarySongPreview,
): LibrarySongPreviewHref => `/(tabs)/library/song/${song.id}`;

export const getLibrarySongPreviewPlayerHref = (): LibrarySongPreviewHref =>
  "/player";
