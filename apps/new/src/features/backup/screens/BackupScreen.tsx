import { BackupScreenView } from "../components/BackupScreenView";
import { useBackupScreenController } from "../hooks/use-backup-screen-controller";

export function BackupScreen() {
  return <BackupScreenView {...useBackupScreenController()} />;
}
