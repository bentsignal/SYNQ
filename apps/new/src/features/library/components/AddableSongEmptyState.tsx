import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function AddableSongEmptyState() {
  const theme = useCustomizationTheme();

  return (
    <View
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-base font-extrabold leading-[21px]"
        style={{ color: theme.primaryText }}
      >
        No matching songs
      </Text>
      <Text
        className="text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
        Try a different search term or import more music into the library.
      </Text>
    </View>
  );
}
