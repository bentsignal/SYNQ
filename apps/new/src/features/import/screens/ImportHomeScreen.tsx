import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useImportSession } from "../hooks/use-import-session";

export function ImportHomeScreen() {
  const { state } = useImportSession();
  const theme = useCustomizationTheme();
  const { sendHaptic } = useHapticFeedback();
  const { state: premiumState } = usePremiumEntitlement();
  const importLocked = !premiumState.active;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Add Music
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>Import</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Bring songs into SYNQ with a review step before saving.
        </Text>
      </View>

      <View
        style={[
          styles.list,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Link asChild href={importLocked ? "/premium" : "/(tabs)/import/files"}>
          <Pressable
            onPress={() => sendHaptic("light")}
            style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
                Files
              </Text>
              <Text
                style={[styles.rowDescription, { color: theme.secondaryText }]}
              >
                Select local audio and review staged songs.
              </Text>
            </View>
            <Text style={[styles.rowMeta, { color: theme.accent }]}>
              {importLocked ? "Premium" : `${state.songs.length} staged`}
            </Text>
          </Pressable>
        </Link>
        <Link asChild href={importLocked ? "/premium" : "/(tabs)/import/wifi"}>
          <Pressable
            onPress={() => sendHaptic("light")}
            style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
                Wi-Fi
              </Text>
              <Text
                style={[styles.rowDescription, { color: theme.secondaryText }]}
              >
                Receive audio from a browser on the same network.
              </Text>
            </View>
            <Text style={[styles.rowMeta, { color: theme.accent }]}>
              {importLocked
                ? "Premium"
                : state.source === "wifi"
                  ? state.progress.current
                  : "Local"}
            </Text>
          </Pressable>
        </Link>
        <Link asChild href={importLocked ? "/premium" : "/(tabs)/import/save"}>
          <Pressable
            onPress={() => sendHaptic("light")}
            style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
                Save
              </Text>
              <Text
                style={[styles.rowDescription, { color: theme.secondaryText }]}
              >
                Finish or discard the current import session.
              </Text>
            </View>
            <Text style={[styles.rowMeta, { color: theme.accent }]}>
              {importLocked ? "Premium" : state.phase}
            </Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  rowMeta: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "right",
    textTransform: "uppercase",
  },
});
