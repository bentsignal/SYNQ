import Button, { Label } from "@/src/features/ingest/components/button";
import IngestStepScreen from "@/src/features/ingest/components/IngestStepScreen";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { router } from "expo-router";

const FromNetworkScreen = () => {
  return (
    <IngestStepScreen
      title="Transfer Files"
      description="Network transfer is ready for the next ingest implementation pass."
      detail="Use Next to continue through the current flow."
    />
  );
};

export const FromNetworkControls = () => {
  const { theme } = useThemeContext();
  return (
    <>
      <Button className="flex-1" onPress={() => router.back()}>
        <Label text="Cancel" />
      </Button>
      <Button
        className="flex-1"
        style={{ backgroundColor: theme }}
        onPress={() => router.push("/ingest/export-to-files")}
      >
        <Label text="Next" />
      </Button>
    </>
  );
};

export default FromNetworkScreen;
