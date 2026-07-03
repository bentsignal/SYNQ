import { normalizeImportLibraryName } from "./import-library-save-plan-service";

export type ImportLibraryArtistEntityDependencies = {
  findArtistIdByName: (name: string) => Promise<number | null>;
  insertArtist: (name: string) => Promise<number>;
};

export type ImportLibraryAlbumEntityDependencies = {
  findAlbumIdByName: (name: string) => Promise<number | null>;
  insertAlbum: (name: string) => Promise<number>;
};

export const ensureImportLibraryArtist = async (
  name: string,
  dependencies: ImportLibraryArtistEntityDependencies,
) => {
  const cleanName = normalizeImportLibraryName(name);
  const existingId = await dependencies.findArtistIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertArtist(cleanName);
};

export const ensureImportLibraryAlbum = async (
  name: string,
  dependencies: ImportLibraryAlbumEntityDependencies,
) => {
  const cleanName = normalizeImportLibraryName(name);
  const existingId = await dependencies.findAlbumIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertAlbum(cleanName);
};
