import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../hooks/use-library-song-detail-query";

type EditLibrarySongHeaderProps = {
  detail: LibrarySongDetail;
};

export function EditLibrarySongHeader({ detail }: EditLibrarySongHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        Edit song
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
        {detail.originalFileName}
      </Text>
    </View>
  );
}
