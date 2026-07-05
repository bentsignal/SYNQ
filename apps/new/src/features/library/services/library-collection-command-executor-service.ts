import type {
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import { getCollectionSongOrderUpdate } from "./library-collection-song-order-service";
import type {
  CollectionCommandParams,
  ExportableLibrarySong,
  LibraryCollectionCommandDependencies,
} from "./library-collection-command-dependencies-service";

export type {
  CollectionCommandParams,
  ExportableLibrarySong,
  LibraryCollectionCommandDependencies,
} from "./library-collection-command-dependencies-service";

export const exportLibraryCollectionCommandWithDependencies = (
  songs: ExportableLibrarySong[],
  { shareLibrarySongs }: LibraryCollectionCommandDependencies,
) => shareLibrarySongs(songs);

export const deleteLibraryCollectionCommandWithDependencies = (
  {
    id,
    kind,
  }: {
    id: number;
    kind: LibraryCollectionDetailKind;
  },
  { deleteCollection }: LibraryCollectionCommandDependencies,
) => deleteCollection({ id, kind });

export const moveLibraryCollectionSongCommandWithDependencies = (
  {
    collectionId,
    direction,
    kind,
    songId,
    songs,
  }: CollectionCommandParams & {
    direction: "down" | "up";
    songId: number;
    songs: LibraryCollectionDetailSong[];
  },
  { updateCollectionSongOrder }: LibraryCollectionCommandDependencies,
) => {
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

export const removeLibraryCollectionSongCommandWithDependencies = (
  {
    collectionId,
    kind,
    songId,
  }: CollectionCommandParams & { songId: number },
  { removeSongFromCollection }: LibraryCollectionCommandDependencies,
) => removeSongFromCollection({ collectionId, kind, songId });

export const addLibraryCollectionSongCommandWithDependencies = (
  {
    collectionId,
    kind,
    songId,
  }: CollectionCommandParams & { songId: number },
  { addSongToCollection }: LibraryCollectionCommandDependencies,
) => addSongToCollection({ collectionId, kind, songId });

export const addLibraryCollectionSongsCommandWithDependencies = (
  {
    collectionId,
    kind,
    songIds,
  }: CollectionCommandParams & { songIds: number[] },
  { addSongsToCollection }: LibraryCollectionCommandDependencies,
) => addSongsToCollection({ collectionId, kind, songIds });
