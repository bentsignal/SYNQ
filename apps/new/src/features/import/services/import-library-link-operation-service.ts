import type { ImportSongDraft } from "../types/import-session";
import {
  ensureImportLibraryAlbum,
  ensureImportLibraryArtist,
} from "./import-library-entity-link-service";
import type { ImportLibraryLinkDependencies } from "./import-library-link-executor-service";
import {
  getImportAlbumCoverUpdateParams,
  getImportArtistAlbumLinkParams,
  getImportSongAlbumLinkParams,
  getImportSongArtistLinkParams,
} from "./import-library-link-step-service";

export const updateImportLibraryAlbumCover = async ({
  albumId,
  artwork,
  dependencies,
}: {
  albumId: number;
  artwork: string | null;
  dependencies: ImportLibraryLinkDependencies;
}) => {
  const params = getImportAlbumCoverUpdateParams({
    albumId,
    coverImage: await dependencies.saveCoverImage(artwork),
  });

  if (!params) {
    return;
  }

  await dependencies.updateAlbumCover(params);
};

export const linkImportLibrarySongArtists = async ({
  artistNames,
  dependencies,
  songId,
}: {
  artistNames: string[];
  dependencies: ImportLibraryLinkDependencies;
  songId: number;
}) => {
  const artistIds: number[] = [];

  for (const artistName of artistNames) {
    const artistId = await ensureImportLibraryArtist(artistName, dependencies);
    artistIds.push(artistId);
    await dependencies.linkSongArtist(
      getImportSongArtistLinkParams({ artistId, songId }),
    );
  }

  return artistIds;
};

export const linkImportLibrarySongAlbum = async ({
  albumName,
  artistIds,
  dependencies,
  song,
  songId,
}: {
  albumName: string;
  artistIds: number[];
  dependencies: ImportLibraryLinkDependencies;
  song: ImportSongDraft;
  songId: number;
}) => {
  const albumId = await ensureImportLibraryAlbum(albumName, dependencies);
  await dependencies.linkSongAlbum(
    getImportSongAlbumLinkParams({
      albumId,
      songId,
      track: song.track,
    }),
  );
  await updateImportLibraryAlbumCover({
    albumId,
    artwork: song.artwork,
    dependencies,
  });

  for (const artistId of artistIds) {
    await dependencies.linkArtistAlbum(
      getImportArtistAlbumLinkParams({ albumId, artistId }),
    );
  }

  return true;
};
