import type { SongType } from "@/src/constants/Types";
import { exportSongs } from "@/src/features/export/lib/export-songs";
import { posthog } from "@/src/lib/posthog";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { router, type Href } from "expo-router";
import { Alert } from "react-native";

const ACTION_DELAY = 10;
const DETAIL_DELETE_DELAY = 300;

export const dismissThen = (sheetName: string, action: () => void) => {
  TrueSheet.dismiss(sheetName);
  setTimeout(action, ACTION_DELAY);
};

export const navigateToEntityEdit = ({
  sheetName,
  eventName,
  path,
}: {
  sheetName: string;
  eventName: string;
  path: Href;
}) => {
  TrueSheet.dismiss(sheetName);
  posthog.capture(eventName);
  setTimeout(() => {
    router.push(path);
  }, ACTION_DELAY);
};

export const exportEntitySongs = async ({
  sheetName,
  eventName,
  loadSongs,
  setShowGlobalLoading,
}: {
  sheetName: string;
  eventName: string;
  loadSongs: () => Promise<SongType[]>;
  setShowGlobalLoading: (show: boolean) => void;
}) => {
  try {
    TrueSheet.dismiss(sheetName);
    posthog.capture(eventName);
    setShowGlobalLoading(true);
    const songs = await loadSongs();
    await exportSongs(songs);
  } catch (error) {
    console.log("error exporting song: ", error);
  } finally {
    setShowGlobalLoading(false);
  }
};

export const deleteAfterLeavingDetail = async (
  isDetailPage: boolean,
  executeDelete: () => Promise<void>,
) => {
  if (isDetailPage) {
    router.back();
    setTimeout(() => {
      executeDelete();
    }, DETAIL_DELETE_DELAY);
    return;
  }

  await executeDelete();
};

export const confirmEntityDelete = ({
  sheetName,
  title,
  message,
  isDetailPage,
  executeDelete,
}: {
  sheetName: string;
  title: string;
  message: string;
  isDetailPage: boolean;
  executeDelete: () => Promise<void>;
}) => {
  dismissThen(sheetName, () => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteAfterLeavingDetail(isDetailPage, executeDelete);
        },
      },
    ]);
  });
};
