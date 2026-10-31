/**
 * Development builds only: fills the library with the sample songs in
 * `apps/mobile/dev/sample-library` (real, playable, tagged audio with
 * covers), a few playlists, and likes, and on request thousands more songs
 * for measuring lists. `scripts/sim.sh seed` copies the sample folder into
 * the app's caches (`Library/Caches/synq-seed`) and calls `synqDev.seed()`.
 *
 * The files go where an import puts them (`Documents/library/{id}/`, and
 * covers into the album's or song's folder), through the same `addSongs`
 * and `setArtwork` writes, so seeded songs behave like imported ones.
 */
import { File, Paths } from "expo-file-system";

import type { LibraryDb, NewSongInput } from "@synq/db";
import {
  addSongs,
  addSongsToPlaylist,
  artworkDir,
  createPlaylist,
  deleteAlbum,
  deleteArtist,
  deletePlaylist,
  deleteSongs,
  listAlbums,
  listArtists,
  listPlaylists,
  listSongs,
  setArtwork,
  setSongLiked,
} from "@synq/db";

import type { SampleManifest, SampleSong } from "./sample-manifest";
import { libraryClientForDev, libraryDb } from "~/features/library/database";
import {
  deleteLibraryFolders,
  documentDirectory,
} from "~/features/library/files";
import { queryClient } from "~/lib/query-client";
import { readManifest, stagedFolder } from "./sample-manifest";

/** Copies a staged cover into an entity's folder, both sizes. */
function copyCover(cover: string, dir: string) {
  const folder = documentDirectory(dir);
  if (!folder.exists) folder.create({ intermediates: true });
  for (const size of ["full", "small"]) {
    const target = new File(folder, `cover_${size}.jpg`);
    if (target.exists) target.delete();
    new File(stagedFolder(), "covers", `${cover}_${size}.jpg`).copySync(target);
  }
}

function copyAudio(file: string, filePath: string) {
  const target = new File(
    Paths.document,
    ...filePath.split("/").filter(Boolean),
  );
  const folder = target.parentDirectory;
  if (!folder.exists) folder.create({ intermediates: true });
  new File(stagedFolder(), "audio", file).copySync(target);
}

function songInput(song: SampleSong) {
  return {
    album: song.album,
    artists: song.artists,
    durationMs: song.durationMs,
    fileName: song.file,
    hasArtwork: song.cover !== null,
    mimeType: song.mimeType,
    title: song.title,
    track: song.track,
    year: song.year,
  } satisfies NewSongInput;
}

/** Deletes everything in the library (rows and folders), Liked Songs aside. */
function erase(db: LibraryDb) {
  const deleted = deleteSongs(
    db,
    listSongs(db).map((song) => song.id),
  ).value;
  const paths = [...deleted.deletePaths];
  for (const album of listAlbums(db)) {
    paths.push(...deleteAlbum(db, album.id).value.deletePaths);
  }
  for (const artist of listArtists(db)) {
    paths.push(...deleteArtist(db, artist.id).value.deletePaths);
  }
  for (const playlist of listPlaylists(db)) {
    if (playlist.kind === "liked") continue;
    paths.push(...deletePlaylist(db, playlist.id).value.deletePaths);
  }
  deleteLibraryFolders(paths);
}

/** The sample songs, playlists, likes, and covers. Returns file → song. */
function seedSamples(db: LibraryDb, manifest: SampleManifest) {
  const added = addSongs(db, manifest.songs.map(songInput)).value;
  const byFile = new Map<string, { id: number; filePath: string }>();
  manifest.songs.forEach((song, index) => {
    const result = added[index];
    if (result === undefined) return;
    copyAudio(song.file, result.filePath);
    if (song.cover !== null && result.artworkTarget !== null) {
      copyCover(song.cover, result.artworkTarget.dir);
    }
    byFile.set(song.file, { filePath: result.filePath, id: result.id });
  });
  for (const artist of listArtists(db)) {
    const cover = manifest.artistCovers[artist.name];
    if (cover === undefined) continue;
    copyCover(cover, artworkDir("artist", artist.id));
    setArtwork(db, "artist", artist.id, true);
  }
  for (const sample of manifest.playlists) {
    const playlist = createPlaylist(db, sample.name).value;
    addSongsToPlaylist(
      db,
      playlist.id,
      sample.songs.flatMap((file) => byFile.get(file)?.id ?? []),
    );
    if (sample.cover !== null) {
      copyCover(sample.cover, artworkDir("playlist", playlist.id));
      setArtwork(db, "playlist", playlist.id, true);
    }
  }
  for (const file of manifest.liked) {
    const song = byFile.get(file);
    if (song !== undefined) setSongLiked(db, song.id, true);
  }
  return byFile;
}

const WORDS = [
  "Amber",
  "Arcade",
  "Atlas",
  "Blue",
  "Canyon",
  "Cinder",
  "Coast",
  "Copper",
  "Delta",
  "Drift",
  "Echo",
  "Ember",
  "Fable",
  "Field",
  "Glass",
  "Golden",
  "Harbor",
  "Hollow",
  "Iris",
  "Ivory",
  "Juniper",
  "Lantern",
  "Low",
  "Lunar",
  "Meadow",
  "Mirror",
  "Neon",
  "North",
  "Oak",
  "Orbit",
  "Paper",
  "Pine",
  "Quiet",
  "Rain",
  "River",
  "Salt",
  "Signal",
  "Silver",
  "Slow",
  "Static",
  "Summer",
  "Tide",
  "Velvet",
  "Violet",
  "Willow",
  "Winter",
  "Young",
  "Zenith",
];

/** A small seeded random generator (mulberry32), so every run matches. */
function random(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Thousands of made-up songs for measuring lists: about one artist per 25
 * songs, a dozen songs per album, covers on two albums in three. They play
 * the sample files (their `file_path` points at one), so nothing is copied
 * but the covers.
 */
function seedSynthetic(
  db: LibraryDb,
  count: number,
  manifest: SampleManifest,
  samples: Map<string, { id: number; filePath: string }>,
) {
  const next = random(count);
  function pick(list: readonly string[]) {
    return list[Math.floor(next() * list.length)] ?? "Song";
  }
  const sampleSongs = manifest.songs.filter((song) => samples.has(song.file));
  const covers = [
    ...new Set(manifest.songs.flatMap((song) => song.cover ?? [])),
  ];
  const artists = Array.from(
    { length: Math.max(4, Math.round(count / 25)) },
    (_, index) => `${pick(WORDS)} ${pick(WORDS)} ${index + 1}`,
  );
  const inputs = Array.from({ length: count }, (_, index) => {
    const sample = sampleSongs[index % sampleSongs.length];
    const artist = artists[Math.floor(index / 25) % artists.length] ?? "Artist";
    const albumNumber = Math.floor(index / 12);
    return {
      input: {
        album: `${pick(WORDS)} ${pick(WORDS)} (${albumNumber + 1})`,
        artists: artist,
        durationMs: sample?.durationMs ?? 10_000,
        fileName: sample?.file ?? "song.m4a",
        hasArtwork: albumNumber % 3 !== 2,
        mimeType: sample?.mimeType ?? "audio/mp4",
        title: `${pick(WORDS)} ${pick(WORDS)}`,
        track: (index % 12) + 1,
        year: 1990 + (albumNumber % 35),
      } satisfies NewSongInput,
      sample,
    };
  });
  const added = addSongs(
    db,
    inputs.map((entry) => entry.input),
  ).value;
  const client = libraryClientForDev();
  client.withTransactionSync(() => {
    added.forEach((song, index) => {
      const sample = inputs[index]?.sample;
      const path = sample === undefined ? undefined : samples.get(sample.file);
      if (path !== undefined) {
        client.runSync("UPDATE songs SET file_path = ? WHERE id = ?", [
          path.filePath,
          song.id,
        ]);
      }
    });
  });
  added.forEach((song, index) => {
    if (song.artworkTarget === null) return;
    copyCover(
      covers[index % covers.length] ?? "lowlight",
      song.artworkTarget.dir,
    );
  });
}

/**
 * `synqDev.seed()`: the sample library, into an empty library (pass
 * `reset: true` to erase what's there first). `songs` above the sample's
 * count adds made-up songs up to that many, e.g. `seed({ songs: 3000 })`.
 */
export function seed(options: { songs?: number; reset?: boolean } = {}) {
  const started = Date.now();
  const db = libraryDb();
  if (options.reset === true) erase(db);
  if (listSongs(db).length > 0) {
    throw new Error(
      "The library isn't empty; seed({ reset: true }) erases it.",
    );
  }
  const manifest = readManifest();
  const samples = seedSamples(db, manifest);
  const extra = (options.songs ?? 0) - manifest.songs.length;
  if (extra > 0) seedSynthetic(db, extra, manifest, samples);
  void queryClient.invalidateQueries({ queryKey: ["library"] });
  return {
    ms: Date.now() - started,
    songs: listSongs(db).length,
  };
}
