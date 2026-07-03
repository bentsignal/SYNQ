import {
  createCollectionPreview,
  formatCollectionPreviewCount,
  limitCollectionPreviews,
  type ArtistPreviewRow,
  type CollectionPreviewImagePathResolver,
} from "./library-collection-preview-row-types";

export const artistRowsToPreview = ({
  getImagePath,
  limit,
  rows,
}: {
  getImagePath?: CollectionPreviewImagePathResolver;
  limit: number | null;
  rows: ArtistPreviewRow[];
}) => {
  const artistMap = new Map<
    number,
    {
      albumIds: Set<number>;
      name: string;
      profileImage: string | null;
      songIds: Set<number>;
    }
  >();

  rows.forEach((row) => {
    const artist =
      artistMap.get(row.artistId) ??
      {
        albumIds: new Set<number>(),
        name: row.artistName ?? "Untitled artist",
        profileImage: row.profileImage,
        songIds: new Set<number>(),
      };

    if (row.albumId) {
      artist.albumIds.add(row.albumId);
    }

    if (row.songId) {
      artist.songIds.add(row.songId);
    }

    artistMap.set(row.artistId, artist);
  });

  const previews = Array.from(artistMap.entries())
    .map(([id, artist]) =>
      createCollectionPreview({
        detail: `${formatCollectionPreviewCount(
          artist.songIds.size,
          "song",
        )} / ${formatCollectionPreviewCount(artist.albumIds.size, "album")}`,
        getImagePath,
        id,
        imageHash: artist.profileImage,
        kind: "artists",
        meta: "Artist",
        title: artist.name,
      }),
    )
    .sort((first, second) => first.title.localeCompare(second.title));

  return limitCollectionPreviews(previews, limit);
};
