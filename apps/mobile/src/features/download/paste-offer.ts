import { Alert, Linking } from "react-native";

import { readJson, writeJson } from "~/lib/kv";

const STORAGE_KEY = "synq.downloadPasteOffered";

function wasOffered(stored: unknown) {
  return stored === true;
}

/**
 * iOS asks before each paste from another app. An app can't change that or see
 * how it's set, only link to its own settings, so this offers that once, after
 * the first paste.
 */
export function offerPasteSetting() {
  if (readJson(STORAGE_KEY, wasOffered)) return;
  writeJson(STORAGE_KEY, true);
  Alert.alert(
    "Stop Asking to Paste?",
    "In Settings, set Paste from Other Apps to Allow.",
    [
      { style: "cancel", text: "Don't Ask Again" },
      {
        isPreferred: true,
        onPress: () => {
          Linking.openSettings().catch(() => undefined);
        },
        text: "Open Settings",
      },
    ],
  );
}
