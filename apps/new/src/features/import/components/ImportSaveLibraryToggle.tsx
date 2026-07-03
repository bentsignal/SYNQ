import { Pressable, StyleSheet, Text, View } from "react-native";
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
      style={[
        styles.toggleRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.toggleBox,
          { borderColor: theme.inactive },
          shouldSaveToLibrary
            ? {
                backgroundColor: theme.accent,
                borderColor: theme.accent,
              }
            : null,
        ]}
      />
      <Text style={[styles.toggleText, { color: theme.primaryText }]}>
        {toggleState.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggleBox: {
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    width: 22,
  },
  toggleRow: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
