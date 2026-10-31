/**
 * Builds a messy but realistic 2.5.2 install on disk: the app container's
 * `Documents/` (database, audio, covers) and AsyncStorage directory.
 *
 * The database is created with 2.5.2's exact DDL and filled with the same
 * SQL statements 2.5.2's models ran, in an order that reproduces what real
 * libraries contain: a renamed Liked Songs, case-variant artists, a
 * comma-named artist, multiple albums per song, songs without albums,
 * duplicate and orphaned join rows (2.5.2 had no constraints and deleted
 * non-atomically), the empty-`fileName` bug, a song whose file is gone,
 * half-finished imports the user never saw, NFD file names, and covers on
 * some entities. `docs/migration.md` lists what each case exercises.
 */
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

import { LEGACY_2_5_2_CREATE_ORDER, LEGACY_2_5_2_DDL } from "./legacy-ddl.ts";

export const BUNDLE_ID = "com.directedbyshawn.synq";

export interface SyntheticInstall {
  /** The app container (parent of `Documents/` and `Library/`). */
  container: string;
  documents: string;
  asyncStorageDir: string;
  dbPath: string;
}

/** Cover mtimes (seconds) → the `artwork_version` (ms) the importer should record. */
export const COVER_MTIMES = {
  song3: 1_700_000_001,
  song6: 1_700_000_002,
  album1: 1_700_000_003,
  album6: 1_700_000_004,
  album4: 1_700_000_005,
  artist3: 1_700_000_006,
  playlist2: 1_700_000_007,
  playlist3: 1_700_000_008,
} as const;

/** `Café del Mar.mp3` as APFS stores a name typed with a combining accent (NFD). */
export const NFD_FILE_NAME = "Café del Mar.mp3";

export interface SyntheticInstallOptions {
  /** A v1-era database: 2.5.2's v2 migration (`albumSongs.track`) never ran. */
  v1?: boolean;
}

const created: string[] = [];
process.on("exit", () => {
  for (const dir of created) rmSync(dir, { recursive: true, force: true });
});

export function buildSyntheticInstall(options: SyntheticInstallOptions = {}): SyntheticInstall {
  const container = mkdtempSync(join(tmpdir(), "synq-legacy-"));
  created.push(container);
  const documents = join(container, "Documents");
  const asyncStorageDir = join(container, "Library", "Application Support", BUNDLE_ID, "RCTAsyncLocalStorage_V1");
  const dbPath = join(documents, "SQLite", "synq.db");
  mkdirSync(join(documents, "SQLite"), { recursive: true });
  mkdirSync(asyncStorageDir, { recursive: true });

  const db = new DatabaseSync(dbPath);
  for (const name of LEGACY_2_5_2_CREATE_ORDER) db.exec(LEGACY_2_5_2_DDL[name]);
  if (!options.v1) db.exec(LEGACY_2_5_2_DDL.v2AddTrack);
  const legacy = new LegacyWriter(db, !options.v1);

  // Artists and albums (2.5.2's createArtist / createAlbum).
  const tyler = legacy.createArtist("Tyler, The Creator"); // 1, created by hand as one artist
  const kali = legacy.createArtist("Kali Uchis"); // 2
  const bts = legacy.createArtist("BTS"); // 3
  const btsLower = legacy.createArtist("bts"); // 4, case-variant duplicate
  const beyonce = legacy.createArtist("Beyoncé"); // 5
  legacy.createArtist("Empty Artist"); // 6, no songs
  const yoasobi = legacy.createArtist("YOASOBI"); // 7
  const flowerBoy = legacy.createAlbum("Flower Boy", 2017); // 1
  const isolation = legacy.createAlbum("Isolation", "2018-04-06"); // 2, a tag date in an INTEGER column
  const mots = legacy.createAlbum("Map of the Soul: 7", null); // 3
  const lemonade = legacy.createAlbum("Lemonade", 2016); // 4
  legacy.createAlbum("Empty Album", null); // 5, no songs
  const compilation = legacy.createAlbum("Compilation", null); // 6

  // Songs, the way saveToLibrary imported them.
  const s1 = legacy.importSong({ title: "See You Again", fileName: "01 See You Again.mp3", type: "audio/mpeg", seconds: 180 });
  legacy.addAlbumToSong(flowerBoy, s1, 1);
  legacy.addArtistToAlbum(tyler, flowerBoy);
  legacy.addArtistToAlbum(kali, flowerBoy);
  legacy.addArtistToSong(tyler, s1);
  legacy.addArtistToSong(kali, s1);

  const s2 = legacy.importSong({ title: "After the Storm", fileName: "After the Storm #2 & more.m4a", type: "audio/mp4", seconds: 207 });
  legacy.addAlbumToSong(isolation, s2, 3);
  legacy.addAlbumToSong(compilation, s2, 9);
  legacy.addArtistToAlbum(kali, isolation);
  legacy.addArtistToAlbum(kali, compilation);
  legacy.addArtistToSong(kali, s2);
  legacy.editSong(s2, "After the Storm", "Kali Uchis", "Isolation"); // edited = TRUE

  const s3 = legacy.importSong({ title: "ON", fileName: "ON.mp3", type: "audio/mpeg", seconds: 246 });
  legacy.addAlbumToSong(mots, s3, null);
  legacy.addArtistToAlbum(bts, mots);
  legacy.addArtistToSong(bts, s3);

  const s4 = legacy.importSong({ title: "on", fileName: "on.mp3", type: "audio/mpeg", seconds: 100 });
  legacy.addArtistToSong(btsLower, s4);

  const s5 = legacy.importSong({ title: "Formation", fileName: "Formation.flac", type: "audio/flac", seconds: 206 });
  legacy.addAlbumToSong(lemonade, s5, 12);
  legacy.addArtistToAlbum(beyonce, lemonade);
  legacy.addArtistToSong(beyonce, s5);

  const s6 = legacy.importSong({ title: "Café del Mar", fileName: "Café del Mar.mp3", type: "audio/mpeg", seconds: 300, diskName: NFD_FILE_NAME });

  // The user deleted this file through the Files app.
  const s7 = legacy.importSong({ title: "Ghost Track", fileName: "missing.mp3", type: "audio/mpeg", seconds: 1, noFile: true });

  // 2.5.2's empty-fileName path: the row says "", the folder has the file.
  legacy.importSong({ title: "Nameless", fileName: "", type: "audio/mp4", seconds: 50, diskName: "track.m4a" });

  // Copy failed: row written with fileName `song.${mimeType}`, nothing else (never shown).
  legacy.importSong({ title: "Broken Import", fileName: "song.audio/mpeg", type: "audio/mpeg", seconds: 0, noFile: true, failed: true });

  // Cover write threw after the copy: file and row exist, but not in Library (never shown).
  const s10 = legacy.importSong({ title: "Half Imported", fileName: "half.mp3", type: "audio/mpeg", seconds: 60, failed: true });

  // Deleted while removeFromAllPlaylists failed: joins and folder left behind.
  const s11 = legacy.importSong({ title: "Deleted Song", fileName: "deleted.mp3", type: "audio/mpeg", seconds: 10 });
  legacy.addAlbumToSong(flowerBoy, s11, 2);
  legacy.addArtistToSong(tyler, s11);

  const s12 = legacy.importSong({ title: "夜に駆ける", fileName: "夜に駆ける.mp3", type: "audio/mpeg", seconds: 0 });
  legacy.addArtistToSong(yoasobi, s12);

  // Deleted cleanly: only sqlite_sequence remembers id 13.
  const s13 = legacy.importSong({ title: "Last One", fileName: "last.mp3", type: "audio/mpeg", seconds: 5, noFile: true });
  legacy.removeFromAllPlaylists(s13);
  legacy.removeSong(s13);

  // Playlists.
  legacy.updatePlaylist(2, "Favs ♥");
  const roadTrip = legacy.createPlaylist("Road Trip"); // 3
  const deletedLater = legacy.createPlaylist("Deleted Later"); // 4
  const gym = legacy.createPlaylist("Gym & Run"); // 5
  legacy.addToPlaylist(2, s3);
  legacy.addToPlaylist(2, s1);
  legacy.addToPlaylist(2, s5);
  legacy.addToPlaylist(roadTrip, s2);
  legacy.addToPlaylist(roadTrip, s1);
  legacy.addToPlaylist(roadTrip, s1); // 2.5.2 allowed adding a song twice
  legacy.addToPlaylist(roadTrip, s6);
  legacy.addToPlaylist(roadTrip, s7);
  legacy.addToPlaylist(roadTrip, s11);
  legacy.addToPlaylist(deletedLater, s4);
  legacy.deletePlaylist(deletedLater); // its playlistSongs rows stay
  legacy.addToPlaylist(gym, s12);
  legacy.addToPlaylist(gym, s4);
  legacy.removeSong(s11);

  // Tampering and races: repeated and dangling join rows.
  legacy.raw("INSERT INTO artistSongs (artistId, songId) VALUES (?, ?)", [tyler, s1]);
  legacy.raw("INSERT INTO artistSongs (artistId, songId) VALUES (?, ?)", [99, s2]);
  legacy.addAlbumToSong(flowerBoy, s1, null);
  legacy.addArtistToAlbum(tyler, flowerBoy);
  legacy.addArtistToAlbum(99, flowerBoy);
  db.close();

  // Covers. getAlbumCover/getPlaylistCover also created empty folders for anything displayed.
  const cover = (dir: string, mtime: number, sizes: readonly ("full" | "small")[] = ["full", "small"]) => {
    mkdirSync(join(documents, dir), { recursive: true });
    for (const size of sizes) {
      const path = join(documents, dir, `cover_${size}.jpg`);
      writeFileSync(path, `jpeg ${dir} ${size}`);
      utimesSync(path, mtime, mtime);
    }
  };
  cover(`library/${s3}`, COVER_MTIMES.song3);
  cover(`library/${s6}`, COVER_MTIMES.song6);
  cover(`albums/${flowerBoy}`, COVER_MTIMES.album1);
  cover(`albums/${compilation}`, COVER_MTIMES.album6);
  cover(`albums/${lemonade}`, COVER_MTIMES.album4, ["small"]);
  cover(`artists/${bts}`, COVER_MTIMES.artist3);
  cover("playlists/2", COVER_MTIMES.playlist2);
  cover(`playlists/${roadTrip}`, COVER_MTIMES.playlist3);
  for (const dir of [`albums/${isolation}`, "albums/77", "playlists/1", `artists/${tyler}`]) {
    mkdirSync(join(documents, dir), { recursive: true });
  }
  for (const [dir, name] of legacy.files) {
    mkdirSync(join(documents, dir), { recursive: true });
    writeFileSync(join(documents, dir, name), `audio ${dir}/${name}`);
  }

  writeAsyncStorage(asyncStorageDir, documents, { s1, s2, s6, s10, s12 });
  return { container, documents, asyncStorageDir, dbPath };
}

interface SongSpec {
  title: string;
  fileName: string;
  type: string;
  seconds: number;
  /** The name on disk when it differs from `fileName`. */
  diskName?: string;
  noFile?: boolean;
  /** The import failed before `addToPlaylist(1, id)`. */
  failed?: boolean;
}

/** 2.5.2's model SQL, statement for statement. */
class LegacyWriter {
  readonly files: [dir: string, name: string][] = [];
  readonly #db: DatabaseSync;
  readonly #hasTrack: boolean;

  constructor(db: DatabaseSync, hasTrack: boolean) {
    this.#db = db;
    this.#hasTrack = hasTrack;
  }

  raw(sql: string, params: SQLInputValue[] = []): number {
    return Number(this.#db.prepare(sql).run(...params).lastInsertRowid);
  }

  createArtist(name: string) {
    return this.raw("INSERT INTO artists (name) VALUES (?);", [name]);
  }

  createAlbum(name: string, year: number | string | null) {
    return this.raw("INSERT INTO albums (name, year) VALUES (?, ?);", [name, year]);
  }

  importSong(spec: SongSpec): number {
    const id = this.raw(
      `INSERT INTO songs (title, artists, album, genre, duration, fileType, fileName, edited)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [spec.title, "", "", "Music", spec.seconds, spec.type, spec.fileName, 0],
    );
    if (!spec.noFile) this.files.push([`library/${id}`, spec.diskName ?? spec.fileName]);
    if (!spec.failed) this.addToPlaylist(1, id);
    return id;
  }

  editSong(id: number, title: string, artists: string, album: string) {
    this.raw("UPDATE songs SET title = ?, artists = ?, album = ?, edited = TRUE WHERE id = ?;", [title, artists, album, id]);
  }

  removeSong(id: number) {
    this.raw("DELETE FROM songs WHERE id = ?;", [id]);
  }

  addArtistToSong(artistId: number, songId: number) {
    this.raw(
      `INSERT INTO artistSongs (artistId, songId)
      SELECT ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM artistSongs WHERE artistId = ? AND songId = ?);`,
      [artistId, songId, artistId, songId],
    );
  }

  addAlbumToSong(albumId: number, songId: number, track: number | null) {
    if (this.#hasTrack) {
      this.raw("INSERT INTO albumSongs (albumId, songId, track) VALUES (?, ?, ?);", [albumId, songId, track]);
    } else {
      this.raw("INSERT INTO albumSongs (albumId, songId) VALUES (?, ?);", [albumId, songId]);
    }
  }

  /** `INSERT OR IGNORE` without a unique constraint: it never ignores. */
  addArtistToAlbum(artistId: number, albumId: number) {
    this.raw("INSERT OR IGNORE INTO artistsAlbums (artistId, albumId) VALUES (?, ?);", [artistId, albumId]);
  }

  createPlaylist(name: string) {
    return this.raw("INSERT INTO playlists (name) VALUES (?);", [name]);
  }

  updatePlaylist(id: number, name: string) {
    this.raw("UPDATE playlists SET name = ? WHERE id = ?;", [name, id]);
  }

  deletePlaylist(id: number) {
    this.raw("DELETE FROM playlists WHERE id = ?;", [id]);
  }

  addToPlaylist(playlistId: number, songId: number) {
    this.raw("INSERT INTO playlistSongs (playlistId, songId) VALUES (?, ?);", [playlistId, songId]);
  }

  removeFromAllPlaylists(songId: number) {
    this.raw("DELETE FROM playlistSongs WHERE songId = ?;", [songId]);
  }
}

function writeAsyncStorage(
  dir: string,
  documents: string,
  ids: { s1: number; s2: number; s6: number; s10: number; s12: number },
): void {
  const documentsUri = `file://${documents}/`;
  const track = (id: number, title: string, file: string) => ({
    id,
    url: `${documentsUri}library/${id}/${file}`,
    description: createHash("md5").update(`${id}`).digest("hex"),
    title,
    artist: "",
    album: "",
    artwork: `${documentsUri}albums/1/cover_full.jpg?1700000003`,
  });
  const queue = [
    track(ids.s1, "See You Again", "01 See You Again.mp3"),
    track(ids.s2, "After the Storm", "After the Storm #2 & more.m4a"),
    { id: -2, url: "file:///bundle/ad.mp3", title: "Premium Ad", artist: "SYNQ", artwork: 1 },
    track(ids.s6, "Café del Mar", NFD_FILE_NAME), // index 3: the current track
    track(99, "Long Gone", "gone.mp3"),
    track(9, "Broken Import", "song.audio/mpeg"),
    track(ids.s12, "夜に駆ける", "夜に駆ける.mp3"),
    track(ids.s10, "Half Imported", "half.mp3"),
  ];
  const queueJson = JSON.stringify(queue);
  if (queueJson.length <= 1024) throw new Error("fixture queue must exceed AsyncStorage's inline threshold");

  const manifest: Record<string, string | null> = {
    dbVersion: "2",
    theme: "#A888EC",
    haptic: "false",
    shuffle: "true",
    loop: "true",
    queue: null,
    lastTrackIndex: "3",
    position: "42.7",
    sourceType: "1",
    sourceId: "3",
    expiration: "never",
    playAd: "true",
    timePlayed: "455",
    addOffset: "1",
    importCount: "4",
    reviewAlreadyRequested: "true",
    exportNumber: "2",
    somethingNew: "x",
  };
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest));
  writeFileSync(join(dir, createHash("md5").update("queue", "utf8").digest("hex")), queueJson);
}
