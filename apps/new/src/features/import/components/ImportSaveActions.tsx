import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSaveActionState } from "../services/import-save-action-state-service";
import { ImportSaveActionButton } from "./ImportSaveActionButton";

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
      <ImportSaveActionButton
        disabled={!actionState.canExport}
        label={actionState.exportLabel}
        onPress={exportSongs}
        theme={theme}
        tone="secondary"
      />
      <ImportSaveActionButton
        disabled={!actionState.canFinish}
        label={actionState.finishLabel}
        onPress={finishImport}
        theme={theme}
        tone="accent"
      />
      <ImportSaveActionButton
        disabled={!actionState.canDiscard}
        label={actionState.discardLabel}
        onPress={discardImport}
        theme={theme}
        tone="danger"
      />
    </View>
  );
}
