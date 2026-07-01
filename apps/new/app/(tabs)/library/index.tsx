import { PlaceholderScreen } from "@/src/features/app-shell/components/PlaceholderScreen";

export default function LibraryScreen() {
  return (
    <PlaceholderScreen
      boundary="src/features/library"
      nextMilestone="Port reactive song, playlist, album, and artist queries."
      reference="apps/old/src/features/library"
      title="Library"
    />
  );
}
