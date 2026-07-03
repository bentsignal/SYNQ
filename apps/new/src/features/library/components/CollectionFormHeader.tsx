import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { CollectionFormCopy } from "./collection-form-types";

type CollectionFormHeaderProps = {
  copy: CollectionFormCopy;
  subtitle: string;
};

export function CollectionFormHeader({
  copy,
  subtitle,
}: CollectionFormHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {copy.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {copy.title}
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: theme.secondaryText }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
