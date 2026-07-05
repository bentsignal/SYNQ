import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getCollectionDetailViewState } from "../services/library-collection-detail-view-state-service";

type LibraryCollectionSongEmptyStateModel = ReturnType<
  typeof getCollectionDetailViewState
>["songSection"]["emptyState"];

type LibraryCollectionSongEmptyStateProps = {
  emptyState: LibraryCollectionSongEmptyStateModel;
};

export function LibraryCollectionSongEmptyState({
  emptyState,
}: LibraryCollectionSongEmptyStateProps) {
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
