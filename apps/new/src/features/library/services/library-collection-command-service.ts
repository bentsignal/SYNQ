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
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  addLibraryCollectionSongCommandWithDependencies,
  addLibraryCollectionSongsCommandWithDependencies,
  deleteLibraryCollectionCommandWithDependencies,
  exportLibraryCollectionCommandWithDependencies,
  moveLibraryCollectionSongCommandWithDependencies,
  removeLibraryCollectionSongCommandWithDependencies,
} from "./library-collection-command-executor-service";

type CollectionCommandParams = {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
};

const libraryCollectionCommandDependencies = {
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
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) =>
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
}: CollectionCommandParams & {
  direction: "down" | "up";
  songId: number;
  songs: LibraryCollectionDetailSong[];
}) =>
  moveLibraryCollectionSongCommandWithDependencies(
    { collectionId, direction, kind, songId, songs },
    libraryCollectionCommandDependencies,
  );

export const removeLibraryCollectionSongCommand = ({
  collectionId,
  kind,
  songId,
}: CollectionCommandParams & {
  songId: number;
}) =>
  removeLibraryCollectionSongCommandWithDependencies(
    { collectionId, kind, songId },
    libraryCollectionCommandDependencies,
  );

export const addLibraryCollectionSongCommand = ({
  collectionId,
  kind,
  songId,
}: CollectionCommandParams & {
  songId: number;
}) =>
  addLibraryCollectionSongCommandWithDependencies(
    { collectionId, kind, songId },
    libraryCollectionCommandDependencies,
  );

export const addLibraryCollectionSongsCommand = ({
  collectionId,
  kind,
  songIds,
}: CollectionCommandParams & {
  songIds: number[];
}) =>
  addLibraryCollectionSongsCommandWithDependencies(
    { collectionId, kind, songIds },
    libraryCollectionCommandDependencies,
  );
