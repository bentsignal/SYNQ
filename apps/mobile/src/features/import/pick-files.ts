import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";

import type { ImportSource } from "./pipeline";
import { PICKER_TYPES } from "./clean-tags";
import { addImportSources, getImportSession } from "./session";

/**
 * Opens the Files picker for audio (several at once). The picked files are
 * copied into the cache, which the import moves into the library. An empty
 * list means the picker was cancelled.
 */
export async function pickAudioFiles() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: true,
    type: PICKER_TYPES,
  });
  if (result.canceled) return [];
  // Unique across launches: staged covers are cached by their path.
  const batch = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return result.assets.map(
    (asset, index): ImportSource => ({
      key: `files-${batch}-${String(index)}`,
      mimeType: asset.mimeType ?? null,
      name: asset.name,
      uri: asset.uri,
    }),
  );
}

/** The batch the picker last opened for, so it opens once per sheet. */
let pickedFor = 0;

/**
 * Opens the picker for the Files import sheet, once it has presented, and
 * adds what's picked to its batch. Cancelling an empty batch closes it.
 */
export function pickIntoImport() {
  const { id, kind } = getImportSession();
  if (kind !== "files" || pickedFor === id) return;
  pickedFor = id;
  pickAudioFiles().then(
    (sources) => {
      if (getImportSession().id !== id) return;
      if (sources.length > 0) addImportSources(sources);
      else if (getImportSession().items.length === 0) router.back();
    },
    () => {
      Alert.alert("Couldn't Open Files", "Try again.");
      router.back();
    },
  );
}
