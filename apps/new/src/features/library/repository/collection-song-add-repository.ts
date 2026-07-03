import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import { addSongToAlbum } from "./album-song-add-repository";
import { addSongToArtist } from "./artist-song-add-repository";
import {
  addSongsToCollectionWithDependencies,
  addSongToCollectionWithDependencies,
} from "./collection-song-add-executor-repository";
import { addSongToPlaylist } from "./playlist-song-add-repository";

const collectionSongAddDependencies = {
  addSongToAlbum,
  addSongToArtist,
  addSongToPlaylist,
};

export async function addSongToCollection({
  collectionId,
  kind,
  songId,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
}) {
  await addSongToCollectionWithDependencies(
    {
      collectionId,
      kind,
      songId,
    },
    collectionSongAddDependencies,
  );
}

export async function addSongsToCollection({
  collectionId,
  kind,
  songIds,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songIds: number[];
}) {
  await addSongsToCollectionWithDependencies(
    {
      collectionId,
      kind,
      songIds,
    },
    collectionSongAddDependencies,
  );
}
