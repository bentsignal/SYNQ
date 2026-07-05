import { librarySongCommandDependencies } from "./library-song-command-dependencies-service";
import type { LibrarySongDetail } from "./library-song-detail-types-service";
import {
  deleteLibrarySongCommandWithDependencies,
  exportLibrarySongCommandWithDependencies,
  toggleLibrarySongLikedCommandWithDependencies,
  updateLibrarySongMetadataCommandWithDependencies,
} from "./library-song-command-executor-service";

export const toggleLibrarySongLikedCommand = ({
  liked,
  songId,
}: {
  liked: boolean;
  songId: number;
}) =>
  toggleLibrarySongLikedCommandWithDependencies(
    { liked, songId },
    librarySongCommandDependencies,
  );

export const deleteLibrarySongCommand = (songId: number) =>
  deleteLibrarySongCommandWithDependencies(
    songId,
    librarySongCommandDependencies,
  );

export const exportLibrarySongCommand = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) =>
  exportLibrarySongCommandWithDependencies(
    { detail, songId },
    librarySongCommandDependencies,
  );

export const updateLibrarySongMetadataCommand = ({
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
}) =>
  updateLibrarySongMetadataCommandWithDependencies(
    {
      albumNames,
      artistNames,
      coverImageDataUrl,
      id,
      title,
    },
    librarySongCommandDependencies,
  );
