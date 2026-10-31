import { Stack } from "expo-router";

/**
 * An edit sheet's bar: its title, Cancel (`xmark`) on the left, and Done
 * (`checkmark`, prominent) on the right, as in Vera's sheets.
 */
export function SheetToolbar({
  title,
  onCancel,
  onDone,
  doneLabel = "Done",
  canSave = true,
}: {
  title: string;
  onCancel: () => void;
  onDone: () => void;
  doneLabel?: string;
  canSave?: boolean;
}) {
  return (
    <>
      <Stack.Screen options={{ title }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Cancel"
          onPress={onCancel}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="checkmark"
          accessibilityLabel={doneLabel}
          variant="prominent"
          disabled={!canSave}
          onPress={onDone}
        />
      </Stack.Toolbar>
    </>
  );
}
