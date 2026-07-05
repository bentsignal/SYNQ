import type {
  LibraryCollectionDetailKind,
} from "./library-collection-kind-service";

export type ExportableLibrarySong = {
  id: number;
  pathToFile: string | null;
  title: string;
};

export type CollectionCommandParams = {
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
