import type {
  LibraryCollectionDetailKind,
} from "./library-collection-kind-service";
import type {
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";

export type ExportableLibrarySong = {
  id: number;
  pathToFile: string | null;
  title: string;
};

export type CollectionCommandParams = {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
};

export type DeleteLibraryCollectionCommandParams = {
  id: number;
  kind: LibraryCollectionDetailKind;
};

export type MoveLibraryCollectionSongCommandParams =
  CollectionCommandParams & {
    direction: "down" | "up";
    songId: number;
    songs: LibraryCollectionDetailSong[];
  };

export type CollectionSongCommandParams = CollectionCommandParams & {
  songId: number;
};

export type CollectionSongsCommandParams = CollectionCommandParams & {
  songIds: number[];
};

export type LibraryCollectionCommandDependencies = {
  addSongToCollection: (params: CollectionSongCommandParams) => Promise<void>;
  addSongsToCollection: (params: CollectionSongsCommandParams) => Promise<void>;
  deleteCollection: (
    params: DeleteLibraryCollectionCommandParams,
  ) => Promise<void>;
  removeSongFromCollection: (
    params: CollectionSongCommandParams,
  ) => Promise<void>;
  shareLibrarySongs: (songs: ExportableLibrarySong[]) => Promise<unknown>;
  updateCollectionSongOrder: (
    params: CollectionSongsCommandParams,
  ) => Promise<void>;
};
