import { useEffect, useState } from "react";
import SheetOption from "@/src/components/sheet/SheetOption";
import { PageType } from "@/src/constants/Types";
import { useActionSheetContext } from "@/src/features/action-sheet/context/ActionSheetProvider";
import { usePremiumContext } from "@/src/context/PremiumProvider";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { exportSongs } from "@/src/controllers/ImportExportController";
import { useGlobalProgressContext } from "@/src/features/app-shell/context/GlobalProgressProvider";
import {
  deletePlaylist,
  getPlaylistSongs,
} from "@/src/controllers/PlaylistController";
import { getSongByResult } from "@/src/controllers/SongController";
import { posthog } from "@/src/lib/posthog";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router } from "expo-router";
import { Share, SquarePen, Trash } from "lucide-react-native";
import { Alert } from "react-native";

const PlaylistOptions = ({ name }: { name: string }) => {
  const { editPlaylist } = useActionSheetContext();
  const { setShowGlobalLoading } = useGlobalProgressContext();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();

  const [pageType, setPageType] = useState<PageType>(PageType.IMPORT);

  useEffect(() => {
    if (editPlaylist.pageType) {
      setPageType(editPlaylist.pageType);
    }
  }, [editPlaylist]);

  const actionDelay = 10;

  const handleEdit = () => {
    TrueSheet.dismiss(name);
    posthog.capture("edit_playlist");
    setTimeout(() => {
      router.push(`/playlist/edit/${editPlaylist.id}`);
    }, actionDelay);
  };

  const handleExport = async () => {
    try {
      TrueSheet.dismiss(name);
      posthog.capture("export_playlist");
      setShowGlobalLoading(true);
      let songs = await getPlaylistSongs(editPlaylist.id);
      console.log(songs);
      await exportSongs(songs);
      setShowGlobalLoading(false);
    } catch (error) {
      console.log("error exporting song: ", error);
      setShowGlobalLoading(false);
    }
  };

  const executeDelete = async () => {
    try {
      posthog.capture("delete_playlist");
      await deletePlaylist(editPlaylist.id);
    } catch (error) {
      console.log("error deleting playlist: ", error);
    }
  };

  const handleDelete = () => {
    TrueSheet.dismiss(name);
    setTimeout(() => {
      Alert.alert(
        "Delete Playlist",
        `Are you sure you want to delete ${editPlaylist.name ?? "this playlist"}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              if (pageType === PageType.PLAYLIST) {
                router.back();
                setTimeout(() => {
                  executeDelete();
                }, 300);
              } else {
                executeDelete();
              }
            },
          },
        ],
      );
    }, actionDelay);
  };

  return (
    <>
      <SheetOption
        icon={SquarePen}
        text={"Edit"}
        show={[PageType.LIBRARY, PageType.PLAYLIST].includes(pageType)}
        handler={handleEdit}
      />
      <SheetOption
        icon={Share}
        text={"Export"}
        show={
          [PageType.LIBRARY, PageType.PLAYLIST].includes(pageType) && premium
        }
        handler={handleExport}
        premiumOnly
      />
      <SheetOption
        icon={Trash}
        text={"Delete"}
        show={
          [PageType.LIBRARY, PageType.PLAYLIST].includes(pageType) &&
          editPlaylist.id !== 2
        }
        handler={handleDelete}
      />
    </>
  );
};

export default PlaylistOptions;
