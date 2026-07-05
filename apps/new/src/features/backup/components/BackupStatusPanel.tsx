import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { BackupStatusState } from "../services/backup-status-state-service";

type BackupStatusPanelProps = {
  resetStatus: () => void;
  statusState: BackupStatusState;
};

export function BackupStatusPanel({
  resetStatus,
  statusState,
}: BackupStatusPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="gap-2.5 rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: theme.secondaryText }}
      >
        Status
      </Text>
      <Text
        className={`text-sm leading-5 ${statusState.isFailure ? "font-bold" : ""}`}
        style={{
          color: statusState.isFailure ? theme.danger : theme.primaryText,
        }}
      >
        {statusState.message}
      </Text>
      {statusState.canReset ? (
        <Pressable
          accessibilityRole="button"
          onPress={resetStatus}
          className="min-h-[38px] items-center justify-center rounded-lg border px-3"
          style={{ borderColor: theme.border }}
        >
          <Text
            className="text-xs font-extrabold uppercase"
            style={{ color: theme.accent }}
          >
            Reset status
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
