import * as DocumentPicker from "expo-document-picker";

export const pickBackupArchive = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/zip",
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
};
