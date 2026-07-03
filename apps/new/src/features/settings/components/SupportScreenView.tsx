import { Pressable, Text, View } from "react-native";
import type { SupportScreenController } from "../hooks/use-support-screen-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import { getSupportScreenViewState } from "../services/settings-screen-service";
import { getSupportActionKey } from "../services/settings-navigation-service";
import {
  SettingsBackLink,
  SettingsInfoPanel,
  SettingsScreenContent,
  SettingsScreenHeader,
} from "./SettingsScreenParts";

type SupportScreenViewProps = SupportScreenController;

export function SupportScreenView({
  runSupportAction,
  supportActions,
}: SupportScreenViewProps) {
  const theme = useCustomizationTheme();
  const viewState = getSupportScreenViewState();

  return (
    <SettingsScreenContent theme={theme}>
      <SettingsScreenHeader header={viewState.header} theme={theme} />

      <View
        className="overflow-hidden rounded-lg border"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {supportActions.map((action) => (
          <Pressable
            accessibilityRole="link"
            key={getSupportActionKey(action)}
            onPress={() => runSupportAction(action)}
            className="min-h-[78px] flex-row items-center gap-3.5 border-b px-4 py-3.5"
            style={{ borderBottomColor: theme.borderSubtle }}
          >
            <View className="min-w-0 flex-1 gap-[5px]">
              <Text
                className="text-base font-extrabold leading-[21px]"
                style={{ color: theme.primaryText }}
              >
                {action.label}
              </Text>
              <Text
                className="text-[13px] leading-[19px]"
                style={{ color: theme.secondaryText }}
              >
                {action.description}
              </Text>
            </View>
            <Text
              className="text-[28px] font-bold leading-8"
              style={{ color: theme.accent }}
            >
              {">"}
            </Text>
          </Pressable>
        ))}
      </View>

      <SettingsInfoPanel panel={viewState.bugReportPanel} theme={theme} />

      <SettingsBackLink backLink={viewState.backLink} theme={theme} />
    </SettingsScreenContent>
  );
}
