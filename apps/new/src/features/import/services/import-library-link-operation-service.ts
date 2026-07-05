import {
  ensureImportLibraryArtist,
} from "./import-library-entity-link-service";
import type { ImportLibraryLinkDependencies } from "./import-library-link-executor-service";
import {
  getImportSongArtistLinkParams,
} from "./import-library-link-step-service";

export { linkImportLibrarySongAlbum } from "./import-library-album-link-operation-service";

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
