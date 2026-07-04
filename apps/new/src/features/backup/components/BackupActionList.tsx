import { View } from "react-native";
import type { BackupScreenController } from "../hooks/use-backup-screen-controller";
import { BackupActionCard } from "./BackupActionCard";

type BackupActionListProps = Pick<
  BackupScreenController,
  "actionCards" | "runBackupOperation"
>;

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
