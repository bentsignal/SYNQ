import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { deleteLibrarySong } from "../repository/library-song-delete-repository";
import { setLibrarySongLiked } from "../repository/library-song-liked-repository";
import { updateLibrarySongMetadata } from "../repository/song-metadata-repository";
import type { LibrarySongDetail } from "./library-song-detail-service";
import { toLibrarySongExportItem } from "./library-song-interaction-service";

export const toggleLibrarySongLikedCommand = ({
  liked,
  songId,
}: {
  liked: boolean;
  songId: number;
}) =>
  setLibrarySongLiked({
    liked,
    songId,
  });

export const deleteLibrarySongCommand = (songId: number) =>
  deleteLibrarySong(songId);

export const exportLibrarySongCommand = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) => shareLibrarySongs([toLibrarySongExportItem({ detail, songId })]);

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
  updateLibrarySongMetadata({
    albumNames,
    artistNames,
    coverImageDataUrl,
    id,
    title,
  });
