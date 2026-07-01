import { useCallback, useState } from "react";
import { resetBackupDatabaseConnection } from "@/src/features/backup/lib/backup-database-service";
import { resetPlaybackQueue } from "@/src/features/playback/lib/player-queue-actions-service";
import { posthog } from "@/src/lib/posthog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { Alert, Linking } from "react-native";
import { unzip, zip } from "react-native-zip-archive";

const supportUrl = "https://directedbyshawn.com/synq-support";

const getDocumentDirectory = () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return FileSystem.documentDirectory;
};

const wrapError = (message: string, error: unknown) => {
  const details = error instanceof Error ? error.message : String(error);
  return new Error(`${message} ${details}`);
};

const clearDocumentDirectory = async () => {
  const documentDirectory = getDocumentDirectory();
  const items = await FileSystem.readDirectoryAsync(documentDirectory);
  for (const item of items) {
    await FileSystem.deleteAsync(`${documentDirectory}${item}`);
  }
};

const clearAsyncStorage = async () => {
  await AsyncStorage.clear();
};

const resetDB = async () => {
  await resetBackupDatabaseConnection();
};

const navigateToLibrary = () => {
  router.replace({
    pathname: "/(tabs)/library",
    params: {
      category: "songs",
      resetKey: Date.now().toString(),
    },
  });
};

export function useBackupActions({ premium }: { premium: boolean }) {
  const [loading, setLoading] = useState(false);

  const showErrorAlert = useCallback((message: string) => {
    Alert.alert("Error", message, [
      {
        text: "Dismiss",
        style: "cancel",
      },
      {
        text: "Contact Support",
        style: "default",
        onPress: () => {
          Linking.openURL(supportUrl);
        },
      },
    ]);
  }, []);

  const clearLocalState = useCallback(async () => {
    try {
      await clearDocumentDirectory();
    } catch (error) {
      throw wrapError("Error clearing document directory:", error);
    }
    try {
      await clearAsyncStorage();
    } catch (error) {
      throw wrapError("Error clearing async storage:", error);
    }
  }, []);

  const resetRuntimeState = useCallback(async () => {
    try {
      await resetDB();
    } catch (error) {
      throw wrapError("Error reconnecting to db:", error);
    }
    try {
      await resetPlaybackQueue();
    } catch (error) {
      throw wrapError("Error resetting track player:", error);
    }
  }, []);

  const resetLocalState = useCallback(async () => {
    await clearLocalState();
    await resetRuntimeState();
  }, [clearLocalState, resetRuntimeState]);

  const handlePremiumPress = useCallback(() => {
    posthog.capture("check_premium", {
      premium,
    });
    router.push("/premium");
  }, [premium]);

  const handleBackup = useCallback(async () => {
    try {
      setLoading(true);
      const documentDirectory = getDocumentDirectory();
      const pathToZip = await zip(
        documentDirectory,
        `${documentDirectory}backup.zip`,
      );
      await Sharing.shareAsync(pathToZip);
    } catch (error) {
      console.log("Error backing up library:", error);
      showErrorAlert(
        "Failed to backup library. If the error persists, please contact support.",
      );
    } finally {
      setLoading(false);
    }
  }, [showErrorAlert]);

  const handleRestore = useCallback(async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      await clearLocalState();

      try {
        await unzip(result.assets[0].uri, getDocumentDirectory());
      } catch (error) {
        throw wrapError("Error unzipping backup:", error);
      }
      await resetRuntimeState();

      Alert.alert("Success", "Library restored successfully.");
      navigateToLibrary();
    } catch (error) {
      console.log("Error restoring backup:", error);
      showErrorAlert(
        "Failed to restore backup. If the error persists, please contact support.",
      );
    } finally {
      setLoading(false);
    }
  }, [clearLocalState, resetRuntimeState, showErrorAlert]);

  const confirmEraseLibrary = useCallback(async () => {
    setLoading(true);
    try {
      await resetLocalState();
      Alert.alert("Success", "Library erased successfully.");
      navigateToLibrary();
    } catch (error) {
      console.log("Error resetting app:", error);
      showErrorAlert(
        "Failed to reset app. If the error persists, please contact support.",
      );
    } finally {
      setLoading(false);
    }
  }, [resetLocalState, showErrorAlert]);

  const eraseLibrary = useCallback(() => {
    try {
      Alert.alert(
        "Warning",
        "Are you sure you want to erase your library? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Erase",
            style: "destructive",
            onPress: confirmEraseLibrary,
          },
        ],
      );
    } catch (error) {
      console.log("Error erasing library:", error);
      showErrorAlert(
        "Failed to erase library. If the error persists, please contact support.",
      );
    }
  }, [confirmEraseLibrary, showErrorAlert]);

  return {
    eraseLibrary,
    handleBackup,
    handlePremiumPress,
    handleRestore,
    loading,
  };
}
