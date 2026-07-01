import Button, { Label } from "@/src/features/ingest/components/button";
import IngestStepScreen from "@/src/features/ingest/components/IngestStepScreen";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { router } from "expo-router";

const ExportToFilesScreen = () => {
  return (
    <IngestStepScreen
      title="Export Files"
      description="Export preparation is ready for the next ingest implementation pass."
      detail="Use Next to continue through the current flow."
    />
  );
};

export const ExportToFilesControls = () => {
  const { theme } = useThemeContext();
  return (
    <>
      <Button className="flex-1" onPress={() => router.back()}>
        <Label text="Back" />
      </Button>
      <Button
        className="flex-1"
        style={{ backgroundColor: theme }}
        onPress={() => router.push("/ingest/save-to-library")}
      >
        <Label text="Next" />
      </Button>
    </>
  );
};

export default ExportToFilesScreen;
