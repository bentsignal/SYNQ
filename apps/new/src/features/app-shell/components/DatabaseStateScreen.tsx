import { ActivityIndicator, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type DatabaseStateScreenProps = {
  title: string;
  detail: string;
  showSpinner?: boolean;
};

export function DatabaseStateScreen({
  detail,
  showSpinner = false,
  title,
}: DatabaseStateScreenProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="flex-1 items-center justify-center p-5"
      style={{ backgroundColor: theme.background }}
    >
      <View
        className="max-w-[360px] items-center gap-3 rounded-lg border p-5"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {showSpinner ? <ActivityIndicator color={theme.accent} /> : null}
        <Text
          className="text-center text-lg font-extrabold leading-[23px]"
          style={{ color: theme.primaryText }}
        >
          {title}
        </Text>
        <Text
          className="text-center text-sm leading-5"
          style={{ color: theme.secondaryText }}
        >
          {detail}
        </Text>
      </View>
    </View>
  );
}
