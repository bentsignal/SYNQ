import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionPreviewRowState } from "../services/library-collection-preview-navigation-service";

type LibraryCollectionPreviewRowProps = {
  row: LibraryCollectionPreviewRowState;
};

export function LibraryCollectionPreviewRow({
  row,
}: LibraryCollectionPreviewRowProps) {
  const theme = useCustomizationTheme();
  const { collection } = row;

  return (
    <Link
      asChild
      href={row.href}
      key={`${collection.kind}-${collection.id}`}
    >
      <Pressable
        className="min-h-[62px] flex-row items-center gap-3 border-b px-3.5 py-2.5"
        style={{ borderBottomColor: theme.borderSubtle }}
      >
        {collection.imagePath ? (
          <Image
            className="h-[42px] w-[42px] rounded-md"
            source={{ uri: collection.imagePath }}
          />
        ) : (
          <View
            className="h-[42px] w-[42px] items-center justify-center rounded-md"
            style={{ backgroundColor: theme.background }}
          >
            <Text
              className="text-base font-extrabold leading-[21px] tracking-normal"
              style={{ color: theme.accent }}
            >
              {collection.title.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <View className="min-w-0 flex-1 gap-1">
          <Text
            numberOfLines={1}
            className="text-[15px] font-extrabold leading-5 tracking-normal"
            style={{ color: theme.primaryText }}
          >
            {collection.title}
          </Text>
          <Text
            numberOfLines={1}
            className="text-[13px] leading-[18px]"
            style={{ color: theme.secondaryText }}
          >
            {collection.meta}
          </Text>
        </View>
        <Text
          className="max-w-[110px] text-right text-xs font-extrabold tracking-normal"
          style={{ color: theme.primaryText }}
        >
          {collection.detail}
        </Text>
      </Pressable>
    </Link>
  );
}
