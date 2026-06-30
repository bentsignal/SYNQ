import Button, { Label } from "@/src/components/button";
import { useThemeContext } from "@/src/context/ThemeProvider";
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
