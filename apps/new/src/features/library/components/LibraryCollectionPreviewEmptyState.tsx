import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibraryCollectionPreviewEmptyState } from "../services/library-collection-preview-service";

export function LibraryCollectionPreviewEmptyState() {
  const theme = useCustomizationTheme();
  const emptyState = getLibraryCollectionPreviewEmptyState();

  return (
    <View
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-base font-extrabold leading-[21px] tracking-normal"
        style={{ color: theme.primaryText }}
      >
        {emptyState.title}
      </Text>
      <Text className="text-sm leading-5" style={{ color: theme.secondaryText }}>
        {emptyState.body}
      </Text>
    </View>
  );
}
