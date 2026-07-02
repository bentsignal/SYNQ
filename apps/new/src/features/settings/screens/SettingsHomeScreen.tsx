import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";

type SettingsRoute = {
  description: string;
  href: "/premium" | "/settings/backup" | "/settings/customization";
  label: string;
};

const settingsRoutes: SettingsRoute[] = [
  {
    description: "Unlock and manage the full SYNQ experience.",
    href: "/premium",
    label: "Premium",
  },
  {
    description: "Theme, app icon, haptics, and interface preferences.",
    href: "/settings/customization",
    label: "Customization",
  },
  {
    description: "Archive, restore, or reset the local music library.",
    href: "/settings/backup",
    label: "Backup & Restore",
  },
];

export function SettingsHomeScreen() {
  const { state: premiumState } = usePremiumEntitlement();

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/settings</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage the pieces around your library experience.
        </Text>
        <Text style={styles.statusText}>
          {premiumState.active ? "Premium active" : "Premium inactive"}
        </Text>
      </View>

      <View style={styles.list}>
        {settingsRoutes.map((route) => (
          <Link asChild href={route.href} key={route.href}>
            <Pressable style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{route.label}</Text>
                <Text style={styles.rowDescription}>{route.description}</Text>
              </View>
              <Text style={styles.chevron}>{">"}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f7f5",
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
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  statusText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  list: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#edf2ef",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  rowTitle: {
    color: "#121417",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  rowDescription: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 19,
  },
  chevron: {
    color: "#0f766e",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
  },
});
