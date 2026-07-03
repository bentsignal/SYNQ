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
  linkImportSongToLibraryWithDependencies,
  type ImportLibraryLinkDependencies,
} from "./import-library-link-executor-service";

const importLibraryLinkDependencies: ImportLibraryLinkDependencies = {
  findAlbumIdByName: findImportLibraryAlbumIdByName,
  findArtistIdByName: findImportLibraryArtistIdByName,
  insertAlbum: insertImportLibraryAlbum,
  insertArtist: insertImportLibraryArtist,
  linkArtistAlbum: linkImportArtistAlbum,
  linkSongAlbum: linkImportSongAlbum,
  linkSongArtist: linkImportSongArtist,
  linkSongToLibraryPlaylist: linkImportSongToLibraryPlaylist,
  saveCoverImage,
  updateAlbumCover: updateImportLibraryAlbumCover,
};

export const linkImportSongToLibrary = async ({
  song,
  songId,
}: {
  song: ImportSongDraft;
  songId: number;
}) => {
  return linkImportSongToLibraryWithDependencies({
    dependencies: importLibraryLinkDependencies,
    songId,
    song,
  });
};
