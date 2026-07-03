import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  likedSongsPlaylistId,
  systemPlaylistId,
} from "../services/library-playlist-constants-service";
import {
  removeAlbumSong,
  updateAlbumSongOrder,
} from "./album-song-relationship-repository";
import {
  removeArtistSong,
  updateArtistSongOrder,
} from "./artist-song-relationship-repository";
import {
  removeSongFromCollectionWithDependencies,
  updateCollectionSongOrderWithDependencies,
} from "./collection-song-relationship-executor-repository";
import {
  removePlaylistSong,
  updatePlaylistSongOrder,
} from "./playlist-song-relationship-repository";

const protectedPlaylistIds = new Set([systemPlaylistId, likedSongsPlaylistId]);

const collectionSongRelationshipDependencies = {
  protectedPlaylistIds,
  removeAlbumSong,
  removeArtistSong,
  removePlaylistSong,
  updateAlbumSongOrder,
  updateArtistSongOrder,
  updatePlaylistSongOrder,
};

export async function updateCollectionSongOrder({
  collectionId,
  kind,
  songIds,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songIds: number[];
}) {
  await updateCollectionSongOrderWithDependencies(
    {
      collectionId,
      kind,
      songIds,
    },
    collectionSongRelationshipDependencies,
  );
}

export async function removeSongFromCollection({
  collectionId,
  kind,
  songId,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
}) {
  await removeSongFromCollectionWithDependencies(
    {
      collectionId,
      kind,
      songId,
    },
    collectionSongRelationshipDependencies,
  );
}
