import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { unzip, zip } from "react-native-zip-archive";

const getDocumentDirectory = () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return FileSystem.documentDirectory;
};

export const clearBackupDocumentDirectory = async () => {
  const documentDirectory = getDocumentDirectory();
  const items = await FileSystem.readDirectoryAsync(documentDirectory);
  for (const item of items) {
    await FileSystem.deleteAsync(`${documentDirectory}${item}`);
  }
};

export const createAndShareBackupArchive = async () => {
  const documentDirectory = getDocumentDirectory();
  const pathToZip = await zip(
    documentDirectory,
    `${documentDirectory}backup.zip`,
  );
  await Sharing.shareAsync(pathToZip);
};

export const restoreBackupArchive = async (uri: string) => {
  await unzip(uri, getDocumentDirectory());
};
