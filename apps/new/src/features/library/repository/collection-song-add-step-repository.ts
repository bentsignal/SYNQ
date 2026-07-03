import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

export type CollectionSongAddOperation =
  | {
      albumId: number;
      kind: "album";
      songId: number;
    }
  | {
      artistId: number;
      kind: "artist";
      songId: number;
    }
  | {
      kind: "playlist";
      playlistId: number;
      songId: number;
    };

export const getCollectionSongAddOperation = ({
  collectionId,
  kind,
  songId,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
}): CollectionSongAddOperation => {
  switch (kind) {
    case "album":
      return { albumId: collectionId, kind, songId };
    case "artist":
      return { artistId: collectionId, kind, songId };
    case "playlist":
      return { kind, playlistId: collectionId, songId };
  }
};

export const getCollectionSongAddOperations = ({
  collectionId,
  kind,
  songIds,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songIds: number[];
}) =>
  songIds.map((songId) =>
    getCollectionSongAddOperation({ collectionId, kind, songId }),
  );
