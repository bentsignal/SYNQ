import PageTitle from "@/src/components/page-title";
import { BottomInset } from "@/src/components/safe-area-insets";
import { SafeContainer } from "@/src/components/safe-container";
import SettingsButton from "@/src/components/settings-button";
import colors from "@/src/lib/colors";
import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { Controls as ExportToFilesControls } from "./export-to-files";
import { Controls as FromFileBrowserControls } from "./from-file-browser";
import { Controls as FromNetworkControls } from "./from-network";
import { Controls as SaveToLibraryControls } from "./save-to-library";

export default function IngestLayout() {
  return (
    <SafeContainer className="bg-background" bottomInset={false}>
      <Header />
      <Stack
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="from-file-browser" />
        <Stack.Screen name="from-network" />
        <Stack.Screen name="export-to-files" />
        <Stack.Screen name="save-to-library" />
        <Stack.Screen name="success" />
        <Stack.Screen name="failure" />
      </Stack>
      <ControlsContainer>
        <Controls />
      </ControlsContainer>
    </SafeContainer>
  );
}

const Header = () => {
  const pathname = usePathname();
  if (pathname === "/ingest/success" || pathname === "/ingest/failure") {
    return null;
  }

  let title = "Import Files";
  switch (pathname) {
    case "/ingest/from-file-browser":
      title = "Import Files";
      break;
    case "/ingest/from-network":
      title = "Transfer Files";
      break;
    case "/ingest/export-to-files":
      title = "Export Files";
      break;
    case "/ingest/save-to-library":
      title = "Save Files";
      break;
  }

  return (
    <View className="flex-row items-center justify-between">
      <PageTitle title={title} />
      <SettingsButton />
    </View>
  );
};

const ControlsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <View className="absolute inset-x-0 bottom-0 px-6">
      <View className="flex-row justify-center gap-4">{children}</View>
      <BottomInset offset={0} />
    </View>
  );
};

const Controls = () => {
  const pathname = usePathname();
  switch (pathname) {
    case "/ingest/from-file-browser":
      return <FromFileBrowserControls />;
    case "/ingest/from-network":
      return <FromNetworkControls />;
    case "/ingest/export-to-files":
      return <ExportToFilesControls />;
    case "/ingest/save-to-library":
      return <SaveToLibraryControls />;
    default:
      return null;
  }
};
