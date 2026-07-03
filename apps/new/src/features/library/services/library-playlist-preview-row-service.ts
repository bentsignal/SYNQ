import {
  createCollectionPreview,
  formatCollectionPreviewCount,
  limitCollectionPreviews,
  type CollectionPreviewImagePathResolver,
  type PlaylistPreviewRow,
} from "./library-collection-preview-row-types";

export const playlistRowsToPreview = ({
  getImagePath,
  limit,
  rows,
}: {
  getImagePath?: CollectionPreviewImagePathResolver;
  limit: number | null;
  rows: PlaylistPreviewRow[];
}) => {
  const playlistMap = new Map<
    number,
    {
      coverImage: string | null;
      name: string;
      songIds: Set<number>;
    }
  >();

  rows.forEach((row) => {
    const playlist =
      playlistMap.get(row.playlistId) ??
      {
        coverImage: row.coverImage,
        name: row.playlistName ?? "Untitled playlist",
        songIds: new Set<number>(),
      };

    if (row.songId) {
      playlist.songIds.add(row.songId);
    }

    playlistMap.set(row.playlistId, playlist);
  });

  const previews = Array.from(playlistMap.entries())
    .map(([id, playlist]) =>
      createCollectionPreview({
        detail: formatCollectionPreviewCount(playlist.songIds.size, "song"),
        getImagePath,
        id,
        imageHash: playlist.coverImage,
        kind: "playlists",
        meta: "Playlist",
        title: playlist.name,
      }),
    )
    .sort((first, second) => second.id - first.id);

  return limitCollectionPreviews(previews, limit);
};
