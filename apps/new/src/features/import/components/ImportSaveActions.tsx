import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSaveActionState } from "../services/import-save-screen-state-service";

type ImportSaveActionsProps = {
  actionState: ImportSaveActionState;
  discardImport: () => void;
  exportSongs: () => void;
  finishImport: () => void;
};

export function ImportSaveActions({
  actionState,
  discardImport,
  exportSongs,
  finishImport,
}: ImportSaveActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <View className="flex-row flex-wrap gap-3">
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canExport}
        onPress={exportSongs}
        className={`min-h-[46px] min-w-[110px] flex-grow items-center justify-center rounded-lg border px-3.5 ${
          actionState.canExport ? "" : "opacity-[0.45]"
        }`}
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.accent }}
        >
          {actionState.exportLabel}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canFinish}
        onPress={finishImport}
        className={`min-h-[46px] min-w-[110px] flex-grow items-center justify-center rounded-lg px-3.5 ${
          actionState.canFinish ? "" : "opacity-[0.45]"
        }`}
        style={{ backgroundColor: theme.accent }}
      >
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.onAccent }}
        >
          {actionState.finishLabel}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canDiscard}
        onPress={discardImport}
        className={`min-h-[46px] min-w-[110px] flex-grow items-center justify-center rounded-lg border px-3.5 ${
          actionState.canDiscard ? "" : "opacity-[0.45]"
        }`}
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.danger }}
        >
          {actionState.discardLabel}
        </Text>
      </Pressable>
    </View>
  );
}
