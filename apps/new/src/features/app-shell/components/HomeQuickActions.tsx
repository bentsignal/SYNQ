import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenController } from "../hooks/use-home-screen-controller";

type HomeQuickActionsProps = {
  summary: HomeScreenController["summary"];
};

export function HomeQuickActions({ summary }: HomeQuickActionsProps) {
  return (
    <View style={styles.quickActions}>
      <HomeAction
        detail={`${summary.counts.songs} songs`}
        href="/(tabs)/library"
        label="Library"
      />
      <HomeAction
        detail="Files and Wi-Fi"
        href="/(tabs)/import"
        label="Import"
      />
      <HomeAction
        detail="Theme and backup"
        href="/(tabs)/settings"
        label="Settings"
      />
      <HomeAction detail="Unlock listening" href="/premium" label="Premium" />
    </View>
  );
}

type HomeActionProps = {
  detail: string;
  href: string;
  label: string;
};

function HomeAction({ detail, href, label }: HomeActionProps) {
  const theme = useCustomizationTheme();

  return (
    <Link asChild href={href}>
      <Pressable
        style={[
          styles.actionCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.actionTitle, { color: theme.primaryText }]}>
          {label}
        </Text>
        <Text style={[styles.actionDetail, { color: theme.secondaryText }]}>
          {detail}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 6,
    minHeight: 94,
    minWidth: 148,
    padding: 16,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0,
  },
  actionDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
});
