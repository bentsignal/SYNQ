import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export type ExportableLibrarySong = {
  id: number;
  pathToFile: string | null;
  title: string;
};

const sanitizeFileName = (value: string) =>
  value.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "song";

const getFileNameFromPath = (path: string, fallback: string) => {
  const rawName = decodeURIComponent(path.split("/").filter(Boolean).at(-1) ?? "");

  return sanitizeFileName(rawName || fallback);
};

const assertSharingAvailable = async () => {
  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error("Sharing is unavailable on this device.");
  }
};

const getPlayableSongs = (songs: ExportableLibrarySong[]) =>
  songs.filter(
    (song): song is ExportableLibrarySong & { pathToFile: string } =>
      song.pathToFile !== null,
  );

export async function shareLibrarySongs(songs: ExportableLibrarySong[]) {
  await assertSharingAvailable();

  const playableSongs = getPlayableSongs(songs);

  if (playableSongs.length === 0) {
    throw new Error("No playable songs are available to export.");
  }

  if (playableSongs.length === 1) {
    await Sharing.shareAsync(playableSongs[0].pathToFile);
    return {
      exported: 1,
    };
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  const exportDirectory = `${FileSystem.cacheDirectory}synq-export-${Date.now()}`;
  await FileSystem.makeDirectoryAsync(exportDirectory, { intermediates: true });

  try {
    for (let index = 0; index < playableSongs.length; index += 1) {
      const song = playableSongs[index];
      const fileName = getFileNameFromPath(
        song.pathToFile,
        `${index + 1}-${song.title}`,
      );

      await FileSystem.copyAsync({
        from: song.pathToFile,
        to: `${exportDirectory}/${index + 1}-${fileName}`,
      });
    }

    await Sharing.shareAsync(exportDirectory);

    return {
      exported: playableSongs.length,
    };
  } finally {
    await FileSystem.deleteAsync(exportDirectory, { idempotent: true });
  }
}
