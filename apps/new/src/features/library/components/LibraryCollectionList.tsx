import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";

type LibraryCollectionListProps = {
  listState: LibraryCollectionListState;
};

export function LibraryCollectionList({ listState }: LibraryCollectionListProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="overflow-hidden rounded-lg border"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {listState.visibleCollections.length === 0 ? (
        <Text
          className="p-3.5 text-sm italic leading-5"
          style={{ color: theme.mutedText }}
        >
          {listState.emptyLabel}
        </Text>
      ) : (
        listState.visibleRows.map((row) => {
          const { collection } = row;

          return (
            <Link
              asChild
              href={row.href}
              key={`${collection.kind}-${collection.id}`}
            >
              <Pressable
                className="min-h-16 flex-row items-center gap-3 border-b px-3.5 py-2.5"
                style={{ borderBottomColor: theme.borderSubtle }}
              >
                {collection.imagePath ? (
                  <Image
                    className="h-11 w-11 rounded-md"
                    source={{ uri: collection.imagePath }}
                  />
                ) : (
                  <View
                    className="h-11 w-11 items-center justify-center rounded-md"
                    style={{ backgroundColor: theme.background }}
                  >
                    <Text
                      className="text-base font-extrabold leading-[21px]"
                      style={{ color: theme.accent }}
                    >
                      {collection.title.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="min-w-0 flex-1 gap-1">
                  <Text
                    className="text-[15px] font-extrabold leading-5"
                    numberOfLines={1}
                    style={{ color: theme.primaryText }}
                  >
                    {collection.title}
                  </Text>
                  <Text
                    className="text-[13px] leading-[18px]"
                    numberOfLines={1}
                    style={{ color: theme.secondaryText }}
                  >
                    {collection.meta}
                  </Text>
                </View>
                <Text
                  className="max-w-[118px] text-right text-xs font-extrabold"
                  style={{ color: theme.primaryText }}
                >
                  {collection.detail}
                </Text>
              </Pressable>
            </Link>
          );
        })
      )}
    </View>
  );
}
