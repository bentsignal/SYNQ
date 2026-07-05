import { Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongEditStatusState } from "../services/library-song-edit-status-state-service";

type EditLibrarySongStatusPanelProps = {
  statusState: LibrarySongEditStatusState;
};

export function EditLibrarySongStatusPanel({
  statusState,
}: EditLibrarySongStatusPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="rounded-lg border p-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className={`text-sm leading-5 ${statusState.isError ? "font-bold" : ""}`}
        style={{
          color: statusState.isError ? theme.danger : theme.secondaryText,
        }}
      >
        {statusState.statusLabel}
      </Text>
    </View>
  );
}
