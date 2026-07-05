import type { LibrarySongPreview } from "./library-song-preview-service";

export type LibrarySongPreviewPlaybackItem = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
};

export const toLibrarySongPlaybackItem = (
  song: LibrarySongPreview,
): LibrarySongPreviewPlaybackItem => ({
  album: song.album,
  artist: song.artist,
  duration: song.duration,
  id: song.id,
  pathToFile: song.pathToFile,
  title: song.title,
});
