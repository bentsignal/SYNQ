/** Libraries with real files on disk, for merge tests. */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import type { LibraryDb } from "../client.ts";
import type {
  MergeFileSystem,
  MergeJournal,
  MergeSide,
} from "../merge/index.ts";
import { artworkDir } from "../library/artwork.ts";
import { mergeBackup, readLibrarySnapshot } from "../merge/index.ts";
import {
  albumArtists,
  albums,
  albumSongs,
  artists,
  playlists,
  playlistSongs,
  songArtists,
  songs,
} from "../schema.ts";
import { dumpLibrary } from "./dump-library.ts";
import { openTestLibraryDb } from "./node-sqlite.ts";
import { hashTree } from "./run-import.ts";

export const T = 1_800_000_000_000;
export const MERGED_AT = T + 1_000_000;

export function tempFolder() {
  return mkdtempSync(join(tmpdir(), "synq-merge-"));
}

/** A library's database and its folder, with helpers to fill both. */
export class TestLibrary {
  readonly db: LibraryDb;
  readonly root: string;

  constructor(db: LibraryDb, root = tempFolder()) {
    this.db = db;
    this.root = root;
  }

  file(path: string, bytes: string) {
    const full = join(this.root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, bytes);
  }

  song(
    id: number,
    title: string,
    audio: string | null,
    options: { durationMs?: number; cover?: string; name?: string } = {},
  ) {
    const name = options.name ?? `${title}.mp3`;
    const filePath = audio === null ? null : `library/${String(id)}/${name}`;
    if (filePath !== null && audio !== null) this.file(filePath, audio);
    this.db
      .insert(songs)
      .values({
        addedAt: T + id,
        artworkVersion: options.cover === undefined ? null : T,
        durationMs: options.durationMs ?? 180_000,
        filePath,
        id,
        mimeType: "audio/mpeg",
        title,
      })
      .run();
    if (options.cover !== undefined) this.covers("song", id, options.cover);
  }

  covers(
    kind: "song" | "album" | "artist" | "playlist",
    id: number,
    bytes: string,
  ) {
    this.file(`${artworkDir(kind, id)}/cover_full.jpg`, `${bytes} full`);
    this.file(`${artworkDir(kind, id)}/cover_small.jpg`, `${bytes} small`);
  }

  artist(id: number, name: string, cover?: string) {
    this.db
      .insert(artists)
      .values({
        addedAt: T,
        artworkVersion: cover === undefined ? null : T,
        id,
        name,
      })
      .run();
    if (cover !== undefined) this.covers("artist", id, cover);
  }

  album(
    id: number,
    name: string,
    options: { year?: number; cover?: string } = {},
  ) {
    this.db
      .insert(albums)
      .values({
        addedAt: T,
        artworkVersion: options.cover === undefined ? null : T,
        id,
        name,
        year: options.year ?? null,
      })
      .run();
    if (options.cover !== undefined) this.covers("album", id, options.cover);
  }

  credit(songId: number, artistId: number, position = 0) {
    this.db.insert(songArtists).values({ artistId, position, songId }).run();
  }

  track(albumId: number, songId: number, track: number | null, position = 0) {
    this.db
      .insert(albumSongs)
      .values({ albumId, position, songId, track })
      .run();
  }

  albumArtist(albumId: number, artistId: number, position = 0) {
    this.db.insert(albumArtists).values({ albumId, artistId, position }).run();
  }

  playlist(
    id: number,
    name: string,
    songIds: readonly number[],
    options: { kind?: "liked" | "user"; cover?: string } = {},
  ) {
    this.db
      .insert(playlists)
      .values({
        artworkVersion: options.cover === undefined ? null : T,
        createdAt: T,
        id,
        kind: options.kind ?? "user",
        name,
        updatedAt: T,
      })
      .run();
    if (options.cover !== undefined) this.covers("playlist", id, options.cover);
    for (const [index, songId] of songIds.entries()) {
      this.db
        .insert(playlistSongs)
        .values({ playlistId: id, position: index + 1, songId })
        .run();
    }
  }
}

/** `MergeFileSystem` over node's, between a backup's folder and a library's. */
export function nodeMergeFileSystem(backupRoot: string, libraryRoot: string) {
  function at(side: MergeSide, path: string) {
    return join(side === "backup" ? backupRoot : libraryRoot, path);
  }
  return {
    list: (side, folder) => {
      const path = at(side, folder);
      if (!existsSync(path)) return null;
      return readdirSync(path, { withFileTypes: true }).map((entry) => ({
        isFolder: entry.isDirectory(),
        name: entry.name,
      }));
    },
    hash: (side, path) =>
      Promise.resolve(
        createHash("md5")
          .update(readFileSync(at(side, path)))
          .digest("hex"),
      ),
    move: (from, to) => {
      const target = at("library", to);
      if (existsSync(target)) throw new Error(`Would overwrite ${to}`);
      mkdirSync(dirname(target), { recursive: true });
      renameSync(at("backup", from), target);
      return Promise.resolve();
    },
    removeFile: (path) => rmSync(at("library", path), { force: true }),
    removeFolder: (path) =>
      rmSync(at("library", path), { force: true, recursive: true }),
    size: (side, path) => {
      try {
        const stat = statSync(at(side, path));
        return stat.isFile() ? stat.size : null;
      } catch {
        return null;
      }
    },
  } satisfies MergeFileSystem;
}

/** A journal in memory, which remembers whether anything was written. */
export function memoryJournal() {
  const entries = new Array<MergeJournal>();
  const store = {
    clear: () => {
      entries.length = 0;
    },
    read: () => entries[0] ?? null,
    writes: 0,
    write: (next: MergeJournal) => {
      entries[0] = next;
      store.writes += 1;
    },
  };
  return store;
}

export async function library() {
  const { db } = await openTestLibraryDb();
  return new TestLibrary(db);
}

/** A copy of a backup's files, since a merge moves them out. */
export function copyTree(root: string) {
  const copy = tempFolder();
  for (const path of Object.keys(hashTree(root))) {
    mkdirSync(dirname(join(copy, path)), { recursive: true });
    copyFileSync(join(root, path), join(copy, path));
  }
  return copy;
}

/** Merges `backup` into `current` from a copy, so it can be restored again. */
export async function merge(
  current: TestLibrary,
  backup: TestLibrary,
  wrap: (fs: MergeFileSystem) => MergeFileSystem = (fs) => fs,
) {
  const journal = memoryJournal();
  const copy = copyTree(backup.root);
  const summary = await mergeBackup({
    backup: readLibrarySnapshot(backup.db),
    db: current.db,
    fs: wrap(nodeMergeFileSystem(copy, current.root)),
    journal,
    now: MERGED_AT,
  });
  rmSync(copy, { force: true, recursive: true });
  return { journal, summary };
}

export function read(lib: TestLibrary, path: string) {
  return readFileSync(join(lib.root, path), "utf8");
}

export function titles(db: LibraryDb) {
  return dumpLibrary(db).songs.map((song) => song.title);
}

export function playlistTitles(db: LibraryDb, name: string) {
  const dump = dumpLibrary(db);
  const playlist = dump.playlists.find((p) => p.name === name);
  if (playlist === undefined) throw new Error(`No playlist ${name}`);
  return dump.playlistSongs
    .filter((row) => row.playlistId === playlist.id)
    .map((row) => dump.songs.find((song) => song.id === row.songId)?.title);
}
