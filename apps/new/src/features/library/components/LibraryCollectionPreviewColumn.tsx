import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionPreviewColumnState } from "../services/library-collection-preview-service";
import { LibraryCollectionPreviewRow } from "./LibraryCollectionPreviewRow";

type LibraryCollectionPreviewColumnProps = {
  column: LibraryCollectionPreviewColumnState;
};

export function LibraryCollectionPreviewColumn({
  column,
}: LibraryCollectionPreviewColumnProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="text-xs font-extrabold uppercase tracking-normal"
          style={{ color: theme.secondaryText }}
        >
          {column.title}
        </Text>
        {column.total > column.rows.length ? (
          <Link
            className="text-xs font-extrabold uppercase tracking-normal"
            href={column.viewAllHref}
            style={{ color: theme.accent }}
          >
            View all
          </Link>
        ) : null}
      </View>
      <View
        className="overflow-hidden rounded-lg border"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {column.rows.length === 0 ? (
          <Text
            className="p-3.5 text-sm italic leading-5"
            style={{ color: theme.mutedText }}
          >
            None yet
          </Text>
        ) : (
          column.rows.map((row) => (
            <LibraryCollectionPreviewRow
              key={`${row.collection.kind}-${row.collection.id}`}
              row={row}
            />
          ))
        )}
      </View>
    </View>
  );
}
