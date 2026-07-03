import {
  likedSongsPlaylistId,
  systemPlaylistId,
} from "../services/library-playlist-constants-service";
import {
  deleteAlbumArtistRows,
  deleteAlbumSongRows,
  deleteArtistAlbumRows,
  deleteArtistSongRows,
  deletePlaylistSongRows,
} from "./collection-delete-relationship-repository";
import {
  deleteAlbumRow,
  deleteArtistRow,
  deletePlaylistRow,
} from "./collection-delete-row-repository";
import {
  deleteCollectionWithDependencies,
  type CollectionDeleteDependencies,
  type DeletableCollectionKind,
} from "./collection-delete-executor-repository";

const collectionDeleteDependencies: CollectionDeleteDependencies = {
  deleteAlbumArtistRows,
  deleteAlbumRow,
  deleteAlbumSongRows,
  deleteArtistAlbumRows,
  deleteArtistRow,
  deleteArtistSongRows,
  deletePlaylistRow,
  deletePlaylistSongRows,
  likedSongsPlaylistId,
  systemPlaylistId,
};

export async function deleteCollection({
  id,
  kind,
}: {
  id: number;
  kind: DeletableCollectionKind;
}) {
  await deleteCollectionWithDependencies(
    { id, kind },
    collectionDeleteDependencies,
  );
}
