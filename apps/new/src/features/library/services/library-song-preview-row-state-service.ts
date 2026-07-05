import type { LibrarySongPreview } from "./library-song-preview-service";

export const getLibrarySongPreviewRowState = ({
  activeTrackId,
  song,
}: {
  activeTrackId: number | null;
  song: LibrarySongPreview;
}) => ({
  canPlay: song.pathToFile !== null,
  isActive: activeTrackId === song.id,
});
