import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type EditImportSongSourcePanelProps = {
  fileName: string;
};

export function EditImportSongSourcePanel({
  fileName,
}: EditImportSongSourcePanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="mt-1 gap-1 rounded-lg border p-3"
      style={{ backgroundColor: theme.background, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Source file
      </Text>
      <Text
        numberOfLines={2}
        className="text-sm leading-5"
        style={{ color: theme.primaryText }}
      >
        {fileName}
      </Text>
    </View>
  );
}
