import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { setLibrarySongLiked } from "../repository/library-song-liked-repository";
import { updateLibrarySongMetadata } from "../repository/song-metadata-repository";
import { deleteLibrarySong } from "./library-song-delete-service";
import type { LibrarySongCommandDependencies } from "./library-song-command-executor-service";

export const librarySongCommandDependencies: LibrarySongCommandDependencies = {
  deleteLibrarySong,
  setLibrarySongLiked,
  shareLibrarySongs,
  updateLibrarySongMetadata,
};
