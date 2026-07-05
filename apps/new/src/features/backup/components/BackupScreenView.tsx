import { Link } from "expo-router";
import { ScrollView } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { BackupScreenController } from "../hooks/use-backup-screen-controller";
import { BackupActionList } from "./BackupActionList";
import { BackupScreenHeader } from "./BackupScreenHeader";
import { BackupStatusPanel } from "./BackupStatusPanel";

type BackupScreenViewProps = BackupScreenController;

export function BackupScreenView({
  resetStatus,
  runBackupOperation,
  viewState,
}: BackupScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 py-14"
      style={{ backgroundColor: theme.background }}
    >
      <BackupScreenHeader />
      <BackupActionList
        actionCards={viewState.actionCards}
        runBackupOperation={runBackupOperation}
      />
      <BackupStatusPanel
        resetStatus={resetStatus}
        statusState={viewState.statusState}
      />

      <Link
        className="text-[15px] font-extrabold"
        href={viewState.screenState.backLink.href}
        style={{ color: theme.accent }}
      >
        {viewState.screenState.backLink.label}
      </Link>
    </ScrollView>
  );
}
