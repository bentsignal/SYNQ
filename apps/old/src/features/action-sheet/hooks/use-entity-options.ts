import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useEntityOptionActions } from "@/src/features/action-sheet/hooks/use-entity-option-actions";
import { dismissThen } from "@/src/features/action-sheet/lib/entity-option-actions";
import {
  deleteLibraryAlbum,
  deleteLibraryArtist,
  deleteLibraryPlaylist,
} from "@/src/features/library/repository/library-entity-repository";
import {
  getLibraryAlbumSongs,
  getLibraryArtistSongs,
  getLibraryPlaylistSongs,
} from "@/src/features/library/repository/library-song-repository";
import { router } from "expo-router";
import { useCallback } from "react";

export function usePlaylistOptions(sheetName: string) {
  const { editPlaylist } = useActionSheetContext();
  const options = useEntityOptionActions({
    deleteEntity: deleteLibraryPlaylist,
    deleteEventName: "delete_playlist",
    deleteFallbackName: "this playlist",
    deleteMessage: (name) => `Are you sure you want to delete ${name}?`,
    deleteTitle: "Delete Playlist",
    detailPageType: PageType.PLAYLIST,
    editEventName: "edit_playlist",
    entity: editPlaylist,
    exportEventName: "export_playlist",
    getEditPath: (id) => `/playlist/edit/${id}`,
    loadSongs: (playlist) =>
      getLibraryPlaylistSongs({
        playlistId: playlist.id,
        pageType: PageType.PLAYLIST,
      }),
    sheetName,
  });

  return {
    canDelete: editPlaylist.id !== 2,
    ...options,
  };
}

export function useAlbumOptions(sheetName: string) {
  const { editAlbum } = useActionSheetContext();
  const options = useEntityOptionActions({
    deleteEntity: deleteLibraryAlbum,
    deleteEventName: "delete_album",
    deleteFallbackName: "this album",
    deleteMessage: (name) =>
      `Are you sure you want to delete ${name}? (Deleting an album will not remove its songs)`,
    deleteTitle: "Delete Album",
    detailPageType: PageType.ALBUM,
    editEventName: "edit_album",
    entity: editAlbum,
    exportEventName: "export_album",
    getEditPath: (id) => `/album/edit/${id}`,
    loadSongs: (album) => getLibraryAlbumSongs({ albumId: album.id }),
    sheetName,
  });

  const handleReorder = useCallback(() => {
    dismissThen(sheetName, () => {
      router.push("/album/reorder");
    });
  }, [sheetName]);

  return {
    ...options,
    handleReorder,
  };
}

export function useArtistOptions(sheetName: string) {
  const { editArtist } = useActionSheetContext();
  const options = useEntityOptionActions({
    deleteEntity: deleteLibraryArtist,
    deleteEventName: "delete_artist",
    deleteFallbackName: "this artist",
    deleteMessage: (name) =>
      `Are you sure you want to delete ${name}? (Deleting an artist will not remove their songs & albums)`,
    deleteTitle: "Delete Artist",
    detailPageType: PageType.ARTIST,
    editEventName: "edit_artist",
    entity: editArtist,
    exportEventName: "export_artist",
    getEditPath: (id) => `/artist/edit/${id}`,
    loadSongs: (artist) => getLibraryArtistSongs({ artistId: artist.id }),
    sheetName,
  });

  return options;
}
