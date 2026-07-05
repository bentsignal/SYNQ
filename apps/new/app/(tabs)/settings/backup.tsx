import { BackupScreen } from "@/src/features/backup/screens/BackupScreen";
import { ImportSessionProvider } from "@/src/features/import/state/import-session-store";

export default function BackupRoute() {
  return (
    <ImportSessionProvider>
      <BackupScreen />
    </ImportSessionProvider>
  );
}
