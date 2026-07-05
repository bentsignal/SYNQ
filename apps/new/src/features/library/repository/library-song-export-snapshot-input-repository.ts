import type {
  LibrarySongExportSnapshotAlbumRow,
  LibrarySongExportSnapshotArtistRow,
  LibrarySongExportSnapshotSongRow,
} from "./library-song-export-snapshot-types-repository";

export const getLibrarySongExportSnapshotInput = ({
  albums,
  artists,
  song,
}: {
  albums: LibrarySongExportSnapshotAlbumRow[];
  artists: LibrarySongExportSnapshotArtistRow[];
  song: LibrarySongExportSnapshotSongRow;
}) => {
  const albumNames = albums
    .map(
      (album) =>
        `${album.name ?? ""}${album.year ?? ""}${album.coverImage ?? ""}`,
    )
    .sort()
    .join(",");
  const artistNames = artists
    .map((artist) => artist.name ?? "")
    .sort()
    .join(",");

  return [
    song.title,
    song.duration,
    song.fileType,
    song.coverImage,
    artistNames,
    albumNames,
  ].join("-");
};
