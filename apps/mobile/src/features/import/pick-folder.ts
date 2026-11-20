import { Alert } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

import type { FolderEntry } from "./folder-songs";
import { track } from "~/features/analytics/analytics";
import { audioExtension } from "./clean-tags";
import { findFolderSongs } from "./folder-songs";
import { addImportSources, setIncoming } from "./session";

/**
 * Copies of a folder's songs on their way to the import queue. Not the
 * import's own staging folder, which it clears between batches.
 */
const STAGING = new Directory(Paths.cache, "folder-import");

/** The picker is up; a second tap can't open another. */
let picking = false;
/** Songs picked folders will still hand to the queue. */
let incoming = 0;
/** Folders picked one after another copy in turn. */
let copying = Promise.resolve();

/** A name as Files shows it (URIs are percent-encoded). */
function nameOf(uri: string) {
  const base = uri.replace(/\/$/, "").split("/").at(-1) ?? "";
  try {
    return decodeURIComponent(base);
  } catch {
    return base;
  }
}

/** One folder's contents; one that can't be read counts as empty. */
function listFolder(folder: Directory) {
  try {
    return folder.list().map(
      (item): FolderEntry<Directory, File> => ({
        entry: item instanceof Directory ? { folder: item } : { file: item },
        name: nameOf(item.uri),
      }),
    );
  } catch {
    return [];
  }
}

function songsTitle(count: number) {
  return count === 1 ? "1 Song" : `${count.toLocaleString("en-US")} Songs`;
}

/**
 * Copies each song into the cache and hands it to the import queue, which
 * moves it into the library. The folder's own files are never moved or
 * deleted. Songs import while later ones are still copying.
 */
async function copyIn(songs: readonly { name: string; file: File }[]) {
  // Unique across picks, and across launches.
  const batch = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  for (const [index, song] of songs.entries()) {
    const key = `folder-${batch}-${String(index)}`;
    const copy = new File(
      STAGING,
      `${key}.${audioExtension(song.name) ?? "audio"}`,
    );
    await Promise.resolve()
      .then(() => {
        STAGING.create({ idempotent: true, intermediates: true });
        return song.file.copy(copy);
      })
      // A song that didn't copy is still handed over: reading it fails, and
      // the batch names it with the others that failed.
      .catch(() => undefined);
    addImportSources([{ key, mimeType: null, name: song.name, uri: copy.uri }]);
    incoming -= 1;
    setIncoming("folder", incoming);
  }
}

function startImport(songs: readonly { name: string; file: File }[]) {
  incoming += songs.length;
  setIncoming("folder", incoming);
  copying = copying.then(() => copyIn(songs));
}

/** Imports what's in a picked folder, asking first if some isn't downloaded. */
function importFolder(folder: Directory) {
  const { notDownloaded, songs } = findFolderSongs(folder, listFolder);
  if (notDownloaded === 0) {
    if (songs.length === 0) {
      Alert.alert(
        "No Songs in This Folder",
        "SYNQ imports MP3, M4A, AAC, FLAC, and WAV files.",
      );
    } else {
      startImport(songs);
    }
    return;
  }
  const title =
    notDownloaded === 1
      ? "1 Song Isn't Downloaded"
      : `${songsTitle(notDownloaded)} Aren't Downloaded`;
  if (songs.length === 0) {
    Alert.alert(
      title,
      "Download the folder in the Files app, then import it again.",
    );
    return;
  }
  Alert.alert(
    title,
    "To import every song, download the folder in the Files app first.",
    [
      { style: "cancel", text: "Cancel" },
      {
        isPreferred: true,
        onPress: () => startImport(songs),
        text: `Import ${songsTitle(songs.length)}`,
      },
    ],
  );
}

function isCancel(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    Reflect.get(error, "code") === "ERR_FILE_PICKING_CANCELLED"
  );
}

/**
 * Import Folder: the Files picker comes up right away, choosing a folder,
 * and the songs in it and the folders inside it import in the background.
 */
export function importFromFolder() {
  if (picking) return;
  picking = true;
  track("import_folder");
  Directory.pickDirectoryAsync().then(
    (folder) => {
      picking = false;
      importFolder(folder);
    },
    (error: unknown) => {
      picking = false;
      if (!isCancel(error)) Alert.alert("Couldn't Open Files", "Try again.");
    },
  );
}
