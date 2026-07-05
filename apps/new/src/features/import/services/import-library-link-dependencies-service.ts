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
import type { ImportLibraryLinkDependencies } from "./import-library-link-executor-service";

export function getImportLibraryLinkDependencies(): ImportLibraryLinkDependencies {
  return {
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
}
