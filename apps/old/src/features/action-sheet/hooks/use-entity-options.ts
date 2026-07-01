import { useCallback, useEffect, useState } from "react";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import {
  confirmEntityDelete,
  dismissThen,
  exportEntitySongs,
  navigateToEntityEdit,
} from "@/src/features/action-sheet/lib/entity-option-actions";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
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
import { posthog } from "@/src/lib/posthog";
import { router } from "expo-router";

export function usePlaylistOptions(sheetName: string) {
  const { editPlaylist } = useActionSheetContext();
  const { setShowGlobalLoading } = useGlobalProgressContext();
  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editPlaylist.pageType) {
      setPageType(editPlaylist.pageType);
    }
  }, [editPlaylist]);

  const handleEdit = useCallback(() => {
    navigateToEntityEdit({
      sheetName,
      eventName: "edit_playlist",
      path: `/playlist/edit/${editPlaylist.id}`,
    });
  }, [editPlaylist.id, sheetName]);

  const handleExport = useCallback(async () => {
    await exportEntitySongs({
      sheetName,
      eventName: "export_playlist",
      setShowGlobalLoading,
      loadSongs: () =>
        getLibraryPlaylistSongs({
          playlistId: editPlaylist.id,
          pageType: PageType.PLAYLIST,
        }),
    });
  }, [editPlaylist.id, setShowGlobalLoading, sheetName]);

  const executeDelete = useCallback(async () => {
    try {
      posthog.capture("delete_playlist");
      await deleteLibraryPlaylist(editPlaylist.id);
    } catch (error) {
      console.log("error deleting playlist: ", error);
    }
  }, [editPlaylist.id]);

  const handleDelete = useCallback(() => {
    confirmEntityDelete({
      sheetName,
      title: "Delete Playlist",
      message: `Are you sure you want to delete ${editPlaylist.name ?? "this playlist"}?`,
      isDetailPage: pageType === PageType.PLAYLIST,
      executeDelete,
    });
  }, [editPlaylist.name, executeDelete, pageType, sheetName]);

  return {
    canDelete: editPlaylist.id !== 2,
    handleDelete,
    handleEdit,
    handleExport,
    pageType,
  };
}

export function useAlbumOptions(sheetName: string) {
  const { editAlbum } = useActionSheetContext();
  const { setShowGlobalLoading } = useGlobalProgressContext();
  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editAlbum.pageType) {
      setPageType(editAlbum.pageType);
    }
  }, [editAlbum]);

  const handleEdit = useCallback(() => {
    navigateToEntityEdit({
      sheetName,
      eventName: "edit_album",
      path: `/album/edit/${editAlbum.id}`,
    });
  }, [editAlbum.id, sheetName]);

  const handleExport = useCallback(async () => {
    await exportEntitySongs({
      sheetName,
      eventName: "export_album",
      setShowGlobalLoading,
      loadSongs: () => getLibraryAlbumSongs({ albumId: editAlbum.id }),
    });
  }, [editAlbum.id, setShowGlobalLoading, sheetName]);

  const executeDelete = useCallback(async () => {
    try {
      posthog.capture("delete_album");
      await deleteLibraryAlbum(editAlbum.id);
    } catch (error) {
      console.log("error deleting album: ", error);
    }
  }, [editAlbum.id]);

  const handleDelete = useCallback(() => {
    confirmEntityDelete({
      sheetName,
      title: "Delete Album",
      message: `Are you sure you want to delete ${editAlbum.name ?? "this album"}? (Deleting an album will not remove its songs)`,
      isDetailPage: pageType === PageType.ALBUM,
      executeDelete,
    });
  }, [editAlbum.name, executeDelete, pageType, sheetName]);

  const handleReorder = useCallback(() => {
    dismissThen(sheetName, () => {
      router.push("/album/reorder");
    });
  }, [sheetName]);

  return {
    handleDelete,
    handleEdit,
    handleExport,
    handleReorder,
    pageType,
  };
}

export function useArtistOptions(sheetName: string) {
  const { editArtist } = useActionSheetContext();
  const { setShowGlobalLoading } = useGlobalProgressContext();
  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editArtist.pageType) {
      setPageType(editArtist.pageType);
    }
  }, [editArtist]);

  const handleEdit = useCallback(() => {
    navigateToEntityEdit({
      sheetName,
      eventName: "edit_artist",
      path: `/artist/edit/${editArtist.id}`,
    });
  }, [editArtist.id, sheetName]);

  const handleExport = useCallback(async () => {
    await exportEntitySongs({
      sheetName,
      eventName: "export_artist",
      setShowGlobalLoading,
      loadSongs: () => getLibraryArtistSongs({ artistId: editArtist.id }),
    });
  }, [editArtist.id, setShowGlobalLoading, sheetName]);

  const executeDelete = useCallback(async () => {
    try {
      posthog.capture("delete_artist");
      await deleteLibraryArtist(editArtist.id);
    } catch (error) {
      console.log("error deleting artist: ", error);
    }
  }, [editArtist.id]);

  const handleDelete = useCallback(() => {
    confirmEntityDelete({
      sheetName,
      title: "Delete Artist",
      message: `Are you sure you want to delete ${editArtist.name ?? "this artist"}? (Deleting an artist will not remove their songs & albums)`,
      isDetailPage: pageType === PageType.ARTIST,
      executeDelete,
    });
  }, [editArtist.name, executeDelete, pageType, sheetName]);

  return {
    handleDelete,
    handleEdit,
    handleExport,
    pageType,
  };
}
