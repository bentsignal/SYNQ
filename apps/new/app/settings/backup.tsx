import { PlaceholderScreen } from "@/src/features/app-shell/components/PlaceholderScreen";

export default function BackupRoute() {
  return (
    <PlaceholderScreen
      boundary="src/features/backup"
      nextMilestone="Port restore, erase, archive pick, and database reset services."
      reference="apps/old/app/settings/backup.tsx"
      title="Backup & Restore"
    />
  );
}
