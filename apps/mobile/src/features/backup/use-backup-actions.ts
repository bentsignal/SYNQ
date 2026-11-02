import { useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import type { MergeSummary } from "@synq/db/merge";

import { synqMedia, synqMediaAvailable } from "~/features/media/native";
import { errorFeedback, successFeedback } from "~/lib/haptics";
import { backUpLibrary, eraseLibrary, inspectBackup } from "./backup";
import { RestoreError, restoreLibrary } from "./restore";
import { restoreSummary } from "./restore-summary";

const SUPPORT_URL = "https://directedbyshawn.com/synq-support";

/** A task that finishes sooner shows nothing, so it can't flicker. */
const SHOW_AFTER_MS = 500;

/** What someone types to erase their library. */
const ERASE_PHRASE = "I want to erase my library";

interface Task {
  label: string;
  /** 0 to 1, or null while there's no measure. */
  progress: number | null;
}

function noMeasure(): number | null {
  return null;
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
 * Asks before erasing. The alert's button stays off until the phrase is typed,
 * so no one erases by accident.
 */
function confirmErase(erase: () => void) {
  const title = "Erase Your Library?";
  const warning =
    "Every song, album, artist, and playlist is deleted from this iPhone. This can't be undone.";
  const typed = synqMediaAvailable() ? synqMedia().confirmTyped : undefined;
  if (typed === undefined) {
    Alert.alert(title, warning, [
      { style: "cancel", text: "Cancel" },
      { onPress: erase, style: "destructive", text: "Erase" },
    ]);
    return;
  }
  void typed(
    title,
    `${warning} To confirm, type “${ERASE_PHRASE}”.`,
    ERASE_PHRASE,
    "Erase",
  ).then((confirmed) => {
    if (confirmed) erase();
  });
}

/**
 * Back Up Library, Restore from Backup, and Erase Library, one at a time,
 * with the running one's progress once it's been going a moment.
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
    let progress = noMeasure();
    let visible = false;
    const showTimer = setTimeout(() => {
      visible = true;
      setTask({ label, progress });
    }, SHOW_AFTER_MS);
    // Only when the percentage changes: a restore reports every file.
    let shown = -1;
    function report(value: number) {
      progress = value;
      const percent = Math.round(value * 100);
      if (percent === shown) return;
      shown = percent;
      if (visible) setTask({ label, progress: value });
    }
    function finish() {
      clearTimeout(showTimer);
      running.current = false;
      setTask(null);
    }
    return work(report).then(
      () => {
        finish();
        return true;
      },
      (error: unknown) => {
        finish();
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
    confirmErase(() => {
      run("Erasing", eraseLibrary).then(
        (done) => {
          if (done) successFeedback();
        },
        () => failed("Couldn't Erase Library"),
      );
    });
  }

  return { backUp, erase, restore, task };
}
