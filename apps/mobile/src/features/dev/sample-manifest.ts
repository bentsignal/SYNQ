/**
 * The dev sample library's manifest.json, staged by `scripts/sim.sh seed`
 * in the app's caches and checked field by field (see seed.ts).
 */
import { Directory, File, Paths } from "expo-file-system";

export interface SampleSong {
  file: string;
  title: string;
  artists: string | null;
  album: string | null;
  year: number | null;
  track: number | null;
  durationMs: number;
  mimeType: string;
  cover: string | null;
}

export interface SampleManifest {
  songs: SampleSong[];
  playlists: { name: string; cover: string | null; songs: string[] }[];
  liked: string[];
  artistCovers: Record<string, string>;
}

export function stagedFolder() {
  return new Directory(Paths.cache, "synq-seed");
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

function int(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function objects(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is object => typeof item === "object" && item !== null,
      )
    : [];
}

function coverNames(value: unknown) {
  if (typeof value !== "object" || value === null) return {};
  return Object.fromEntries(
    Object.keys(value).flatMap((name) => {
      const cover = text(Reflect.get(value, name));
      return cover === null ? [] : [[name, cover]];
    }),
  );
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/** The manifest, checked field by field. */
function decodeManifest(parsed: unknown) {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("The sample manifest isn't an object.");
  }
  return {
    artistCovers: coverNames(Reflect.get(parsed, "artistCovers")),
    liked: strings(Reflect.get(parsed, "liked")),
    playlists: objects(Reflect.get(parsed, "playlists")).map((playlist) => ({
      cover: text(Reflect.get(playlist, "cover")),
      name: text(Reflect.get(playlist, "name")) ?? "Playlist",
      songs: strings(Reflect.get(playlist, "songs")),
    })),
    songs: objects(Reflect.get(parsed, "songs")).map((song) => ({
      album: text(Reflect.get(song, "album")),
      artists: text(Reflect.get(song, "artists")),
      cover: text(Reflect.get(song, "cover")),
      durationMs: int(Reflect.get(song, "durationMs")) ?? 0,
      file: text(Reflect.get(song, "file")) ?? "",
      mimeType: text(Reflect.get(song, "mimeType")) ?? "audio/mpeg",
      title: text(Reflect.get(song, "title")) ?? "Untitled",
      track: int(Reflect.get(song, "track")),
      year: int(Reflect.get(song, "year")),
    })),
  } satisfies SampleManifest;
}

export function readManifest() {
  const file = new File(stagedFolder(), "manifest.json");
  if (!file.exists) {
    throw new Error("No sample library staged; run `scripts/sim.sh seed`.");
  }
  return decodeManifest(JSON.parse(file.textSync()));
}
