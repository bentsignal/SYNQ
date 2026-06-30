import { supportedAudioFileTypes } from "@synq/audio";
import { Data, Effect } from "effect";
import * as DocumentPicker from "expo-document-picker";

export class FileSelectionCanceled extends Data.TaggedError(
  "FileSelectionCanceled",
)<object> {}

export class NoFilesSelected extends Data.TaggedError(
  "NoFilesSelected",
)<object> {}

export const selectFiles = Effect.gen(function* () {
  const results = yield* Effect.promise(() =>
    DocumentPicker.getDocumentAsync({
      type: supportedAudioFileTypes,
      multiple: true,
      copyToCacheDirectory: true,
    }),
  );
  if (results.canceled)
    return yield* Effect.fail(new FileSelectionCanceled({}));
  if (results.assets.length === 0)
    return yield* Effect.fail(new NoFilesSelected({}));
  return results.assets;
});
