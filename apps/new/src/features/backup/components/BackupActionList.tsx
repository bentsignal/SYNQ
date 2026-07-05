import { View } from "react-native";
import type { BackupViewState } from "../services/backup-view-state-service";
import type { BackupOperation } from "../types/backup-session";
import { BackupActionCard } from "./BackupActionCard";

type BackupActionListProps = {
  actionCards: BackupViewState["actionCards"];
  runBackupOperation: (operation: BackupOperation) => void;
};

export function BackupActionList({
  actionCards,
  runBackupOperation,
}: BackupActionListProps) {
  return (
    <View className="gap-3">
      {actionCards.map((action) => (
        <BackupActionCard
          action={action}
          key={action.operation}
          onRunOperation={runBackupOperation}
        />
      ))}
    </View>
  );
}
