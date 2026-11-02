import type {
  Album,
  albumArtists,
  albumSongs,
  Artist,
  Playlist,
  PlaylistSong,
  Song,
  songArtists,
} from "../schema.ts";

/** Every row of a library, read once: the current one, or a backup's. */
export interface LibrarySnapshot {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
  songArtists: (typeof songArtists.$inferSelect)[];
  albumSongs: (typeof albumSongs.$inferSelect)[];
  albumArtists: (typeof albumArtists.$inferSelect)[];
  playlistSongs: PlaylistSong[];
}

/** Paths are relative to the backup's root or to `Documents/`. */
export type MergeSide = "backup" | "library";

export interface MergeFolderEntry {
  name: string;
  isFolder: boolean;
}

/**
 * The files a merge touches, so the merge runs against node's file system in
 * tests and expo-file-system in the app.
 */
export interface MergeFileSystem {
  /** A file's size in bytes, or null when there's no file there. */
  size: (side: MergeSide, path: string) => number | null;
  /** A hash of a file's bytes. */
  hash: (side: MergeSide, path: string) => Promise<string>;
  /** What's in a folder, or null if it isn't there. */
  list: (side: MergeSide, folder: string) => MergeFolderEntry[] | null;
  /** Moves a backup's file into the library, creating its folder. Never overwrites. */
  move: (fromBackup: string, toLibrary: string) => Promise<void>;
  /** Removes a library file, if it's there. */
  removeFile: (path: string) => void;
  /** Removes a library folder and what's in it, if it's there. */
  removeFolder: (path: string) => void;
}

/**
 * What an unfinished merge put in the library, written before the first
 * file moves. `token` goes into the database in the merge's transaction, so
 * the next launch can tell a merge that committed from one that didn't.
 */
export interface MergeJournal {
  token: number;
  /** Files added to folders that already existed. */
  files: string[];
  /** Folders the merge created; everything in them is the merge's. */
  folders: string[];
}

/** Where the journal lives: somewhere that survives the app being killed. */
export interface MergeJournalStore {
  read: () => MergeJournal | null;
  write: (journal: MergeJournal) => void;
  clear: () => void;
}

/** What a merge added, for the alert after it. */
export interface MergeSummary {
  songs: number;
  albums: number;
  artists: number;
  playlists: number;
  /** Existing playlists that gained songs. */
  playlistsExtended: number;
  /** Blanks filled in on existing items: artwork, years, tracks, credits, audio. */
  filled: number;
}
