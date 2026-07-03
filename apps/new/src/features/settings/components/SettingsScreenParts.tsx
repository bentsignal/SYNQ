import { Link, type Href } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
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
  contentClassName?: string;
  theme: CustomizationTheme;
};

export function SettingsScreenContent({
  children,
  contentClassName,
  theme,
}: SettingsScreenContentProps) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName={`gap-[18px] px-5 py-14 ${
        contentClassName ?? ""
      }`}
      style={{ backgroundColor: theme.background }}
    >
      {children}
    </ScrollView>
  );
}

export function SettingsScreenHeader({
  header,
  subtitleClassName,
  theme,
}: {
  header: SettingsScreenHeaderState;
  subtitleClassName?: string;
  theme: CustomizationTheme;
}) {
  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {header.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: theme.primaryText }}
      >
        {header.title}
      </Text>
      <Text
        className={`max-w-[560px] text-[15px] leading-[22px] ${
          subtitleClassName ?? ""
        }`}
        style={{ color: theme.secondaryText }}
      >
        {header.subtitle}
      </Text>
      {header.statusLabel ? (
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
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
      className="gap-2 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-base font-extrabold leading-[22px]"
        style={{ color: theme.primaryText }}
      >
        {panel.title}
      </Text>
      <Text
        className="text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
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
    <Link
      className="text-[15px] font-extrabold"
      href={backLink.href}
      style={{ color: theme.accent }}
    >
      {backLink.label}
    </Link>
  );
}
