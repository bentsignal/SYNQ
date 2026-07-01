import { useCallback, useEffect, useState } from "react";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import { exportSongs } from "@/src/features/export/lib/export-songs";
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
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Alert } from "react-native";

const actionDelay = 10;

const dismissThen = (sheetName: string, action: () => void) => {
  TrueSheet.dismiss(sheetName);
  setTimeout(action, actionDelay);
};

const deleteAfterLeavingDetail = async (
  isDetailPage: boolean,
  executeDelete: () => Promise<void>,
) => {
  if (isDetailPage) {
    router.back();
    setTimeout(() => {
      executeDelete();
    }, 300);
    return;
  }

  await executeDelete();
};

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
    TrueSheet.dismiss(sheetName);
    posthog.capture("edit_playlist");
    setTimeout(() => {
      router.push(`/playlist/edit/${editPlaylist.id}`);
    }, actionDelay);
  }, [editPlaylist.id, sheetName]);

  const handleExport = useCallback(async () => {
    try {
      TrueSheet.dismiss(sheetName);
      posthog.capture("export_playlist");
      setShowGlobalLoading(true);
      const songs = await getLibraryPlaylistSongs({
        playlistId: editPlaylist.id,
        pageType: PageType.PLAYLIST,
      });
      await exportSongs(songs);
    } catch (error) {
      console.log("error exporting song: ", error);
    } finally {
      setShowGlobalLoading(false);
    }
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
    dismissThen(sheetName, () => {
      Alert.alert(
        "Delete Playlist",
        `Are you sure you want to delete ${editPlaylist.name ?? "this playlist"}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteAfterLeavingDetail(
                pageType === PageType.PLAYLIST,
                executeDelete,
              );
            },
          },
        ],
      );
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
    TrueSheet.dismiss(sheetName);
    posthog.capture("edit_album");
    setTimeout(() => {
      router.push(`/album/edit/${editAlbum.id}`);
    }, actionDelay);
  }, [editAlbum.id, sheetName]);

  const handleExport = useCallback(async () => {
    try {
      TrueSheet.dismiss(sheetName);
      posthog.capture("export_album");
      setShowGlobalLoading(true);
      const songs = await getLibraryAlbumSongs({ albumId: editAlbum.id });
      await exportSongs(songs);
    } catch (error) {
      console.log("error exporting song: ", error);
    } finally {
      setShowGlobalLoading(false);
    }
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
    dismissThen(sheetName, () => {
      Alert.alert(
        "Delete Album",
        `Are you sure you want to delete ${editAlbum.name ?? "this album"}? (Deleting an album will not remove its songs)`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteAfterLeavingDetail(
                pageType === PageType.ALBUM,
                executeDelete,
              );
            },
          },
        ],
      );
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
    TrueSheet.dismiss(sheetName);
    posthog.capture("edit_artist");
    setTimeout(() => {
      router.push(`/artist/edit/${editArtist.id}`);
    }, actionDelay);
  }, [editArtist.id, sheetName]);

  const handleExport = useCallback(async () => {
    try {
      TrueSheet.dismiss(sheetName);
      posthog.capture("export_artist");
      setShowGlobalLoading(true);
      const songs = await getLibraryArtistSongs({ artistId: editArtist.id });
      await exportSongs(songs);
    } catch (error) {
      console.log("error exporting song: ", error);
    } finally {
      setShowGlobalLoading(false);
    }
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
    dismissThen(sheetName, () => {
      Alert.alert(
        "Delete Artist",
        `Are you sure you want to delete ${editArtist.name ?? "this artist"}? (Deleting an artist will not remove their songs & albums)`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteAfterLeavingDetail(
                pageType === PageType.ARTIST,
                executeDelete,
              );
            },
          },
        ],
      );
    });
  }, [editArtist.name, executeDelete, pageType, sheetName]);

  return {
    handleDelete,
    handleEdit,
    handleExport,
    pageType,
  };
}
