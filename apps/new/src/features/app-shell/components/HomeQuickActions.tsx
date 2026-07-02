import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { HomeScreenController } from "../hooks/use-home-screen-controller";
import {
  getHomeQuickActions,
  type HomeAction as HomeActionState,
} from "../services/home-screen-service";

type HomeQuickActionsProps = {
  summary: HomeScreenController["summary"];
};

export function HomeQuickActions({ summary }: HomeQuickActionsProps) {
  const actions = getHomeQuickActions({ songCount: summary.counts.songs });

  return (
    <View style={styles.quickActions}>
      {actions.map((action) => (
        <HomeAction action={action} key={action.href} />
      ))}
    </View>
  );
}

type HomeActionProps = {
  action: HomeActionState;
};

function HomeAction({ action }: HomeActionProps) {
  const theme = useCustomizationTheme();

  return (
    <Link asChild href={action.href}>
      <Pressable
        style={[
          styles.actionCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.actionTitle, { color: theme.primaryText }]}>
          {action.label}
        </Text>
        <Text style={[styles.actionDetail, { color: theme.secondaryText }]}>
          {action.detail}
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
