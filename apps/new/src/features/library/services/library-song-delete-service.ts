import { deleteLibrarySongRows } from "../repository/library-song-delete-repository";
import {
  deleteLibrarySongWithDependencies,
  type LibrarySongDeleteDependencies,
} from "./library-song-delete-executor-service";
import { deleteLibrarySongFiles } from "./library-song-file-service";

const librarySongDeleteDependencies: LibrarySongDeleteDependencies = {
  deleteLibrarySongFiles,
  deleteLibrarySongRows,
};

export async function deleteLibrarySong(songId: number) {
  await deleteLibrarySongWithDependencies(
    songId,
    librarySongDeleteDependencies,
  );
}
