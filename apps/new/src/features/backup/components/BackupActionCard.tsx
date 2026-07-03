import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { BackupActionCard as BackupActionCardConfig } from "../services/backup-screen-service";
import type { BackupOperation } from "../types/backup-session";

type BackupActionState = {
  buttonLabel: string;
  isDanger: boolean;
  isDisabled: boolean;
  showPremiumBadge: boolean;
};

type BackupActionCardProps = {
  action: BackupActionCardConfig;
  actionState: BackupActionState;
  onRunOperation: (operation: BackupOperation) => void;
};

export function BackupActionCard({
  action,
  actionState,
  onRunOperation,
}: BackupActionCardProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="gap-3.5 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <View className="gap-2">
        <View className="flex-row flex-wrap items-center gap-2.5">
          <Text
            className="shrink text-lg font-extrabold leading-6"
            style={{ color: theme.primaryText }}
          >
            {action.title}
          </Text>
          {actionState.showPremiumBadge ? (
            <Text
              className="overflow-hidden rounded-lg border bg-[#e8f3ef] px-2 py-1 text-[11px] font-extrabold uppercase"
              style={{ borderColor: theme.border, color: theme.accent }}
            >
              Premium
            </Text>
          ) : null}
        </View>
        <Text className="text-sm leading-5" style={{ color: theme.secondaryText }}>
          {action.body}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={actionState.isDisabled}
        onPress={() => onRunOperation(action.operation)}
        className={`min-h-11 items-center justify-center rounded-lg px-3.5 ${
          actionState.isDisabled ? "opacity-50" : ""
        }`}
        style={{
          backgroundColor: actionState.isDanger ? theme.danger : theme.accent,
        }}
      >
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.onAccent }}
        >
          {actionState.buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}
