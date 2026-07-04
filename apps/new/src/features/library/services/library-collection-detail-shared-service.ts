import type { LibraryCollectionDetailSong } from "./library-collection-detail-song-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";

export type LibraryCollectionDetail = {
  detail: string;
  eyebrow: string;
  imagePath: string | null;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
  meta: string;
  songs: LibraryCollectionDetailSong[];
  title: string;
  updatedAt: number;
};

export type CollectionImagePathResolver = (imageHash: string) => string | null;

export const formatCollectionDetailCount = (
  count: number,
  singular: string,
  plural = `${singular}s`,
) => `${count} ${count === 1 ? singular : plural}`;
