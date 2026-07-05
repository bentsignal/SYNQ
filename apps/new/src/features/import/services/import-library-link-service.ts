import type { ImportSongDraft } from "../types/import-session";
import { getImportLibraryLinkDependencies } from "./import-library-link-dependencies-service";
import { linkImportSongToLibraryWithDependencies } from "./import-library-link-executor-service";

export const linkImportSongToLibrary = async ({
  song,
  songId,
}: {
  song: ImportSongDraft;
  songId: number;
}) => {
  return linkImportSongToLibraryWithDependencies({
    dependencies: getImportLibraryLinkDependencies(),
    songId,
    song,
  });
};
