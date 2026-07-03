import type { LibrarySongDetail } from "./library-song-detail-service";
import { toLibrarySongExportItem } from "./library-song-playback-state-service";

export type LibrarySongCommandDependencies = {
  deleteLibrarySong: (songId: number) => Promise<void>;
  setLibrarySongLiked: (params: {
    liked: boolean;
    songId: number;
  }) => Promise<void>;
  shareLibrarySongs: (
    songs: {
      id: number;
      pathToFile: string | null;
      title: string;
    }[],
  ) => Promise<unknown>;
  updateLibrarySongMetadata: (params: {
    albumNames: string;
    artistNames: string;
    coverImageDataUrl?: string | null;
    id: number;
    title: string;
  }) => Promise<void>;
};

export const toggleLibrarySongLikedCommandWithDependencies = (
  {
    liked,
    songId,
  }: {
    liked: boolean;
    songId: number;
  },
  { setLibrarySongLiked }: LibrarySongCommandDependencies,
) =>
  setLibrarySongLiked({
    liked,
    songId,
  });

export const deleteLibrarySongCommandWithDependencies = (
  songId: number,
  { deleteLibrarySong }: LibrarySongCommandDependencies,
) => deleteLibrarySong(songId);

export const exportLibrarySongCommandWithDependencies = (
  {
    detail,
    songId,
  }: {
    detail: LibrarySongDetail;
    songId: number;
  },
  { shareLibrarySongs }: LibrarySongCommandDependencies,
) => shareLibrarySongs([toLibrarySongExportItem({ detail, songId })]);

export const updateLibrarySongMetadataCommandWithDependencies = (
  {
    albumNames,
    artistNames,
    coverImageDataUrl,
    id,
    title,
  }: {
    albumNames: string;
    artistNames: string;
    coverImageDataUrl?: string | null;
    id: number;
    title: string;
  },
  { updateLibrarySongMetadata }: LibrarySongCommandDependencies,
) =>
  updateLibrarySongMetadata({
    albumNames,
    artistNames,
    coverImageDataUrl,
    id,
    title,
  });
