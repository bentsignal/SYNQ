import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

export type CollectionSongAddDependencies = {
  addSongToAlbum: (params: {
    albumId: number;
    songId: number;
  }) => Promise<void>;
  addSongToArtist: (params: {
    artistId: number;
    songId: number;
  }) => Promise<void>;
  addSongToPlaylist: (params: {
    playlistId: number;
    songId: number;
  }) => Promise<void>;
};

export async function addSongToCollectionWithDependencies(
  {
    collectionId,
    kind,
    songId,
  }: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songId: number;
  },
  dependencies: CollectionSongAddDependencies,
) {
  switch (kind) {
    case "album":
      await dependencies.addSongToAlbum({ albumId: collectionId, songId });
      return;
    case "artist":
      await dependencies.addSongToArtist({ artistId: collectionId, songId });
      return;
    case "playlist":
      await dependencies.addSongToPlaylist({
        playlistId: collectionId,
        songId,
      });
  }
}

export async function addSongsToCollectionWithDependencies(
  {
    collectionId,
    kind,
    songIds,
  }: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songIds: number[];
  },
  dependencies: CollectionSongAddDependencies,
) {
  for (const songId of songIds) {
    await addSongToCollectionWithDependencies(
      {
        collectionId,
        kind,
        songId,
      },
      dependencies,
    );
  }
}
