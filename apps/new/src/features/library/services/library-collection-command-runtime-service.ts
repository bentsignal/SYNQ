import { deleteCollection } from "../repository/collection-delete-repository";
import {
  addSongToCollection,
  addSongsToCollection,
} from "../repository/collection-song-add-repository";
import {
  removeSongFromCollection,
  updateCollectionSongOrder,
} from "../repository/relationship-repository";
import {
  shareLibrarySongs,
} from "@/src/features/export/services/library-export-service";
import type {
  LibraryCollectionCommandDependencies,
} from "./library-collection-command-dependencies-service";

export const libraryCollectionCommandDependencies: LibraryCollectionCommandDependencies =
  {
    addSongToCollection,
    addSongsToCollection,
    deleteCollection,
    removeSongFromCollection,
    shareLibrarySongs,
    updateCollectionSongOrder,
  };
