import * as DocumentPicker from "expo-document-picker";
import { getPickedBackupArchiveUri } from "./backup-command-result-service";

export const pickBackupArchive = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: "application/zip",
  });

  return getPickedBackupArchiveUri(result);
};
