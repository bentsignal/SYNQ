import Button, { Label } from "@/src/features/ingest/components/button";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function FromFileBrowser() {
  return Array.from({ length: 100 }).map((_, index) => (
    <View key={index} className="bg-red-500 h-10 w-10">
      <Text className="text-white">{index}</Text>
    </View>
  ));
}

export const Controls = () => {
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
