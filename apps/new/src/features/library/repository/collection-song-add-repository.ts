import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import { addSongToAlbum } from "./album-song-add-repository";
import { addSongToArtist } from "./artist-song-add-repository";
import { addSongToPlaylist } from "./playlist-song-add-repository";

export async function addSongToCollection({
  collectionId,
  kind,
  songId,
}: {
  collectionId: number;
  kind: LibraryCollectionDetailKind;
  songId: number;
}) {
  switch (kind) {
    case "album":
      await addSongToAlbum({ albumId: collectionId, songId });
      return;
    case "artist":
      await addSongToArtist({ artistId: collectionId, songId });
      return;
    case "playlist":
      await addSongToPlaylist({ playlistId: collectionId, songId });
  }
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
  for (const songId of songIds) {
    await addSongToCollection({
      collectionId,
      kind,
      songId,
    });
  }
}
