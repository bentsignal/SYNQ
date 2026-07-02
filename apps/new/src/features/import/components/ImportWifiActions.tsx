import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getImportHomeHref,
  getImportSaveHref,
} from "../services/import-screen-state-service";

type ImportWifiActionsProps = {
  canReviewSave: boolean;
  reviewSave: () => void;
};

export function ImportWifiActions({
  canReviewSave,
  reviewSave,
}: ImportWifiActionsProps) {
  const theme = useCustomizationTheme();
  const homeHref = getImportHomeHref();
  const saveHref = getImportSaveHref();

  return (
    <View style={styles.actionRow}>
      <Link asChild href={saveHref}>
        <Pressable
          accessibilityRole="button"
          disabled={!canReviewSave}
          onPress={reviewSave}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent },
            !canReviewSave ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
            Review save
          </Text>
        </Pressable>
      </Link>
      <Link
        href={homeHref}
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to import
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 130,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
