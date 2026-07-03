import { Link, type Href } from "expo-router";
import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";

export type SettingsScreenHeaderState = {
  kicker: string;
  statusLabel?: string;
  subtitle: string;
  title: string;
};

export type SettingsInfoPanelState = {
  body: string;
  title: string;
};

export type SettingsBackLinkState = {
  href: Href;
  label: string;
};

type SettingsScreenContentProps = {
  children: ReactNode;
  contentStyle?: ViewStyle;
  theme: CustomizationTheme;
};

export function SettingsScreenContent({
  children,
  contentStyle,
  theme,
}: SettingsScreenContentProps) {
  return (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      {children}
    </ScrollView>
  );
}

export function SettingsScreenHeader({
  header,
  subtitleStyle,
  theme,
}: {
  header: SettingsScreenHeaderState;
  subtitleStyle?: TextStyle;
  theme: CustomizationTheme;
}) {
  return (
    <View style={styles.header}>
      <Text style={[styles.kicker, { color: theme.accent }]}>
        {header.kicker}
      </Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {header.title}
      </Text>
      <Text
        style={[styles.subtitle, { color: theme.secondaryText }, subtitleStyle]}
      >
        {header.subtitle}
      </Text>
      {header.statusLabel ? (
        <Text style={[styles.statusText, { color: theme.accent }]}>
          {header.statusLabel}
        </Text>
      ) : null}
    </View>
  );
}

export function SettingsInfoPanel({
  panel,
  theme,
}: {
  panel: SettingsInfoPanelState;
  theme: CustomizationTheme;
}) {
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.panelTitle, { color: theme.primaryText }]}>
        {panel.title}
      </Text>
      <Text style={[styles.panelBody, { color: theme.secondaryText }]}>
        {panel.body}
      </Text>
    </View>
  );
}

export function SettingsBackLink({
  backLink,
  theme,
}: {
  backLink: SettingsBackLinkState;
  theme: CustomizationTheme;
}) {
  return (
    <Link href={backLink.href} style={[styles.backLink, { color: theme.accent }]}>
      {backLink.label}
    </Link>
  );
}

export const settingsScreenPartStyles = StyleSheet.create({
  errorText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 18,
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
    maxWidth: 560,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
  panelBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
