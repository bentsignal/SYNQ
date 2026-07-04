import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongPreviewEmptyState as ImportSongPreviewEmptyStateConfig } from "../services/import-song-preview-state-service";

type ImportSongPreviewEmptyStateProps = {
  emptyState: ImportSongPreviewEmptyStateConfig;
};

export function ImportSongPreviewEmptyState({
  emptyState,
}: ImportSongPreviewEmptyStateProps) {
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
