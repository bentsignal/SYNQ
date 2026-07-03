import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type AddCollectionSongsSectionHeaderProps = {
  updatedLabel: string;
};

export function AddCollectionSongsSectionHeader({
  updatedLabel,
}: AddCollectionSongsSectionHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="flex-row items-end justify-between gap-3">
      <Text
        className="flex-1 text-xl font-extrabold leading-[25px]"
        style={{ color: theme.primaryText }}
      >
        Songs
      </Text>
      <Text
        className="text-right text-xs font-extrabold uppercase leading-[17px]"
        style={{ color: theme.secondaryText }}
      >
        {updatedLabel}
      </Text>
    </View>
  );
}
