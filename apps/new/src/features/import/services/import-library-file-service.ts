import * as FileSystem from "expo-file-system";

const getLibraryDirectory = () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return `${FileSystem.documentDirectory}library`;
};

export const deleteLibrarySongFiles = async (songId: number) => {
  if (!FileSystem.documentDirectory) {
    return;
  }

  await FileSystem.deleteAsync(
    `${FileSystem.documentDirectory}library/${songId}`,
    { idempotent: true },
  );
};

export const moveImportAudioToLibrary = async ({
  cacheUri,
  fileName,
  songId,
}: {
  cacheUri: string;
  fileName: string;
  songId: number;
}) => {
  const libraryDirectory = getLibraryDirectory();
  await FileSystem.makeDirectoryAsync(libraryDirectory, {
    intermediates: true,
  });

  const songDirectory = `${libraryDirectory}/${songId}`;
  await FileSystem.makeDirectoryAsync(songDirectory, { intermediates: true });

  const destination = `${songDirectory}/${fileName}`;
  await FileSystem.copyAsync({
    from: cacheUri,
    to: destination,
  });
  await FileSystem.deleteAsync(cacheUri, { idempotent: true });

  return destination;
};
