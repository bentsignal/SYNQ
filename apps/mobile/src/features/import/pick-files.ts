import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import type { ImportSource } from "./pipeline";
import { track } from "~/features/analytics/analytics";
import { PICKER_TYPES } from "./clean-tags";
import { addImportSources } from "./session";

/**
 * Opens the Files picker for audio (several at once). The picked files are
 * copied into the cache, which the import moves into the library. An empty
 * list means the picker was cancelled.
 */
async function pickAudioFiles() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: true,
    type: PICKER_TYPES,
  });
  if (result.canceled) return [];
  // Unique across picks, and across launches.
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

/** The picker is up; a second tap can't open another. */
let picking = false;

/**
 * Import from Files: the Files picker comes up right away, and what's
 * picked imports in the background (`addImportSources`).
 */
export function importFromFiles() {
  if (picking) return;
  picking = true;
  track("import_files");
  pickAudioFiles().then(
    (sources) => {
      picking = false;
      addImportSources(sources);
    },
    () => {
      picking = false;
      Alert.alert("Couldn't Open Files", "Try again.");
    },
  );
}
