import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
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
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {showSpinner ? <ActivityIndicator color={theme.accent} /> : null}
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {title}
        </Text>
        <Text style={[styles.detail, { color: theme.secondaryText }]}>
          {detail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  panel: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxWidth: 360,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 23,
    textAlign: "center",
  },
  detail: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
