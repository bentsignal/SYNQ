import { Pressable, Text } from "react-native";
import type { getImportFilesActionState } from "../services/import-files-action-state-service";

type ImportFilesActionState = ReturnType<typeof getImportFilesActionState>;

type ImportFilesChooseButtonProps = {
  accentColor: string;
  actionState: ImportFilesActionState;
  onAccentColor: string;
  onChooseFiles: () => void;
};

export function ImportFilesChooseButton({
  accentColor,
  actionState,
  onAccentColor,
  onChooseFiles,
}: ImportFilesChooseButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-[46px] items-center justify-center rounded-lg px-4 ${
        actionState.canChooseFiles ? "" : "opacity-50"
      }`}
      disabled={!actionState.canChooseFiles}
      onPress={onChooseFiles}
      style={{ backgroundColor: accentColor }}
    >
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: onAccentColor }}
      >
        {actionState.chooseLabel}
      </Text>
    </Pressable>
  );
}
