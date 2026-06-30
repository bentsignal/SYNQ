import { AlbumType, ArtistType, SongType } from "@/src/constants/Types";

const uniqueArtistsById = (artists: ArtistType[]) => {
  const seen = new Set<number>();
  return artists.filter((artist) => {
    if (seen.has(artist.id)) {
      return false;
    }

    seen.add(artist.id);
    return true;
  });
};

const uniqueAlbumsById = (albums: AlbumType[]) => {
  const seen = new Set<number>();
  return albums.filter((album) => {
    if (seen.has(album.id)) {
      return false;
    }

    seen.add(album.id);
    return true;
  });
};

export const addImportSongArtist = (song: SongType, artist: ArtistType) => {
  song.importArtists = uniqueArtistsById([...(song.importArtists ?? []), artist]);
  syncImportSongDisplayMetadata(song);
};

export const removeImportSongArtist = (song: SongType, artistId: number) => {
  song.importArtists = (song.importArtists ?? []).filter(
    (artist) => artist.id !== artistId,
  );
  syncImportSongDisplayMetadata(song);
};

export const addImportSongAlbum = (
  song: SongType,
  album: AlbumType,
  albumArtists: ArtistType[],
) => {
  song.importAlbums = uniqueAlbumsById([...(song.importAlbums ?? []), album]);
  song.importArtists = uniqueArtistsById([
    ...(song.importArtists ?? []),
    ...albumArtists,
  ]);
  syncImportSongDisplayMetadata(song);
};

export const removeImportSongAlbum = (
  song: SongType,
  albumId: number,
  albumArtists: ArtistType[],
) => {
  const albumArtistIds = new Set(albumArtists.map((artist) => artist.id));
  song.importAlbums = (song.importAlbums ?? []).filter(
    (album) => album.id !== albumId,
  );
  song.importArtists = (song.importArtists ?? []).filter(
    (artist) => !albumArtistIds.has(artist.id),
  );
  syncImportSongDisplayMetadata(song);
};

export const syncImportSongDisplayMetadata = (song: SongType) => {
  song.artist = (song.importArtists ?? []).map((artist) => artist.name).join(", ");
  song.album = song.importAlbums?.[0]?.name ?? "";
};

export const replaceImportSong = (songs: SongType[], song: SongType) =>
  songs.map((result) => (result.id === song.id ? { ...song } : result));
