import {
  ActivityIndicator,
  Pressable,
  Text,
} from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { CollectionFormActionState } from "../services/collection-form-interaction-service";

type CollectionFormActionsProps = {
  actionState: CollectionFormActionState;
  errorMessages: (string | false | null | undefined)[];
  isSaving: boolean;
  onSave: () => void;
  saveLabel: string;
};

export function CollectionFormActions({
  actionState,
  errorMessages,
  isSaving,
  onSave,
  saveLabel,
}: CollectionFormActionsProps) {
  const theme = useCustomizationTheme();
  const visibleErrors = errorMessages.filter(
    (message): message is string => typeof message === "string",
  );

  return (
    <>
      {visibleErrors.map((message) => (
        <Text
          className="text-sm font-bold leading-5"
          key={message}
          style={{ color: theme.danger }}
        >
          {message}
        </Text>
      ))}

      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canSave}
        onPress={onSave}
        className="min-h-12 flex-row items-center justify-center gap-2.5 rounded-lg px-4"
        style={{
          backgroundColor: actionState.canSave ? theme.accent : theme.inactive,
        }}
      >
        {isSaving ? <ActivityIndicator color={theme.onAccent} /> : null}
        <Text
          className="text-sm font-extrabold uppercase"
          style={{ color: theme.onAccent }}
        >
          {saveLabel}
        </Text>
      </Pressable>
    </>
  );
}
