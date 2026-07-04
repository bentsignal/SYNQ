import { Link } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongEditActionState } from "../services/library-song-edit-screen-state-service";
import {
  LibraryActionButton,
  LibraryActionRow,
} from "./LibraryActionParts";

type EditLibrarySongActionsProps = {
  actionState: LibrarySongEditActionState;
  onSave: () => void;
};

export function EditLibrarySongActions({
  actionState,
  onSave,
}: EditLibrarySongActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <LibraryActionRow>
      <LibraryActionButton
        disabled={!actionState.canSave}
        flexGrow={1}
        label={actionState.saveLabel}
        minWidth={112}
        onPress={onSave}
        theme={theme}
        variant="primary"
      />
      <Link
        className="min-h-11 flex-grow overflow-hidden rounded-lg border px-3.5 text-center text-[13px] font-extrabold uppercase leading-[42px]"
        href={actionState.cancelHref}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.accent,
          minWidth: 112,
        }}
      >
        Cancel
      </Link>
    </LibraryActionRow>
  );
}
