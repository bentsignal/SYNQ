import type {
  CollectionSongCommandParams,
  CollectionSongsCommandParams,
  DeleteLibraryCollectionCommandParams,
  ExportableLibrarySong,
  LibraryCollectionCommandDependencies,
  MoveLibraryCollectionSongCommandParams,
} from "./library-collection-command-dependencies-service";
import { getCollectionSongOrderUpdate } from "./library-collection-song-order-service";

export type {
  CollectionCommandParams,
  CollectionSongCommandParams,
  CollectionSongsCommandParams,
  DeleteLibraryCollectionCommandParams,
  ExportableLibrarySong,
  LibraryCollectionCommandDependencies,
  MoveLibraryCollectionSongCommandParams,
} from "./library-collection-command-dependencies-service";

export const exportLibraryCollectionCommandWithDependencies = (
  songs: ExportableLibrarySong[],
  { shareLibrarySongs }: LibraryCollectionCommandDependencies,
) => shareLibrarySongs(songs);

export const deleteLibraryCollectionCommandWithDependencies = (
  { id, kind }: DeleteLibraryCollectionCommandParams,
  { deleteCollection }: LibraryCollectionCommandDependencies,
) => deleteCollection({ id, kind });

export const moveLibraryCollectionSongCommandWithDependencies = (
  {
    collectionId,
    direction,
    kind,
    songId,
    songs,
  }: MoveLibraryCollectionSongCommandParams,
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
  { collectionId, kind, songId }: CollectionSongCommandParams,
  { removeSongFromCollection }: LibraryCollectionCommandDependencies,
) => removeSongFromCollection({ collectionId, kind, songId });

export const addLibraryCollectionSongCommandWithDependencies = (
  { collectionId, kind, songId }: CollectionSongCommandParams,
  { addSongToCollection }: LibraryCollectionCommandDependencies,
) => addSongToCollection({ collectionId, kind, songId });

export const addLibraryCollectionSongsCommandWithDependencies = (
  { collectionId, kind, songIds }: CollectionSongsCommandParams,
  { addSongsToCollection }: LibraryCollectionCommandDependencies,
) => addSongsToCollection({ collectionId, kind, songIds });
