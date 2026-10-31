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
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { LEGACY_2_5_2_CREATE_ORDER, LEGACY_2_5_2_DDL } from "./legacy-ddl.ts";
import { LegacyWriter } from "./legacy-writer.ts";
import { writeAsyncStorage } from "./synthetic-async-storage.ts";
import { BUNDLE_ID, NFD_FILE_NAME } from "./synthetic-constants.ts";
import { writeCovers } from "./synthetic-covers.ts";

export {
  BUNDLE_ID,
  COVER_MTIMES,
  NFD_FILE_NAME,
} from "./synthetic-constants.ts";

export interface SyntheticInstall {
  /** The app container (parent of `Documents/` and `Library/`). */
  container: string;
  documents: string;
  asyncStorageDir: string;
  dbPath: string;
}

export interface SyntheticInstallOptions {
  /** A v1-era database: 2.5.2's v2 migration (`albumSongs.track`) never ran. */
  v1?: boolean;
}

const created = new Array<string>();
process.on("exit", () => {
  for (const dir of created) rmSync(dir, { recursive: true, force: true });
});

export function buildSyntheticInstall(options: SyntheticInstallOptions = {}) {
  const container = mkdtempSync(join(tmpdir(), "synq-legacy-"));
  created.push(container);
  const documents = join(container, "Documents");
  const asyncStorageDir = join(
    container,
    "Library",
    "Application Support",
    BUNDLE_ID,
    "RCTAsyncLocalStorage_V1",
  );
  const dbPath = join(documents, "SQLite", "synq.db");
  mkdirSync(join(documents, "SQLite"), { recursive: true });
  mkdirSync(asyncStorageDir, { recursive: true });

  const db = new DatabaseSync(dbPath);
  for (const name of LEGACY_2_5_2_CREATE_ORDER) db.exec(LEGACY_2_5_2_DDL[name]);
  if (!options.v1) db.exec(LEGACY_2_5_2_DDL.v2AddTrack);
  const legacy = new LegacyWriter(db, !options.v1);

  const entities = addArtistsAndAlbums(legacy);
  const songIds = addSongs(legacy, entities);
  const roadTrip = addPlaylists(legacy, songIds);
  addTampering(legacy, entities, songIds);
  addTaglessSongs(legacy, entities);
  db.close();

  writeCovers(documents, legacy.files, { ...entities, ...songIds, roadTrip });
  writeAsyncStorage(asyncStorageDir, documents, songIds);
  return { container, documents, asyncStorageDir, dbPath };
}

function addArtistsAndAlbums(legacy: LegacyWriter) {
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
  return {
    tyler,
    kali,
    bts,
    btsLower,
    beyonce,
    yoasobi,
    flowerBoy,
    isolation,
    mots,
    lemonade,
    compilation,
  };
}

function addSongs(
  legacy: LegacyWriter,
  ids: ReturnType<typeof addArtistsAndAlbums>,
) {
  const {
    tyler,
    kali,
    bts,
    btsLower,
    beyonce,
    flowerBoy,
    isolation,
    mots,
    lemonade,
    compilation,
  } = ids;
  // Songs, the way saveToLibrary imported them.
  const s1 = legacy.importSong({
    title: "See You Again",
    fileName: "01 See You Again.mp3",
    type: "audio/mpeg",
    seconds: 180,
  });
  legacy.addAlbumToSong(flowerBoy, s1, 1);
  legacy.addArtistToAlbum(tyler, flowerBoy);
  legacy.addArtistToAlbum(kali, flowerBoy);
  legacy.addArtistToSong(tyler, s1);
  legacy.addArtistToSong(kali, s1);

  const s2 = legacy.importSong({
    title: "After the Storm",
    fileName: "After the Storm #2 & more.m4a",
    type: "audio/mp4",
    seconds: 207,
  });
  legacy.addAlbumToSong(isolation, s2, 3);
  legacy.addAlbumToSong(compilation, s2, 9);
  legacy.addArtistToAlbum(kali, isolation);
  legacy.addArtistToAlbum(kali, compilation);
  legacy.addArtistToSong(kali, s2);
  legacy.editSong(s2, "After the Storm", "Kali Uchis", "Isolation"); // edited = TRUE

  const s3 = legacy.importSong({
    title: "ON",
    fileName: "ON.mp3",
    type: "audio/mpeg",
    seconds: 246,
  });
  legacy.addAlbumToSong(mots, s3, null);
  legacy.addArtistToAlbum(bts, mots);
  legacy.addArtistToSong(bts, s3);

  const s4 = legacy.importSong({
    title: "on",
    fileName: "on.mp3",
    type: "audio/mpeg",
    seconds: 100,
  });
  legacy.addArtistToSong(btsLower, s4);

  const s5 = legacy.importSong({
    title: "Formation",
    fileName: "Formation.flac",
    type: "audio/flac",
    seconds: 206,
  });
  legacy.addAlbumToSong(lemonade, s5, 12);
  legacy.addArtistToAlbum(beyonce, lemonade);
  legacy.addArtistToSong(beyonce, s5);

  const s6 = legacy.importSong({
    title: "Café del Mar",
    fileName: "Café del Mar.mp3",
    type: "audio/mpeg",
    seconds: 300,
    diskName: NFD_FILE_NAME,
  });

  return { s1, s2, s3, s4, s5, s6, ...addEdgeCaseSongs(legacy, ids) };
}

/** Songs 7 onward: the failures and leftovers real 2.5.2 libraries accumulated. */
function addEdgeCaseSongs(
  legacy: LegacyWriter,
  { tyler, flowerBoy, yoasobi }: ReturnType<typeof addArtistsAndAlbums>,
) {
  // The user deleted this file through the Files app.
  const s7 = legacy.importSong({
    title: "Ghost Track",
    fileName: "missing.mp3",
    type: "audio/mpeg",
    seconds: 1,
    noFile: true,
  });

  // 2.5.2's empty-fileName path: the row says "", the folder has the file.
  legacy.importSong({
    title: "Nameless",
    fileName: "",
    type: "audio/mp4",
    seconds: 50,
    diskName: "track.m4a",
  });

  // Copy failed: row written with fileName `song.${mimeType}`, nothing else (never shown).
  legacy.importSong({
    title: "Broken Import",
    fileName: "song.audio/mpeg",
    type: "audio/mpeg",
    seconds: 0,
    noFile: true,
    failed: true,
  });

  // Cover write threw after the copy: file and row exist, but not in Library (never shown).
  const s10 = legacy.importSong({
    title: "Half Imported",
    fileName: "half.mp3",
    type: "audio/mpeg",
    seconds: 60,
    failed: true,
  });

  // Deleted while removeFromAllPlaylists failed: joins and folder left behind.
  const s11 = legacy.importSong({
    title: "Deleted Song",
    fileName: "deleted.mp3",
    type: "audio/mpeg",
    seconds: 10,
  });
  legacy.addAlbumToSong(flowerBoy, s11, 2);
  legacy.addArtistToSong(tyler, s11);

  const s12 = legacy.importSong({
    title: "夜に駆ける",
    fileName: "夜に駆ける.mp3",
    type: "audio/mpeg",
    seconds: 0,
  });
  legacy.addArtistToSong(yoasobi, s12);

  // Deleted cleanly: only sqlite_sequence remembers id 13.
  const s13 = legacy.importSong({
    title: "Last One",
    fileName: "last.mp3",
    type: "audio/mpeg",
    seconds: 5,
    noFile: true,
  });
  legacy.removeFromAllPlaylists(s13);
  legacy.removeSong(s13);
  return { s7, s10, s11, s12 };
}

/** Returns the id of "Road Trip", which has a cover. */
function addPlaylists(
  legacy: LegacyWriter,
  { s1, s2, s3, s4, s5, s6, s7, s11, s12 }: ReturnType<typeof addSongs>,
) {
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
  return roadTrip;
}

/**
 * Songs 14 to 16, what 2.5.2's tag reader got wrong: no title for a WAV or
 * an uppercase `.MP3` (stored as `''`, or `NULL` from a v1-era import), and
 * an m4a "2 of 3" read as `(3 << 16) | 2`.
 */
function addTaglessSongs(
  legacy: LegacyWriter,
  { compilation }: ReturnType<typeof addArtistsAndAlbums>,
) {
  legacy.importSong({
    title: "",
    fileName: "field recording.wav",
    type: "audio/wav",
    seconds: 6,
  });
  const loud = legacy.importSong({
    title: "",
    fileName: "LOUD.MP3",
    type: "audio/mpeg",
    seconds: 8,
  });
  legacy.raw("UPDATE songs SET title = NULL WHERE id = ?;", [loud]);
  const packed = legacy.importSong({
    title: "Scaffold & Steel",
    fileName: "Blueprints - Scaffold & Steel.m4a",
    type: "audio/x-m4a",
    seconds: 7,
  });
  legacy.addAlbumToSong(compilation, packed, (3 << 16) | 2);
}

function addTampering(
  legacy: LegacyWriter,
  { tyler, flowerBoy }: ReturnType<typeof addArtistsAndAlbums>,
  { s1, s2 }: ReturnType<typeof addSongs>,
) {
  // Tampering and races: repeated and dangling join rows.
  legacy.raw("INSERT INTO artistSongs (artistId, songId) VALUES (?, ?)", [
    tyler,
    s1,
  ]);
  legacy.raw("INSERT INTO artistSongs (artistId, songId) VALUES (?, ?)", [
    99,
    s2,
  ]);
  legacy.addAlbumToSong(flowerBoy, s1, null);
  legacy.addArtistToAlbum(tyler, flowerBoy);
  legacy.addArtistToAlbum(99, flowerBoy);
}
