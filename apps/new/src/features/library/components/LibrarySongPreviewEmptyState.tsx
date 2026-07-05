import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getLibrarySongPreviewListState } from "../services/library-song-preview-list-state-service";

type LibrarySongPreviewEmptyStateModel = ReturnType<
  typeof getLibrarySongPreviewListState
>["emptyState"];

type LibrarySongPreviewEmptyStateProps = {
  emptyState: LibrarySongPreviewEmptyStateModel;
};

export function LibrarySongPreviewEmptyState({
  emptyState,
}: LibrarySongPreviewEmptyStateProps) {
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
      <Link
        className="text-[13px] font-extrabold uppercase tracking-normal"
        href={emptyState.link.href}
        style={{ color: theme.accent }}
      >
        {emptyState.link.label}
      </Link>
    </View>
  );
}
