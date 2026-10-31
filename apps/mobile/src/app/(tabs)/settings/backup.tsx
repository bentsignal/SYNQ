import { useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Stack, useRouter } from "expo-router";
import { FieldGroup, ListItem, Text } from "@expo/ui";
import { ProgressView } from "@expo/ui/swift-ui";

import { SymbolIcon } from "~/components/symbol-icon";
import { track } from "~/features/analytics/analytics";
import {
  backUpLibrary,
  eraseLibrary,
  finishRestore,
  inspectBackup,
  RestoreError,
  restoreLibrary,
} from "~/features/backup/backup";
import { usePremium } from "~/features/premium/premium";
import { Form, Row, SECONDARY_LABEL } from "~/features/settings/form";
import { errorFeedback, successFeedback } from "~/lib/haptics";

const SUPPORT_URL = "https://directedbyshawn.com/synq-support";
const DESTRUCTIVE = "#FF453A";

interface Task {
  label: string;
  /** 0 to 1, or null while there's no measure. */
  progress: number | null;
}

function failed(title: string, retry?: () => void) {
  errorFeedback();
  Alert.alert(title, "Try again. If it keeps happening, contact support.", [
    { style: "cancel", text: "OK" },
    ...(retry === undefined ? [] : [{ onPress: retry, text: "Try Again" }]),
    {
      onPress: () => void Linking.openURL(SUPPORT_URL),
      text: "Contact Support",
    },
  ]);
}

/** Back Up Library, Restore from Backup, and Erase Library (Premium, as in 2.5.2). */
export default function BackupScreen() {
  const router = useRouter();
  const premium = usePremium();
  const [task, setTask] = useState<Task | null>(null);
  // One operation at a time; a second tap while one runs does nothing.
  const running = useRef(false);

  function run(label: string, work: (progress: (value: number) => void) => Promise<void>) {
    if (running.current) return Promise.resolve(false);
    running.current = true;
    setTask({ label, progress: null });
    const progress = (value: number) => setTask({ label, progress: value });
    return work(progress).then(
      () => {
        running.current = false;
        setTask(null);
        return true;
      },
      (error: unknown) => {
        running.current = false;
        setTask(null);
        throw error;
      },
    );
  }

  function requirePremium() {
    if (premium) return true;
    track("check_premium", { premium: false });
    router.push("/premium");
    return false;
  }

  function backUp() {
    if (!requirePremium()) return;
    run("Backing Up", backUpLibrary).catch(() => failed("Couldn't Back Up Library"));
  }

  function retryFiles() {
    run("Restoring", () => finishRestore()).then(
      () => successFeedback(),
      () => failed("Couldn't Finish Restoring", retryFiles),
    );
  }

  function restoreFrom(uri: string) {
    run("Restoring", (progress) => restoreLibrary(uri, progress)).then(
      (done) => {
        if (!done) return;
        successFeedback();
        Alert.alert("Library Restored");
      },
      (error: unknown) => {
        if (error instanceof RestoreError && error.code === "files") {
          failed("Couldn't Finish Restoring", retryFiles);
        } else if (error instanceof RestoreError && error.code === "newer") {
          errorFeedback();
          Alert.alert(
            "Update SYNQ to Restore",
            "This backup was made by a newer version of SYNQ.",
          );
        } else if (error instanceof RestoreError) {
          errorFeedback();
          Alert.alert("Not a SYNQ Backup", "Choose a backup made by SYNQ.");
        } else {
          failed("Couldn't Restore Library");
        }
      },
    );
  }

  async function chooseBackup() {
    const picked = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ["application/zip", "public.zip-archive"],
    });
    const file = picked.assets?.[0];
    if (picked.canceled || file === undefined) return;
    const { kind } = await inspectBackup(file.uri);
    if (kind === null) {
      errorFeedback();
      Alert.alert("Not a SYNQ Backup", "Choose a backup made by SYNQ.");
      return;
    }
    Alert.alert(
      "Replace Your Library?",
      "Everything in your library is replaced by the backup. This can't be undone.",
      [
        { style: "cancel", text: "Cancel" },
        { onPress: () => restoreFrom(file.uri), style: "destructive", text: "Restore" },
      ],
    );
  }

  function restore() {
    if (!requirePremium()) return;
    chooseBackup().catch(() => failed("Couldn't Open Backup"));
  }

  function erase() {
    if (!requirePremium()) return;
    Alert.alert(
      "Erase Your Library?",
      "Every song, album, artist, and playlist is deleted from this iPhone. This can't be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => {
            run("Erasing", eraseLibrary).then(
              (done) => {
                if (done) successFeedback();
              },
              () => failed("Couldn't Erase Library"),
            );
          },
          style: "destructive",
          text: "Erase",
        },
      ],
    );
  }

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
