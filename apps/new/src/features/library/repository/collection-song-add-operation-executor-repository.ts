import type {
  CollectionSongAddDependencies,
} from "./collection-song-add-executor-repository";
import type { CollectionSongAddOperation } from "./collection-song-add-step-repository";

export const executeCollectionSongAddOperation = async (
  operation: CollectionSongAddOperation,
  dependencies: CollectionSongAddDependencies,
) => {
  switch (operation.kind) {
    case "album":
      await dependencies.addSongToAlbum({
        albumId: operation.albumId,
        songId: operation.songId,
      });
      return;
    case "artist":
      await dependencies.addSongToArtist({
        artistId: operation.artistId,
        songId: operation.songId,
      });
      return;
    case "playlist":
      await dependencies.addSongToPlaylist({
        playlistId: operation.playlistId,
        songId: operation.songId,
      });
  }
};
