import { useCallback, useState } from "react";
import {
  createAndShareBackupArchive,
  restoreBackupArchive,
} from "@/src/features/backup/lib/backup-file-service";
import { pickBackupArchive } from "@/src/features/backup/lib/backup-document-picker-service";
import {
  clearBackupLocalState,
  resetBackupLocalAndRuntimeState,
  resetBackupRuntimeState,
} from "@/src/features/backup/lib/backup-reset-service";
import { posthog } from "@/src/lib/posthog";
import { router } from "expo-router";
import { Alert, Linking } from "react-native";

const supportUrl = "https://directedbyshawn.com/synq-support";

const wrapRestoreError = (message: string, error: unknown) => {
  const details = error instanceof Error ? error.message : String(error);
  return new Error(`${message} ${details}`);
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

  const handlePremiumPress = useCallback(() => {
    posthog.capture("check_premium", {
      premium,
    });
    router.push("/premium");
  }, [premium]);

  const handleBackup = useCallback(async () => {
    try {
      setLoading(true);
      await createAndShareBackupArchive();
    } catch {
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
      const backupArchiveUri = await pickBackupArchive();

      if (!backupArchiveUri) {
        return;
      }

      await clearBackupLocalState();

      try {
        await restoreBackupArchive(backupArchiveUri);
      } catch (error) {
        throw wrapRestoreError("Error unzipping backup:", error);
      }
      await resetBackupRuntimeState();

      Alert.alert("Success", "Library restored successfully.");
      navigateToLibrary();
    } catch {
      showErrorAlert(
        "Failed to restore backup. If the error persists, please contact support.",
      );
    } finally {
      setLoading(false);
    }
  }, [showErrorAlert]);

  const confirmEraseLibrary = useCallback(async () => {
    setLoading(true);
    try {
      await resetBackupLocalAndRuntimeState();
      Alert.alert("Success", "Library erased successfully.");
      navigateToLibrary();
    } catch {
      showErrorAlert(
        "Failed to reset app. If the error persists, please contact support.",
      );
    } finally {
      setLoading(false);
    }
  }, [showErrorAlert]);

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
    } catch {
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
