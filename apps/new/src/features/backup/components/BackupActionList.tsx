import { StyleSheet, View } from "react-native";
import type { BackupScreenController } from "../hooks/use-backup-screen-controller";
import { backupActionCards } from "../services/backup-screen-service";
import { BackupActionCard } from "./BackupActionCard";

type BackupActionListProps = Pick<
  BackupScreenController,
  "getActionState" | "runBackupOperation"
>;

export function BackupActionList({
  getActionState,
  runBackupOperation,
}: BackupActionListProps) {
  return (
    <View style={styles.list}>
      {backupActionCards.map((action) => (
        <BackupActionCard
          action={action}
          actionState={getActionState(action.operation)}
          key={action.operation}
          onRunOperation={runBackupOperation}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
