import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { SettingsHomeController } from "../hooks/use-settings-home-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import {
  SettingsScreenContent,
  SettingsScreenHeader,
} from "./SettingsScreenParts";

type SettingsHomeViewProps = SettingsHomeController;

export function SettingsHomeView({
  routes,
  screenState,
}: SettingsHomeViewProps) {
  const theme = useCustomizationTheme();

  return (
    <SettingsScreenContent contentClassName="gap-5" theme={theme}>
      <SettingsScreenHeader
        header={{
          kicker: "Preferences",
          statusLabel: screenState.premiumStatusLabel,
          subtitle: "Manage the pieces around your library experience.",
          title: "Settings",
        }}
        subtitleClassName="max-w-[520px]"
        theme={theme}
      />

      <View
        className="overflow-hidden rounded-lg border"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {routes.map((route) => (
          <Link asChild href={route.href} key={route.href}>
            <Pressable
              className="min-h-[78px] flex-row items-center gap-3.5 border-b px-4 py-3.5"
              style={{ borderBottomColor: theme.borderSubtle }}
            >
              <View className="min-w-0 flex-1 gap-[5px]">
                <Text
                  className="text-base font-extrabold leading-[21px]"
                  style={{ color: theme.primaryText }}
                >
                  {route.label}
                </Text>
                <Text
                  className="text-[13px] leading-[19px]"
                  style={{ color: theme.secondaryText }}
                >
                  {route.description}
                </Text>
              </View>
              <Text
                className="text-[28px] font-bold leading-8"
                style={{ color: theme.accent }}
              >
                {">"}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </SettingsScreenContent>
  );
}
