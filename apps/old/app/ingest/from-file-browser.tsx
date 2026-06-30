import Button, { Label } from "@/src/components/button";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { useIngestStore } from "@/src/features/ingest/hooks/use-ingest";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function FromFileBrowser() {
  const ingestState = useIngestStore((state) => state.ingestState);
  const numFilesToIngest = useIngestStore((state) => state.numFilesToIngest);
  const numFilesIngested = useIngestStore((state) => state.numFilesIngested);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold text-foreground">{ingestState}</Text>
      <Text className="text-2xl font-bold text-foreground">
        {numFilesToIngest}
      </Text>
      <Text className="text-2xl font-bold text-foreground">
        {numFilesIngested}
      </Text>
    </View>
  );
}

export const Controls = () => {
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
