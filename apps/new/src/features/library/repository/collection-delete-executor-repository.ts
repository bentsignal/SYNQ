import type { CollectionMetadataKind } from "../services/collection-metadata-service";

export type DeletableCollectionKind = CollectionMetadataKind;

export type CollectionDeleteDependencies = {
  deleteAlbumArtistRows: (albumId: number) => Promise<void>;
  deleteAlbumRow: (albumId: number) => Promise<void>;
  deleteAlbumSongRows: (albumId: number) => Promise<void>;
  deleteArtistAlbumRows: (artistId: number) => Promise<void>;
  deleteArtistRow: (artistId: number) => Promise<void>;
  deleteArtistSongRows: (artistId: number) => Promise<void>;
  deletePlaylistRow: (playlistId: number) => Promise<void>;
  deletePlaylistSongRows: (playlistId: number) => Promise<void>;
  likedSongsPlaylistId: number;
  systemPlaylistId: number;
};

export const assertCanDeletePlaylist = ({
  dependencies,
  id,
}: {
  dependencies: Pick<
    CollectionDeleteDependencies,
    "likedSongsPlaylistId" | "systemPlaylistId"
  >;
  id: number;
}) => {
  if (
    id === dependencies.systemPlaylistId ||
    id === dependencies.likedSongsPlaylistId
  ) {
    throw new Error("This system playlist cannot be deleted.");
  }
};

export async function deleteCollectionWithDependencies(
  {
    id,
    kind,
  }: {
    id: number;
    kind: DeletableCollectionKind;
  },
  dependencies: CollectionDeleteDependencies,
) {
  switch (kind) {
    case "album":
      await dependencies.deleteAlbumSongRows(id);
      await dependencies.deleteAlbumArtistRows(id);
      await dependencies.deleteAlbumRow(id);
      return;
    case "artist":
      await dependencies.deleteArtistSongRows(id);
      await dependencies.deleteArtistAlbumRows(id);
      await dependencies.deleteArtistRow(id);
      return;
    case "playlist":
      assertCanDeletePlaylist({ dependencies, id });
      await dependencies.deletePlaylistSongRows(id);
      await dependencies.deletePlaylistRow(id);
  }
}
