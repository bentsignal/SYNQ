import { Link, type Href } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportResultScreenViewProps = {
  backHref: Href;
  backLabel: string;
  kicker: string;
  panelHint?: string;
  panelLabel: string;
  panelText: string;
  subtitle: string;
  title: string;
  tone: "accent" | "danger";
};

export function ImportResultScreenView({
  backHref,
  backLabel,
  kicker,
  panelHint,
  panelLabel,
  panelText,
  subtitle,
  title,
  tone,
}: ImportResultScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme[tone] }]}>{kicker}</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
          {panelLabel}
        </Text>
        <Text style={[styles.panelText, { color: theme.primaryText }]}>
          {panelText}
        </Text>
        {panelHint ? (
          <Text style={[styles.pathText, { color: theme.mutedText }]}>
            {panelHint}
          </Text>
        ) : null}
      </View>

      <Link href={backHref} style={[styles.backLink, { color: theme.accent }]}>
        {backLabel}
      </Link>
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
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
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
  pathText: {
    fontSize: 12,
    lineHeight: 17,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
