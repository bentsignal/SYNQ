import Button, { Label } from "@/src/features/ingest/components/button";
import IngestStepScreen from "@/src/features/ingest/components/IngestStepScreen";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { router } from "expo-router";

const SaveToLibraryScreen = () => {
  return (
    <IngestStepScreen
      title="Save Files"
      description="Library save is ready for the next ingest implementation pass."
      detail="Use Finish to complete the current flow."
    />
  );
};

export const SaveToLibraryControls = () => {
  const { theme } = useThemeContext();
  return (
    <>
      <Button className="flex-1" onPress={() => router.back()}>
        <Label text="Back" />
      </Button>
      <Button
        className="flex-1"
        style={{ backgroundColor: theme }}
        onPress={() => router.push("/ingest/success")}
      >
        <Label text="Finish" />
      </Button>
    </>
  );
};

export default SaveToLibraryScreen;
