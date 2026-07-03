import { Image, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";

type LibraryCollectionDetailHeaderProps = {
  detail: LibraryCollectionDetail;
  updatedLabel: string;
};

export function LibraryCollectionDetailHeader({
  detail,
  updatedLabel,
}: LibraryCollectionDetailHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <View className="gap-2">
        {detail.imagePath ? (
          <Image
            className="h-[132px] w-[132px] rounded-lg"
            source={{ uri: detail.imagePath }}
          />
        ) : (
          <View
            className="h-[132px] w-[132px] items-center justify-center rounded-lg border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <Text
              className="text-[44px] font-extrabold leading-[52px]"
              style={{ color: theme.accent }}
            >
              {detail.title.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          {detail.eyebrow}
        </Text>
        <Text
          className="text-[34px] font-extrabold leading-10"
          style={{ color: theme.primaryText }}
        >
          {detail.title}
        </Text>
        <Text
          className="max-w-[520px] text-[15px] leading-[22px]"
          style={{ color: theme.secondaryText }}
        >
          {detail.meta}
        </Text>
      </View>

      <View
        className="gap-1.5 rounded-lg border p-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <Text
          className="text-[22px] font-extrabold leading-7"
          style={{ color: theme.primaryText }}
        >
          {detail.detail}
        </Text>
        <Text
          className="text-[13px] font-bold leading-[18px]"
          style={{ color: theme.secondaryText }}
        >
          {detail.isMissing ? "Collection not found" : updatedLabel}
        </Text>
      </View>
    </>
  );
}
