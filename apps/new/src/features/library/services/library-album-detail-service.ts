import {
  rowsToCollectionDetailSongs,
  type LibraryCollectionDetailSongRow,
} from "./library-collection-detail-song-service";
import {
  formatCollectionDetailCount,
  formatCollectionDetailNames,
  type CollectionImagePathResolver,
  type LibraryCollectionDetail,
} from "./library-collection-detail-shared-service";

export type AlbumDetailRow = {
  artistName: string | null;
  coverImage: string | null;
  name: string | null;
  year: number | null;
};

export const buildAlbumDetail = ({
  albumRows,
  getImagePath,
  songRows,
  updatedAt,
}: {
  albumRows: AlbumDetailRow[];
  getImagePath?: CollectionImagePathResolver;
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const artists = new Set<string>();
  albumRows.forEach((row) => {
    if (row.artistName) {
      artists.add(row.artistName);
    }
  });

  const album = albumRows[0];
  const songs = rowsToCollectionDetailSongs(songRows);
  const artistLabel = formatCollectionDetailNames(artists);

  return {
    detail: formatCollectionDetailCount(songs.length, "song"),
    eyebrow: "Album",
    imagePath: album?.coverImage
      ? getImagePath?.(album.coverImage) ?? null
      : null,
    isMissing: !album,
    kind: "album",
    meta: album?.year ? `${artistLabel} / ${album.year}` : artistLabel,
    songs,
    title: album?.name ?? "Album not found",
    updatedAt,
  };
};
