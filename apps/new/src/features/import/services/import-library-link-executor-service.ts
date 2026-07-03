import type { ImportSongDraft } from "../types/import-session";
import {
  buildImportLibrarySongSavePlan,
  normalizeImportLibraryName,
} from "./import-library-save-plan-service";

type ImportSongLibraryLinkResult = {
  linkedAlbum: boolean;
};

export type ImportLibraryLinkDependencies = {
  findAlbumIdByName: (name: string) => Promise<number | null>;
  findArtistIdByName: (name: string) => Promise<number | null>;
  insertAlbum: (name: string) => Promise<number>;
  insertArtist: (name: string) => Promise<number>;
  linkArtistAlbum: ({
    albumId,
    artistId,
  }: {
    albumId: number;
    artistId: number;
  }) => Promise<void>;
  linkSongAlbum: ({
    albumId,
    songId,
    track,
  }: {
    albumId: number;
    songId: number;
    track: number | null;
  }) => Promise<void>;
  linkSongArtist: ({
    artistId,
    songId,
  }: {
    artistId: number;
    songId: number;
  }) => Promise<void>;
  linkSongToLibraryPlaylist: (songId: number) => Promise<void>;
  saveCoverImage: (artwork: string | null) => Promise<string | null>;
  updateAlbumCover: ({
    albumId,
    coverImage,
  }: {
    albumId: number;
    coverImage: string;
  }) => Promise<void>;
};

const ensureArtist = async (
  name: string,
  dependencies: ImportLibraryLinkDependencies,
) => {
  const cleanName = normalizeImportLibraryName(name);
  const existingId = await dependencies.findArtistIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertArtist(cleanName);
};

const ensureAlbum = async (
  name: string,
  dependencies: ImportLibraryLinkDependencies,
) => {
  const cleanName = normalizeImportLibraryName(name);
  const existingId = await dependencies.findAlbumIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertAlbum(cleanName);
};

const updateAlbumCover = async ({
  albumId,
  artwork,
  dependencies,
}: {
  albumId: number;
  artwork: string | null;
  dependencies: ImportLibraryLinkDependencies;
}) => {
  const coverImage = await dependencies.saveCoverImage(artwork);

  if (!coverImage) {
    return;
  }

  await dependencies.updateAlbumCover({ albumId, coverImage });
};

const linkSongArtists = async ({
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
    const artistId = await ensureArtist(artistName, dependencies);
    artistIds.push(artistId);
    await dependencies.linkSongArtist({ artistId, songId });
  }

  return artistIds;
};

const linkSongAlbum = async ({
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
  const albumId = await ensureAlbum(albumName, dependencies);
  await dependencies.linkSongAlbum({
    albumId,
    songId,
    track: song.track,
  });
  await updateAlbumCover({ albumId, artwork: song.artwork, dependencies });

  for (const artistId of artistIds) {
    await dependencies.linkArtistAlbum({ albumId, artistId });
  }

  return true;
};

export const linkImportSongToLibraryWithDependencies = async ({
  dependencies,
  song,
  songId,
}: {
  dependencies: ImportLibraryLinkDependencies;
  song: ImportSongDraft;
  songId: number;
}): Promise<ImportSongLibraryLinkResult> => {
  const savePlan = buildImportLibrarySongSavePlan(song);
  const artistIds = await linkSongArtists({
    artistNames: savePlan.artistNames,
    dependencies,
    songId,
  });

  const linkedAlbum = savePlan.albumName
    ? await linkSongAlbum({
        albumName: savePlan.albumName,
        artistIds,
        dependencies,
        song,
        songId,
      })
    : false;

  await dependencies.linkSongToLibraryPlaylist(songId);

  return { linkedAlbum };
};
