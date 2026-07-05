import {
  type ExportableLibrarySong,
  shareLibrarySongs,
} from "@/src/features/export/services/library-export-service";
import { deleteCollection } from "../repository/collection-delete-repository";
import {
  addSongToCollection,
  addSongsToCollection,
} from "../repository/collection-song-add-repository";
import {
  removeSongFromCollection,
  updateCollectionSongOrder,
} from "../repository/relationship-repository";
import type {
  CollectionSongCommandParams,
  CollectionSongsCommandParams,
  DeleteLibraryCollectionCommandParams,
  LibraryCollectionCommandDependencies,
  MoveLibraryCollectionSongCommandParams,
} from "./library-collection-command-dependencies-service";
import {
  addLibraryCollectionSongCommandWithDependencies,
  addLibraryCollectionSongsCommandWithDependencies,
  deleteLibraryCollectionCommandWithDependencies,
  exportLibraryCollectionCommandWithDependencies,
  moveLibraryCollectionSongCommandWithDependencies,
  removeLibraryCollectionSongCommandWithDependencies,
} from "./library-collection-command-executor-service";

const libraryCollectionCommandDependencies: LibraryCollectionCommandDependencies =
  {
    addSongToCollection,
    addSongsToCollection,
    deleteCollection,
    removeSongFromCollection,
    shareLibrarySongs,
    updateCollectionSongOrder,
  };

export const exportLibraryCollectionCommand = (
  songs: ExportableLibrarySong[],
) =>
  exportLibraryCollectionCommandWithDependencies(
    songs,
    libraryCollectionCommandDependencies,
  );

export const deleteLibraryCollectionCommand = ({
  id,
  kind,
}: DeleteLibraryCollectionCommandParams) =>
  deleteLibraryCollectionCommandWithDependencies(
    { id, kind },
    libraryCollectionCommandDependencies,
  );

export const moveLibraryCollectionSongCommand = ({
  collectionId,
  direction,
  kind,
  songId,
  songs,
}: MoveLibraryCollectionSongCommandParams) =>
  moveLibraryCollectionSongCommandWithDependencies(
    { collectionId, direction, kind, songId, songs },
    libraryCollectionCommandDependencies,
  );

export const removeLibraryCollectionSongCommand = ({
  collectionId,
  kind,
  songId,
}: CollectionSongCommandParams) =>
  removeLibraryCollectionSongCommandWithDependencies(
    { collectionId, kind, songId },
    libraryCollectionCommandDependencies,
  );

export const addLibraryCollectionSongCommand = ({
  collectionId,
  kind,
  songId,
}: CollectionSongCommandParams) =>
  addLibraryCollectionSongCommandWithDependencies(
    { collectionId, kind, songId },
    libraryCollectionCommandDependencies,
  );

export const addLibraryCollectionSongsCommand = ({
  collectionId,
  kind,
  songIds,
}: CollectionSongsCommandParams) =>
  addLibraryCollectionSongsCommandWithDependencies(
    { collectionId, kind, songIds },
    libraryCollectionCommandDependencies,
  );
