import type { LibrarySongDetail } from "./library-song-detail-types-service";

export type LibrarySongEditFormState = {
  albumNames: string;
  artistNames: string;
  coverImage: {
    dataUrl: string;
    fileName: string;
  } | null;
  title: string;
};

export const buildLibrarySongEditFormState = (
  detail: LibrarySongDetail,
): LibrarySongEditFormState => ({
  albumNames: detail.albumLabel === "Unknown" ? "" : detail.albumLabel,
  artistNames: detail.artistLabel === "Unknown" ? "" : detail.artistLabel,
  coverImage: null,
  title: detail.isMissing ? "" : detail.title,
});

export type LibrarySongEditCoverImage = NonNullable<
  LibrarySongEditFormState["coverImage"]
>;
