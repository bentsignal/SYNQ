import type { LibrarySongDetail } from "./library-song-detail-types-service";

export const toLibrarySongDetailPlaybackItem = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) => ({
  album: detail.albumLabel,
  artist: detail.artistLabel,
  duration: detail.duration,
  id: songId,
  pathToFile: detail.pathToFile,
  title: detail.title,
});

export type LibrarySongDetailPlaybackItem = ReturnType<
  typeof toLibrarySongDetailPlaybackItem
>;

export const toLibrarySongExportItem = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) => ({
  id: songId,
  pathToFile: detail.pathToFile,
  title: detail.title,
});

export type LibrarySongExportItem = ReturnType<typeof toLibrarySongExportItem>;
