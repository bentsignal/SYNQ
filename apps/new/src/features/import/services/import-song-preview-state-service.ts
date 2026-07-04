import { getImportSongEditHref } from "./import-song-edit-navigation-service";
import type { ImportSongDraft } from "../types/import-session";

export const getImportSongPreviewEmptyState = () => ({
  body: "Choose songs to review them before saving.",
  title: "No songs staged",
});

export type ImportSongPreviewEmptyState = ReturnType<
  typeof getImportSongPreviewEmptyState
>;

export const getImportSongPreviewListState = ({
  songs,
}: {
  songs: ImportSongDraft[];
}) => ({
  emptyState: getImportSongPreviewEmptyState(),
  rows: songs.map((song) => ({
    editHref: getImportSongEditHref({ songId: song.id }),
    song,
  })),
});

export type ImportSongPreviewRowState = ReturnType<
  typeof getImportSongPreviewListState
>["rows"][number];
