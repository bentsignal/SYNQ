import type {
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import { getCollectionSongOrderUpdate } from "./library-collection-song-mutation-service";

type ExportableLibrarySong = {
  id: number;
  pathToFile: string | null;
  title: string;
};

type CollectionCommandParams = {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
};

export type LibraryCollectionCommandDependencies = {
  addSongToCollection: (
    params: CollectionCommandParams & { songId: number },
  ) => Promise<void>;
  addSongsToCollection: (
    params: CollectionCommandParams & { songIds: number[] },
  ) => Promise<void>;
  deleteCollection: (params: {
    id: number;
    kind: LibraryCollectionDetailKind;
  }) => Promise<void>;
  removeSongFromCollection: (
    params: CollectionCommandParams & { songId: number },
  ) => Promise<void>;
  shareLibrarySongs: (songs: ExportableLibrarySong[]) => Promise<unknown>;
  updateCollectionSongOrder: (
    params: CollectionCommandParams & { songIds: number[] },
  ) => Promise<void>;
};

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
