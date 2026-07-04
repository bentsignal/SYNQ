export const getImportSongPreviewEmptyState = () => ({
  body: "Choose songs to review them before saving.",
  title: "No songs staged",
});

export type ImportSongPreviewEmptyState = ReturnType<
  typeof getImportSongPreviewEmptyState
>;
