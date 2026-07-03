import type {
  CollectionKind,
  LibraryCollectionPreview,
} from "./library-collection-preview-service";

export type CollectionPreviewImagePathResolver = (
  imageHash: string,
) => string | null;

export type PlaylistPreviewRow = {
  coverImage: string | null;
  playlistId: number;
  playlistName: string | null;
  songId: number | null;
};

export type AlbumPreviewRow = {
  albumCoverImage: string | null;
  albumId: number;
  albumName: string | null;
  artistName: string | null;
  songId: number | null;
  year: number | null;
};

export type ArtistPreviewRow = {
  albumId: number | null;
  artistId: number;
  artistName: string | null;
  profileImage: string | null;
  songId: number | null;
};

export const formatCollectionPreviewCount = (
  count: number,
  singular: string,
  plural = `${singular}s`,
) => `${count} ${count === 1 ? singular : plural}`;

export const formatCollectionPreviewArtists = (artists: Set<string>) => {
  if (artists.size === 0) {
    return "Unknown artist";
  }

  return Array.from(artists).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

export const limitCollectionPreviews = (
  previews: LibraryCollectionPreview[],
  limit: number | null,
) => (limit === null ? previews : previews.slice(0, limit));

export const createCollectionPreview = ({
  detail,
  getImagePath,
  id,
  imageHash,
  kind,
  meta,
  title,
}: {
  detail: string;
  getImagePath?: CollectionPreviewImagePathResolver;
  id: number;
  imageHash: string | null;
  kind: CollectionKind;
  meta: string;
  title: string;
}): LibraryCollectionPreview => ({
  detail,
  id,
  imagePath: imageHash ? getImagePath?.(imageHash) ?? null : null,
  kind,
  meta,
  title,
});
