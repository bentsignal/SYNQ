import { saveCoverImage } from "../../images/services/image-storage-service";
import {
  findImportLibraryAlbumIdByName,
  findImportLibraryArtistIdByName,
  insertImportLibraryAlbum,
  insertImportLibraryArtist,
  linkImportArtistAlbum,
  linkImportSongAlbum,
  linkImportSongArtist,
  linkImportSongToLibraryPlaylist,
  updateImportLibraryAlbumCover,
} from "../repository/import-library-link-repository";
import type { ImportSongDraft } from "../types/import-session";
import {
  buildImportLibrarySongSavePlan,
  normalizeImportLibraryName,
} from "./import-library-save-plan-service";

const ensureArtist = async (name: string) => {
  const cleanName = normalizeImportLibraryName(name);
  const existingId = await findImportLibraryArtistIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return insertImportLibraryArtist(cleanName);
};

const ensureAlbum = async (name: string) => {
  const cleanName = normalizeImportLibraryName(name);
  const existingId = await findImportLibraryAlbumIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return insertImportLibraryAlbum(cleanName);
};

const updateAlbumCover = async ({
  albumId,
  artwork,
}: {
  albumId: number;
  artwork: string | null;
}) => {
  const coverImage = await saveCoverImage(artwork);

  if (!coverImage) {
    return;
  }

  await updateImportLibraryAlbumCover({ albumId, coverImage });
};

const linkSongArtists = async ({
  artistNames,
  songId,
}: {
  artistNames: string[];
  songId: number;
}) => {
  const artistIds: number[] = [];

  for (const artistName of artistNames) {
    const artistId = await ensureArtist(artistName);
    artistIds.push(artistId);
    await linkImportSongArtist({ artistId, songId });
  }

  return artistIds;
};

const linkSongAlbum = async ({
  albumName,
  artistIds,
  song,
  songId,
}: {
  albumName: string;
  artistIds: number[];
  song: ImportSongDraft;
  songId: number;
}) => {
  const albumId = await ensureAlbum(albumName);
  await linkImportSongAlbum({
    albumId,
    songId,
    track: song.track,
  });
  await updateAlbumCover({ albumId, artwork: song.artwork });

  for (const artistId of artistIds) {
    await linkImportArtistAlbum({ albumId, artistId });
  }

  return true;
};

export const linkImportSongToLibrary = async ({
  song,
  songId,
}: {
  song: ImportSongDraft;
  songId: number;
}) => {
  const savePlan = buildImportLibrarySongSavePlan(song);
  const artistIds = await linkSongArtists({
    artistNames: savePlan.artistNames,
    songId,
  });

  const linkedAlbum = savePlan.albumName
    ? await linkSongAlbum({
        albumName: savePlan.albumName,
        artistIds,
        song,
        songId,
      })
    : false;

  await linkImportSongToLibraryPlaylist(songId);

  return { linkedAlbum };
};
