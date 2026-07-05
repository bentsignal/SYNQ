import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongEditActionState } from "../services/library-song-edit-action-state-service";
import {
  LibraryActionButton,
  LibraryActionLink,
  LibraryActionRow,
} from "./library-action";

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
      <LibraryActionLink
        href={actionState.cancelHref}
        label="Cancel"
        minWidth={112}
        theme={theme}
      />
    </LibraryActionRow>
  );
}
