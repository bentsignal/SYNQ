import type { ImportSongDraft } from "../types/import-session";
import {
  linkImportLibrarySongAlbum,
  linkImportLibrarySongArtists,
} from "./import-library-link-operation-service";
import { buildImportLibrarySongSavePlan } from "./import-library-save-plan-service";

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
  const artistIds = await linkImportLibrarySongArtists({
    artistNames: savePlan.artistNames,
    dependencies,
    songId,
  });

  const linkedAlbum = savePlan.albumName
    ? await linkImportLibrarySongAlbum({
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
