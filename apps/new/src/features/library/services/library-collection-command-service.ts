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
import { getCollectionSongOrderUpdate } from "./library-collection-song-mutation-service";

type CollectionCommandParams = {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
};

export const exportLibraryCollectionCommand = (
  songs: ExportableLibrarySong[],
) => shareLibrarySongs(songs);

export const deleteLibraryCollectionCommand = ({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) => deleteCollection({ id, kind });

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
}) => {
  const orderUpdate = getCollectionSongOrderUpdate({
    direction,
    songId,
    songs,
  });

  return updateCollectionSongOrder({
    collectionId,
    kind,
    songIds: orderUpdate.songIds,
  });
};

export const removeLibraryCollectionSongCommand = ({
  collectionId,
  kind,
  songId,
}: CollectionCommandParams & {
  songId: number;
}) =>
  removeSongFromCollection({
    collectionId,
    kind,
    songId,
  });

export const addLibraryCollectionSongCommand = ({
  collectionId,
  kind,
  songId,
}: CollectionCommandParams & {
  songId: number;
}) =>
  addSongToCollection({
    collectionId,
    kind,
    songId,
  });

export const addLibraryCollectionSongsCommand = ({
  collectionId,
  kind,
  songIds,
}: CollectionCommandParams & {
  songIds: number[];
}) =>
  addSongsToCollection({
    collectionId,
    kind,
    songIds,
  });
