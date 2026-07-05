import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionPreviewSectionState } from "../services/library-collection-preview-service";
import { LibraryCollectionPreviewColumn } from "./LibraryCollectionPreviewColumn";
import { LibraryCollectionPreviewEmptyState } from "./LibraryCollectionPreviewEmptyState";

type LibraryCollectionPreviewSectionProps = {
  isEmpty: boolean;
  sectionState: LibraryCollectionPreviewSectionState;
};

export function LibraryCollectionPreviewSection({
  isEmpty,
  sectionState,
}: LibraryCollectionPreviewSectionProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between gap-3">
        <Text
          className="flex-1 text-xl font-extrabold leading-[25px] tracking-normal"
          style={{ color: theme.primaryText }}
        >
          Collections
        </Text>
        <Text
          className="text-xs font-extrabold uppercase leading-[17px] tracking-normal"
          style={{ color: theme.secondaryText }}
        >
          Playlists, albums, artists
        </Text>
      </View>

      {isEmpty ? (
        <LibraryCollectionPreviewEmptyState emptyState={sectionState.emptyState} />
      ) : (
        <View className="gap-3">
          {sectionState.columns.map((column) => (
            <LibraryCollectionPreviewColumn
              column={column}
              key={column.key}
            />
          ))}
        </View>
      )}
    </View>
  );
}
