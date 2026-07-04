import {
  rowsToCollectionDetailSongs,
  type LibraryCollectionDetailSongRow,
} from "./library-collection-detail-song-service";
import {
  formatCollectionDetailCount,
  type CollectionImagePathResolver,
  type LibraryCollectionDetail,
} from "./library-collection-detail-shared-service";

export type ArtistDetailRow = {
  albumId: number | null;
  name: string | null;
  profileImage: string | null;
};

export const buildArtistDetail = ({
  artistRows,
  getImagePath,
  songRows,
  updatedAt,
}: {
  artistRows: ArtistDetailRow[];
  getImagePath?: CollectionImagePathResolver;
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const albumIds = new Set<number>();
  artistRows.forEach((row) => {
    if (row.albumId) {
      albumIds.add(row.albumId);
    }
  });

  const artist = artistRows[0];
  const songs = rowsToCollectionDetailSongs(songRows);

  return {
    detail: `${formatCollectionDetailCount(
      songs.length,
      "song",
    )} / ${formatCollectionDetailCount(albumIds.size, "album")}`,
    eyebrow: "Artist",
    imagePath: artist?.profileImage
      ? getImagePath?.(artist.profileImage) ?? null
      : null,
    isMissing: !artist,
    kind: "artist",
    meta: "Library artist",
    songs,
    title: artist?.name ?? "Artist not found",
    updatedAt,
  };
};
