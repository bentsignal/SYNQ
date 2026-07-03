import { Pressable, Text } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongEditActionState } from "../services/import-song-edit-form-state-service";

type EditImportSongActionsProps = {
  actionState: ImportSongEditActionState;
  error: string | null;
  onSave: () => void;
};

export function EditImportSongActions({
  actionState,
  error,
  onSave,
}: EditImportSongActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      {error ? (
        <Text
          className="text-[13px] font-extrabold leading-[18px]"
          style={{ color: theme.danger }}
        >
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canSave}
        onPress={onSave}
        className={`min-h-[46px] items-center justify-center rounded-lg px-3.5 ${
          actionState.canSave ? "" : "opacity-[0.45]"
        }`}
        style={{ backgroundColor: theme.accent }}
      >
        <Text
          className="text-[13px] font-extrabold uppercase"
          style={{ color: theme.onAccent }}
        >
          Save song
        </Text>
      </Pressable>
    </>
  );
}
