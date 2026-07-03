import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackHref } from "../services/playback-screen-state-service";

type PlaybackQueueAdBreakPanelState = {
  action: {
    href: PlaybackHref;
    label: string;
  };
  body: string;
  kicker: string;
  title: string;
};

type PlaybackQueueAdBreakPanelProps = {
  panelState: PlaybackQueueAdBreakPanelState;
};

export function PlaybackQueueAdBreakPanel({
  panelState,
}: PlaybackQueueAdBreakPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.adPanel}>
      <Text style={styles.panelLabel}>{panelState.kicker}</Text>
      <Text style={styles.adTitle}>{panelState.title}</Text>
      <Text style={[styles.panelText, { color: theme.secondaryText }]}>
        {panelState.body}
      </Text>
      <View style={styles.adActions}>
        <Link asChild href={panelState.action.href}>
          <Pressable
            accessibilityRole="button"
            style={[styles.premiumButton, { backgroundColor: theme.surface }]}
          >
            <Text style={styles.premiumText}>{panelState.action.label}</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  adPanel: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  adTitle: {
    color: "#9a3412",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  premiumButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#fed7aa",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12,
  },
  premiumText: {
    color: "#9a3412",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
