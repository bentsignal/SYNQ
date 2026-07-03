import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSaveLibraryToggleState } from "../services/import-save-screen-state-service";

type ImportSaveLibraryToggleProps = {
  shouldSaveToLibrary: boolean;
  toggleShouldSaveToLibrary: () => void;
};

export function ImportSaveLibraryToggle({
  shouldSaveToLibrary,
  toggleShouldSaveToLibrary,
}: ImportSaveLibraryToggleProps) {
  const theme = useCustomizationTheme();
  const toggleState = getImportSaveLibraryToggleState();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: shouldSaveToLibrary }}
      onPress={toggleShouldSaveToLibrary}
      className="min-h-[52px] flex-row items-center gap-3 rounded-lg border px-3.5"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <View
        className="h-[22px] w-[22px] rounded-md border-2"
        style={[
          { borderColor: theme.inactive },
          shouldSaveToLibrary
            ? {
                backgroundColor: theme.accent,
                borderColor: theme.accent,
              }
            : null,
        ]}
      />
      <Text
        className="text-[15px] font-extrabold"
        style={{ color: theme.primaryText }}
      >
        {toggleState.label}
      </Text>
    </Pressable>
  );
}
