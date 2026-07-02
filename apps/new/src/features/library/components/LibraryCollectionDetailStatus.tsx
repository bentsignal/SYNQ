import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type LibraryCollectionDetailStatusProps = {
  hasErrors: boolean;
  mutationError: string | null;
  updatedLabel: string;
};

export function LibraryCollectionDetailStatus({
  hasErrors,
  mutationError,
  updatedLabel,
}: LibraryCollectionDetailStatusProps) {
  const theme = useCustomizationTheme();
  const isError = hasErrors || mutationError !== null;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text
        style={[
          isError ? styles.errorText : styles.panelText,
          { color: isError ? theme.danger : theme.secondaryText },
        ]}
      >
        {mutationError ??
          (hasErrors ? "One or more detail queries failed." : updatedLabel)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
