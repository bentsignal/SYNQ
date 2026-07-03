import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useImportPremiumGateController } from "../hooks/use-import-premium-gate-controller";

type ImportPremiumGateProps = {
  children: React.ReactNode;
};

export function ImportPremiumGate({ children }: ImportPremiumGateProps) {
  const theme = useCustomizationTheme();
  const { gateState, onSelectPremiumAction } = useImportPremiumGateController();

  if (gateState.canAccessImport) {
    return children;
  }

  return (
    <View
      className="gap-2.5 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.accent }}
      >
        {gateState.kicker}
      </Text>
      <Text
        className="text-xl font-extrabold leading-[26px]"
        style={{ color: theme.primaryText }}
      >
        {gateState.title}
      </Text>
      <Text
        className="text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
        {gateState.body}
      </Text>
      {gateState.error ? (
        <Text
          className="text-[13px] font-bold leading-[18px]"
          style={{ color: theme.danger }}
        >
          {gateState.error}
        </Text>
      ) : null}
      <Link asChild href={gateState.action.href}>
        <Pressable
          onPress={onSelectPremiumAction}
          className="min-h-[42px] items-center justify-center self-start rounded-lg px-3.5"
          style={{ backgroundColor: theme.accent }}
        >
          <Text
            className="text-[13px] font-extrabold uppercase"
            style={{ color: theme.onAccent }}
          >
            {gateState.action.label}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
