import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type LibrarySectionHeaderProps = {
  meta: string;
  title: string;
};

export function LibrarySectionHeader({ meta, title }: LibrarySectionHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="flex-row items-end justify-between gap-3">
      <Text
        className="flex-1 text-xl font-extrabold leading-[25px] tracking-normal"
        style={{ color: theme.primaryText }}
      >
        {title}
      </Text>
      <Text
        className="text-xs font-extrabold uppercase leading-[17px] tracking-normal"
        style={{ color: theme.secondaryText }}
      >
        {meta}
      </Text>
    </View>
  );
}
