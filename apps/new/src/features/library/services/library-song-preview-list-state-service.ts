import { getLibrarySongPreviewEmptyState } from "./library-song-preview-empty-state-service";
import { getLibrarySongPreviewDetailHref } from "./library-song-preview-navigation-service";
import { getLibrarySongPreviewRowState } from "./library-song-preview-row-state-service";
import type { LibrarySongPreview } from "./library-song-preview-service";

export const getLibrarySongPreviewListState = ({
  activeTrackId,
  songs,
}: {
  activeTrackId: number | null;
  songs: LibrarySongPreview[];
}) => ({
  emptyState: getLibrarySongPreviewEmptyState(),
  meta: `${songs.length} shown`,
  rows: songs.map((song) => ({
    detailHref: getLibrarySongPreviewDetailHref(song),
    rowState: getLibrarySongPreviewRowState({ activeTrackId, song }),
    song,
  })),
  title: "Recent Songs",
});

export type LibrarySongPreviewRowViewState = ReturnType<
  typeof getLibrarySongPreviewListState
>["rows"][number];

export type LibrarySongPreviewListState = ReturnType<
  typeof getLibrarySongPreviewListState
>;
