import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../services/library-song-detail-types-service";

type LibrarySongDetailHeaderProps = {
  detail: LibrarySongDetail;
};

export function LibrarySongDetailHeader({ detail }: LibrarySongDetailHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <View className="gap-2">
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          Song
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
          {detail.relationshipSummary}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <View
          className="min-h-[92px] min-w-[140px] flex-grow basis-[47%] gap-1.5 rounded-lg border p-4"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <Text
            className="text-[22px] font-extrabold leading-7"
            style={{ color: theme.primaryText }}
          >
            {detail.durationLabel}
          </Text>
          <Text
            className="text-[13px] font-bold leading-[18px]"
            style={{ color: theme.secondaryText }}
          >
            Duration
          </Text>
        </View>
        <View
          className="min-h-[92px] min-w-[140px] flex-grow basis-[47%] gap-1.5 rounded-lg border p-4"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <Text
            className="text-[22px] font-extrabold leading-7"
            style={{ color: theme.primaryText }}
          >
            {detail.fileType}
          </Text>
          <Text
            className="text-[13px] font-bold leading-[18px]"
            style={{ color: theme.secondaryText }}
          >
            File type
          </Text>
        </View>
      </View>
    </>
  );
}
