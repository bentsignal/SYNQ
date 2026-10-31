import { router, Stack } from "expo-router";

import { EmptyState } from "~/components/empty-state";

/**
 * Import from Files. A placeholder for the Library's `plus` menu to open
 * until the import flow lands (docs/ui.md → Import → Files).
 */
export default function ImportFilesScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Import from Files" }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <EmptyState className="flex-1" icon="folder" title="Import from Files" />
    </>
  );
}
