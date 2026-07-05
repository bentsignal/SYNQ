import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getLibraryCollectionPreviewSectionState } from "../services/library-collection-preview-service";

type LibraryCollectionPreviewEmptyStateModel = ReturnType<
  typeof getLibraryCollectionPreviewSectionState
>["emptyState"];

type LibraryCollectionPreviewEmptyStateProps = {
  emptyState: LibraryCollectionPreviewEmptyStateModel;
};

export function LibraryCollectionPreviewEmptyState({
  emptyState,
}: LibraryCollectionPreviewEmptyStateProps) {
  const theme = useCustomizationTheme();
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
