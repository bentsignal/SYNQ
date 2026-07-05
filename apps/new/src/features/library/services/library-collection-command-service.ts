import {
  type ExportableLibrarySong,
} from "@/src/features/export/services/library-export-service";
import type {
  CollectionSongCommandParams,
  CollectionSongsCommandParams,
  DeleteLibraryCollectionCommandParams,
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
import {
  libraryCollectionCommandDependencies,
} from "./library-collection-command-runtime-service";

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
