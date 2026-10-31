import { Stack } from "expo-router";
import { FieldGroup, ListItem, Text } from "@expo/ui";
import { ProgressView } from "@expo/ui/swift-ui";

import { SymbolIcon } from "~/components/symbol-icon";
import { useBackupActions } from "~/features/backup/use-backup-actions";
import { Form, Row, SECONDARY_LABEL } from "~/features/settings/form";

const DESTRUCTIVE = "#FF453A";

/** Backup & Restore (Premium): back up, restore (3.0 or 2.5.2 backups), erase. */
export default function BackupScreen() {
  const { backUp, erase, restore, task } = useBackupActions();
  return (
    <>
      <Stack.Screen
        options={{ headerLargeTitleEnabled: false, title: "Backup & Restore" }}
      />
      <Form>
        <FieldGroup.Section>
          {task === null ? (
            <>
              <Row
                icon="arrow.up.doc"
                label="Back Up Library"
                trailing="none"
                onPress={backUp}
              />
              <Row
                icon="arrow.down.doc"
                label="Restore from Backup"
                trailing="none"
                onPress={restore}
              />
            </>
          ) : (
            <ListItem
              supportingText={
                task.progress === null
                  ? undefined
                  : `${String(Math.round(task.progress * 100))}%`
              }
            >
              <Text>{`${task.label}…`}</Text>
              <ProgressView value={task.progress} />
            </ListItem>
          )}
        </FieldGroup.Section>
        <FieldGroup.Section>
          <ListItem
            leading={<SymbolIcon name="trash" size={19} tintColor={DESTRUCTIVE} />}
            onPress={task === null ? erase : undefined}
          >
            <Text textStyle={{ color: task === null ? DESTRUCTIVE : SECONDARY_LABEL }}>
              Erase Library
            </Text>
          </ListItem>
        </FieldGroup.Section>
      </Form>
    </>
  );
}
