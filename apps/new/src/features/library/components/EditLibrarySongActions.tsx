import { Link } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibrarySongDetailHref } from "../services/library-song-interaction-service";
import type { LibrarySongEditActionState } from "../services/library-song-edit-screen-state-service";
import {
  LibraryActionButton,
  LibraryActionRow,
  libraryActionPartStyles,
} from "./LibraryActionParts";

type EditLibrarySongActionsProps = {
  actionState: LibrarySongEditActionState;
  onSave: () => void;
  songId: number;
};

export function EditLibrarySongActions({
  actionState,
  onSave,
  songId,
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
        href={getLibrarySongDetailHref({ songId })}
        style={[
          libraryActionPartStyles.linkButton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.accent,
            flexGrow: 1,
            lineHeight: 42,
            minWidth: 112,
          },
        ]}
      >
        Cancel
      </Link>
    </LibraryActionRow>
  );
}
