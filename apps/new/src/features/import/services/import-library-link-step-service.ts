export const getImportSongArtistLinkParams = ({
  artistId,
  songId,
}: {
  artistId: number;
  songId: number;
}) => ({
  artistId,
  songId,
});

export const getImportSongAlbumLinkParams = ({
  albumId,
  songId,
  track,
}: {
  albumId: number;
  songId: number;
  track: number | null;
}) => ({
  albumId,
  songId,
  track,
});

export const getImportArtistAlbumLinkParams = ({
  albumId,
  artistId,
}: {
  albumId: number;
  artistId: number;
}) => ({
  albumId,
  artistId,
});

export const getImportAlbumCoverUpdateParams = ({
  albumId,
  coverImage,
}: {
  albumId: number;
  coverImage: string | null;
}) =>
  coverImage
    ? {
        albumId,
        coverImage,
      }
    : null;
