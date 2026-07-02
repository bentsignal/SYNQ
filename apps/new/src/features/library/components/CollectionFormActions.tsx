import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
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
        <Text key={message} style={[styles.errorText, { color: theme.danger }]}>
          {message}
        </Text>
      ))}

      <Pressable
        accessibilityRole="button"
        disabled={!actionState.canSave}
        onPress={onSave}
        style={[
          styles.saveButton,
          {
            backgroundColor: actionState.canSave
              ? theme.accent
              : theme.inactive,
          },
        ]}
      >
        {isSaving ? <ActivityIndicator color={theme.onAccent} /> : null}
        <Text style={[styles.saveText, { color: theme.onAccent }]}>
          {saveLabel}
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
