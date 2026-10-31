import { Directory, File, Paths } from "expo-file-system";

import type { NewSongInput } from "@synq/db";
import { addSongs, setArtwork } from "@synq/db";
import { documentFile } from "@synq/db/expo";

import { writeLibrary } from "~/features/library/queries";

/**
 * Development builds only: a few small tagged songs with covers (and a
 * file name with `#`), from `apps/mobile/dev/player-sample`, for testing
 * playback. `push.sh` there copies them into the simulator, then
 * `synqDev.seedPlayer()` imports them as the library would. `fillers`
 * adds that many more copies (titled "Filler N") for long queues.
 */
const SAMPLE_DIR = "dev-player-sample";

interface SampleSong {
  file: string;
  title: string;
  artists: string;
  album: string | null;
  year: number | null;
  track: number | null;
  durationMs: number;
  cover: string | null;
}

function sampleSongs(text: string) {
  try {
    const songs = songsField(JSON.parse(text));
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Development only: the manifest is committed next to the files it describes.
    return Array.isArray(songs) ? (songs as SampleSong[]) : [];
  } catch {
    return [];
  }
}

function songsField(manifest: unknown) {
  return typeof manifest === "object" && manifest !== null
    ? asUnknown(Reflect.get(manifest, "songs"))
    : undefined;
}

function asUnknown(value: unknown) {
  return value;
}

async function copyCover(sample: Directory, cover: string, dir: string) {
  const target = new Directory(Paths.document, ...dir.split("/"));
  target.create({ idempotent: true, intermediates: true });
  await Promise.all(
    (["full", "small"] as const).map((size) => {
      const file = new File(target, `cover_${size}.jpg`);
      if (file.exists) file.delete();
      return new File(sample, `${cover}_${size}.jpg`).copy(file);
    }),
  );
}

async function importSample(
  sample: Directory,
  song: SampleSong,
  title = song.title,
) {
  const input = {
    album: song.album,
    artists: song.artists,
    durationMs: song.durationMs,
    fileName: song.file,
    hasArtwork: song.cover !== null,
    mimeType: "audio/mp4",
    title,
    track: song.track,
    year: song.year,
  } satisfies NewSongInput;
  const [added] = writeLibrary((db) => addSongs(db, [input]));
  if (added === undefined) return null;
  const audio = documentFile(added.filePath);
  audio.parentDirectory.create({ idempotent: true, intermediates: true });
  await new File(sample, song.file).copy(audio);
  const target = added.artworkTarget;
  if (target !== null && song.cover !== null) {
    await copyCover(sample, song.cover, target.dir);
    writeLibrary((db) =>
      setArtwork(db, { id: target.id, kind: target.kind, present: true }),
    );
  }
  return added.id;
}

/** Imports the pushed sample songs; returns their ids. */
export async function seedPlayer({ fillers = 0 }: { fillers?: number } = {}) {
  const sample = new Directory(Paths.document, SAMPLE_DIR);
  const manifest = new File(sample, "manifest.json");
  if (!manifest.exists) {
    throw new Error("Run apps/mobile/dev/player-sample/push.sh first.");
  }
  const songs = sampleSongs(await manifest.text());
  const imports = Array.from({ length: songs.length + fillers }, (_, i) => {
    const song = songs[i % songs.length];
    if (song === undefined) return Promise.resolve(null);
    const title =
      i < songs.length ? song.title : `Filler ${i - songs.length + 1}`;
    return importSample(sample, song, title);
  });
  const ids = await Promise.all(imports);
  return ids.filter((id) => id !== null);
}
