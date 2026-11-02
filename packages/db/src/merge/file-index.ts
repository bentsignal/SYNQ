/**
 * The paths a merge plan asks about, read beforehand. A plan asks about
 * thousands of them, and a native file check per path would hold up the JS
 * thread for seconds on a large library; so would one listing of `library/`,
 * with a folder per song. This reads the folders the rows name, one at a time
 * with pauses, and the plan looks them up. Names compare ignoring Unicode
 * normalization, as APFS does: a stored name can be NFC while the file's on
 * disk in NFD.
 */
import type { ArtworkKind } from "../library/artwork.ts";
import type { MergeIds } from "./plan-files.ts";
import type { LibrarySnapshot, MergeFileSystem, MergeSide } from "./types.ts";
import { artworkDir } from "../library/artwork.ts";
import { songFilePath } from "./match-songs.ts";

/** Answers whether a path exists, on either side. */
export interface PathIndex {
  exists: (side: MergeSide, path: string) => boolean;
}

function key(path: string) {
  return path.normalize("NFC");
}

function parentOf(path: string) {
  return path.slice(0, path.lastIndexOf("/"));
}

/** The folders a library's rows live in. */
function rowFolders(library: LibrarySnapshot) {
  const folders = new Set<string>();
  for (const song of library.songs) {
    folders.add(artworkDir("song", song.id));
    const path = songFilePath(song);
    if (path !== null) folders.add(parentOf(path));
  }
  for (const { id } of library.albums) folders.add(artworkDir("album", id));
  for (const { id } of library.artists) folders.add(artworkDir("artist", id));
  for (const { id } of library.playlists) {
    folders.add(artworkDir("playlist", id));
  }
  return folders;
}

/** The folders of the ids a plan may hand out: is anything left in the way? */
function candidateFolders(
  backup: LibrarySnapshot,
  lastIds: Readonly<MergeIds>,
) {
  function candidates(kind: ArtworkKind, last: number, count: number) {
    return Array.from({ length: count }, (_, index) =>
      artworkDir(kind, last + index + 1),
    );
  }
  return [
    ...candidates("song", lastIds.songs, backup.songs.length),
    ...candidates("album", lastIds.albums, backup.albums.length),
    ...candidates("artist", lastIds.artists, backup.artists.length),
    ...candidates("playlist", lastIds.playlists, backup.playlists.length),
  ];
}

async function readPaths(
  options: IndexOptions,
  side: MergeSide,
  folders: Iterable<string>,
) {
  const { fs, pause } = options;
  const paths = new Set<string>();
  const queue = [...folders];
  for (let folder = queue.pop(); folder !== undefined; folder = queue.pop()) {
    const entries = fs.list(side, folder);
    if (entries !== null) {
      paths.add(key(folder));
      for (const entry of entries) {
        const path = `${folder}/${entry.name}`;
        paths.add(key(path));
        if (entry.isFolder) queue.push(path);
      }
    }
    await pause?.();
  }
  return paths;
}

interface IndexOptions {
  fs: MergeFileSystem;
  backup: LibrarySnapshot;
  current: LibrarySnapshot;
  lastIds: Readonly<MergeIds>;
  pause?: () => Promise<void>;
}

export async function indexPaths(options: IndexOptions) {
  const { backup, current, lastIds } = options;
  const backupPaths = await readPaths(options, "backup", rowFolders(backup));
  const libraryPaths = await readPaths(options, "library", [
    ...rowFolders(current),
    ...candidateFolders(backup, lastIds),
  ]);
  return {
    exists: (side, path) =>
      (side === "backup" ? backupPaths : libraryPaths).has(key(path)),
  } satisfies PathIndex;
}
