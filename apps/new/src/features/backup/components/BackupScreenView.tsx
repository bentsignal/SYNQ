import { Link } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { BackupScreenController } from "../hooks/use-backup-screen-controller";
import { BackupActionList } from "./BackupActionList";
import { BackupScreenHeader } from "./BackupScreenHeader";
import { BackupStatusPanel } from "./BackupStatusPanel";

type BackupScreenViewProps = BackupScreenController;

export function BackupScreenView({
  getActionState,
  resetStatus,
  runBackupOperation,
  statusState,
}: BackupScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <BackupScreenHeader />
      <BackupActionList
        getActionState={getActionState}
        runBackupOperation={runBackupOperation}
      />
      <BackupStatusPanel resetStatus={resetStatus} statusState={statusState} />

      <Link
        href="/(tabs)/settings"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to Settings
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
