import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSongPreviewEmptyState } from "../services/import-save-screen-state-service";

export function ImportSongPreviewEmptyState() {
  const theme = useCustomizationTheme();
  const emptyState = getImportSongPreviewEmptyState();

  return (
    <View
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-base font-extrabold leading-[21px]"
        style={{ color: theme.primaryText }}
      >
        {emptyState.title}
      </Text>
      <Text
        className="text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
        {emptyState.body}
      </Text>
    </View>
  );
}
