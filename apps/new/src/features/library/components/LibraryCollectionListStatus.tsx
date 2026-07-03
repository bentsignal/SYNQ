import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";

type LibraryCollectionListStatusProps = {
  listState: LibraryCollectionListState;
};

export function LibraryCollectionListStatus({
  listState,
}: LibraryCollectionListStatusProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className={`text-sm leading-5 ${listState.hasErrors ? "font-bold" : ""}`}
        style={{
          color: listState.hasErrors ? theme.danger : theme.secondaryText,
        }}
      >
        {listState.statusLabel}
      </Text>
    </View>
  );
}
