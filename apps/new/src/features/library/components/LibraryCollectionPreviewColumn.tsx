import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionPreview } from "../hooks/use-library-collection-preview-query";
import { getLibraryCollectionPreviewRows } from "../services/library-collection-preview-service";
import { LibraryCollectionPreviewRow } from "./LibraryCollectionPreviewRow";

type LibraryCollectionPreviewColumnProps = {
  collections: LibraryCollectionPreview[];
  title: string;
  total: number;
  viewAllHref:
    | "/(tabs)/library/albums"
    | "/(tabs)/library/artists"
    | "/(tabs)/library/playlists";
};

export function LibraryCollectionPreviewColumn({
  collections,
  title,
  total,
  viewAllHref,
}: LibraryCollectionPreviewColumnProps) {
  const theme = useCustomizationTheme();
  const rows = getLibraryCollectionPreviewRows(collections);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="text-xs font-extrabold uppercase tracking-normal"
          style={{ color: theme.secondaryText }}
        >
          {title}
        </Text>
        {total > collections.length ? (
          <Link
            className="text-xs font-extrabold uppercase tracking-normal"
            href={viewAllHref}
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
        {collections.length === 0 ? (
          <Text
            className="p-3.5 text-sm italic leading-5"
            style={{ color: theme.mutedText }}
          >
            None yet
          </Text>
        ) : (
          rows.map((row) => (
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
