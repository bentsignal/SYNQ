import { audioExtension } from "./clean-tags.ts";

/** A file or folder inside a picked folder, as `findFolderSongs` sees it. */
export interface FolderEntry<Folder, File> {
  /** The name Files shows. */
  name: string;
  entry: { folder: Folder } | { file: File };
}

export interface FolderSongs<File> {
  /** The audio to import, folder by folder, in the order Files lists them. */
  songs: { name: string; file: File }[];
  /** Audio in iCloud Drive that isn't downloaded to this iPhone. */
  notDownloaded: number;
}

/** iCloud Drive's stand-in for a file it hasn't downloaded: `.Song.mp3.icloud`. */
const ICLOUD_PLACEHOLDER = /^\.(.+)\.icloud$/;

/** Deep enough for Artist/Album/Disc and then some, and no endless loops. */
const MAX_DEPTH = 8;

function byName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, "en", {
    numeric: true,
    sensitivity: "base",
  });
}

function isAudio(name: string) {
  return audioExtension(name) !== null;
}

/**
 * The files SYNQ can import (`imports`: audio unless it says otherwise) in a
 * folder and the folders inside it. Hidden files (such as the `._Song.mp3`
 * files macOS leaves on drives) are skipped.
 */
export function findFolderSongs<Folder, File>(
  root: Folder,
  list: (folder: Folder) => readonly FolderEntry<Folder, File>[],
  imports: (name: string) => boolean = isAudio,
) {
  const songs = new Array<{ name: string; file: File }>();
  let notDownloaded = 0;
  function visit(folder: Folder, depth: number) {
    const entries = [...list(folder)].sort(byName);
    const folders = new Array<Folder>();
    for (const { entry, name } of entries) {
      const placeholder = ICLOUD_PLACEHOLDER.exec(name)?.[1];
      if (placeholder !== undefined) {
        if (imports(placeholder)) notDownloaded += 1;
      } else if (name.startsWith(".")) {
        // Hidden.
      } else if ("folder" in entry) {
        folders.push(entry.folder);
      } else if (imports(name)) {
        songs.push({ file: entry.file, name });
      }
    }
    if (depth >= MAX_DEPTH) return;
    for (const inner of folders) visit(inner, depth + 1);
  }
  visit(root, 0);
  return { notDownloaded, songs } satisfies FolderSongs<File>;
}
