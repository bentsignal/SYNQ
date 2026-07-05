export const getLibraryCollectionPreviewErrors = ({
  albumError,
  artistError,
  playlistError,
}: {
  albumError: unknown;
  artistError: unknown;
  playlistError: unknown;
}) => [playlistError, albumError, artistError].filter(Boolean);

export const getLibraryCollectionPreviewUpdatedAt = ({
  albumUpdatedAt,
  artistUpdatedAt,
  playlistUpdatedAt,
}: {
  albumUpdatedAt: Date | null | undefined;
  artistUpdatedAt: Date | null | undefined;
  playlistUpdatedAt: Date | null | undefined;
}) =>
  Math.max(
    playlistUpdatedAt?.getTime() ?? 0,
    albumUpdatedAt?.getTime() ?? 0,
    artistUpdatedAt?.getTime() ?? 0,
  );
