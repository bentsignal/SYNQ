import { router, Stack } from "expo-router";

import { EmptyState } from "~/components/empty-state";

/**
 * Wi-Fi Transfer. A placeholder for the Library's `plus` menu to open
 * until the transfer screen lands (docs/ui.md → Import → Wi-Fi Transfer).
 */
export default function ImportWifiScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Wi-Fi Transfer" }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <EmptyState className="flex-1" icon="wifi" title="Wi-Fi Transfer" />
    </>
  );
}
