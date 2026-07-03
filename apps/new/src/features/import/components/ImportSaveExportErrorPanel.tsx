import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportSaveExportErrorPanelProps = {
  exportError: string | null;
};

export function ImportSaveExportErrorPanel({
  exportError,
}: ImportSaveExportErrorPanelProps) {
  const theme = useCustomizationTheme();

  if (!exportError) {
    return null;
  }

  return (
    <View
      className="rounded-lg border p-3.5"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-sm font-bold leading-5"
        style={{ color: theme.danger }}
      >
        {exportError}
      </Text>
    </View>
  );
}
