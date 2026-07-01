import Button, { Label } from "@/src/features/ingest/components/button";
import IngestStepScreen from "@/src/features/ingest/components/IngestStepScreen";
import { useIngestStore } from "@/src/features/ingest/hooks/use-ingest";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { router } from "expo-router";

const FromFileBrowserScreen = () => {
  const ingestState = useIngestStore((state) => state.ingestState);
  const numFilesToIngest = useIngestStore((state) => state.numFilesToIngest);
  const numFilesIngested = useIngestStore((state) => state.numFilesIngested);
  const filesLabel =
    numFilesToIngest > 0
      ? `${numFilesIngested} of ${numFilesToIngest} files processed`
      : "Waiting for file selection";

  return (
    <IngestStepScreen
      title="Importing Files"
      description={`Current state: ${ingestState}`}
      detail={filesLabel}
    />
  );
};

export const FromFileBrowserControls = () => {
  const { theme } = useThemeContext();
  const disabled = useIngestStore((state) => state.ingestState !== "idle");
  return (
    <>
      <Button
        className="flex-1"
        onPress={() => router.back()}
        disabled={disabled}
      >
        <Label text="Cancel" />
      </Button>
      <Button
        className="flex-1"
        style={{ backgroundColor: theme }}
        onPress={() => router.push("/ingest/export-to-files")}
        disabled={disabled}
      >
        <Label text="Next" />
      </Button>
    </>
  );
};

export default FromFileBrowserScreen;
