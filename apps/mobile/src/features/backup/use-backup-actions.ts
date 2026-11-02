import { useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import type { MergeSummary } from "@synq/db/merge";

import { errorFeedback, successFeedback } from "~/lib/haptics";
import { backUpLibrary, eraseLibrary, inspectBackup } from "./backup";
import { RestoreError, restoreLibrary } from "./restore";
import { restoreSummary } from "./restore-summary";

const SUPPORT_URL = "https://directedbyshawn.com/synq-support";

interface Task {
  label: string;
  /** 0 to 1, or null while there's no measure. */
  progress: number | null;
}

function failed(
  title: string,
  message = "Try again. If it keeps happening, contact support.",
) {
  errorFeedback();
  Alert.alert(title, message, [
    { style: "cancel", text: "OK" },
    {
      onPress: () => void Linking.openURL(SUPPORT_URL),
      text: "Contact Support",
    },
  ]);
}

/** Tells someone why a restore failed, which changed nothing. */
function restoreFailed(error: unknown) {
  if (!(error instanceof RestoreError)) {
    failed(
      "Couldn't Restore Backup",
      "Your library wasn't changed. Try again. If it keeps happening, contact support.",
    );
    return;
  }
  errorFeedback();
  switch (error.code) {
    case "newer":
      Alert.alert(
        "Update SYNQ to Restore",
        "This backup was made by a newer version of SYNQ.",
      );
      return;
    case "not-a-backup":
      Alert.alert("Not a SYNQ Backup", "Choose a backup made by SYNQ.");
  }
}

/** Opens the Files picker for a zip; null when cancelled or not a SYNQ backup. */
async function pickBackup() {
  const picked = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: ["application/zip", "public.zip-archive"],
  });
  const file = picked.assets?.[0];
  if (picked.canceled || file === undefined) return null;
  const { kind } = await inspectBackup(file.uri);
  if (kind !== null) return file.uri;
  errorFeedback();
  Alert.alert("Not a SYNQ Backup", "Choose a backup made by SYNQ.");
  return null;
}

/**
 * Back Up Library, Restore from Backup, and Erase Library, one at a time,
 * with the running one's progress.
 */
export function useBackupActions() {
  const [task, setTask] = useState<Task | null>(null);
  // One operation at a time; a second tap while one runs does nothing.
  const running = useRef(false);

  function run(
    label: string,
    work: (progress: (value: number) => void) => Promise<void>,
  ) {
    if (running.current) return Promise.resolve(false);
    running.current = true;
    setTask({ label, progress: null });
    // Only when the percentage changes: a restore reports every file.
    let shown = -1;
    function report(value: number) {
      const percent = Math.round(value * 100);
      if (percent === shown) return;
      shown = percent;
      setTask({ label, progress: value });
    }
    return work(report).then(
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

  function backUp() {
    run("Backing Up", backUpLibrary).catch(() =>
      failed("Couldn't Back Up Library"),
    );
  }

  function restoreFrom(uri: string) {
    let summary: MergeSummary | undefined;
    run("Restoring", async (progress) => {
      summary = await restoreLibrary(uri, progress);
    }).then(
      () => {
        if (summary === undefined) return;
        successFeedback();
        const { message, title } = restoreSummary(summary);
        Alert.alert(title, message);
      },
      (error: unknown) => restoreFailed(error),
    );
  }

  async function chooseBackup() {
    const uri = await pickBackup();
    if (uri === null) return;
    Alert.alert(
      "Restore This Backup?",
      "Songs, albums, artists, and playlists in the backup are added to your library. Nothing you have now is changed or removed.",
      [
        { style: "cancel", text: "Cancel" },
        { onPress: () => restoreFrom(uri), text: "Restore" },
      ],
    );
  }

  function restore() {
    chooseBackup().catch(() => failed("Couldn't Open Backup"));
  }

  function erase() {
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

  return { backUp, erase, restore, task };
}
