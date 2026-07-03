import {
  createCollectionPreview,
  formatCollectionPreviewArtists,
  formatCollectionPreviewCount,
  limitCollectionPreviews,
  type AlbumPreviewRow,
  type CollectionPreviewImagePathResolver,
} from "./library-collection-preview-row-types";

export const albumRowsToPreview = ({
  getImagePath,
  limit,
  rows,
}: {
  getImagePath?: CollectionPreviewImagePathResolver;
  limit: number | null;
  rows: AlbumPreviewRow[];
}) => {
  const albumMap = new Map<
    number,
    {
      artistNames: Set<string>;
      coverImage: string | null;
      name: string;
      songIds: Set<number>;
      year: number | null;
    }
  >();

  rows.forEach((row) => {
    const album =
      albumMap.get(row.albumId) ??
      {
        artistNames: new Set<string>(),
        coverImage: row.albumCoverImage,
        name: row.albumName ?? "Untitled album",
        songIds: new Set<number>(),
        year: row.year,
      };

    if (row.artistName) {
      album.artistNames.add(row.artistName);
    }

    if (row.songId) {
      album.songIds.add(row.songId);
    }

    albumMap.set(row.albumId, album);
  });

  const previews = Array.from(albumMap.entries())
    .map(([id, album]) =>
      createCollectionPreview({
        detail: formatCollectionPreviewCount(album.songIds.size, "song"),
        getImagePath,
        id,
        imageHash: album.coverImage,
        kind: "albums",
        meta: album.year
          ? `${formatCollectionPreviewArtists(album.artistNames)} / ${album.year}`
          : formatCollectionPreviewArtists(album.artistNames),
        title: album.name,
      }),
    )
    .sort((first, second) => first.title.localeCompare(second.title));

  return limitCollectionPreviews(previews, limit);
};
