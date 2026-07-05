import type { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-action-state-service";
import { LibrarySongDetailActionButton } from "./LibrarySongDetailActionButton";

type LibraryTheme = ReturnType<typeof useCustomizationTheme>;

type LibrarySongDetailMutationActionsProps = {
  actionState: LibrarySongDetailActionState;
  onDelete: () => void;
  onExport: () => void;
  theme: LibraryTheme;
};

export function LibrarySongDetailMutationActions({
  actionState,
  onDelete,
  onExport,
  theme,
}: LibrarySongDetailMutationActionsProps) {
  return (
    <>
      <LibrarySongDetailActionButton
        disabled={!actionState.canExport}
        flexGrow={1}
        label={actionState.exportLabel}
        onPress={onExport}
        theme={theme}
        variant="secondary"
      />
      <LibrarySongDetailActionButton
        disabled={!actionState.canDelete}
        flexGrow={1}
        label={actionState.deleteLabel}
        minWidth={112}
        onPress={onDelete}
        theme={theme}
        variant="danger"
      />
    </>
  );
}
