import { useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";

import { track } from "~/features/analytics/analytics";
import { usePremium } from "~/features/premium/premium";
import { errorFeedback, successFeedback } from "~/lib/haptics";
import {
  backUpLibrary,
  eraseLibrary,
  finishRestore,
  inspectBackup,
  RestoreError,
  restoreLibrary,
} from "./backup";

const SUPPORT_URL = "https://directedbyshawn.com/synq-support";

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

/** Tells someone why a restore failed; `retry` finishes one whose files didn't move. */
function restoreFailed(error: unknown, retry: () => void) {
  if (!(error instanceof RestoreError)) {
    failed("Couldn't Restore Library");
    return;
  }
  errorFeedback();
  switch (error.code) {
    case "files":
      failed("Couldn't Finish Restoring", retry);
      return;
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
 * Back Up Library, Restore from Backup, and Erase Library (Premium, as in
 * 2.5.2), one at a time, with the running one's progress.
 */
export function useBackupActions() {
  const router = useRouter();
  const premium = usePremium();
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
    return work((value) => setTask({ label, progress: value })).then(
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
    run("Backing Up", backUpLibrary).catch(() =>
      failed("Couldn't Back Up Library"),
    );
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
      (error: unknown) => restoreFailed(error, retryFiles),
    );
  }

  async function chooseBackup() {
    const uri = await pickBackup();
    if (uri === null) return;
    Alert.alert(
      "Replace Your Library?",
      "Everything in your library is replaced by the backup. This can't be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => restoreFrom(uri),
          style: "destructive",
          text: "Restore",
        },
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

  return { backUp, erase, restore, task };
}
