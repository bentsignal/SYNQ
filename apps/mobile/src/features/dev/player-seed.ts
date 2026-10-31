import type { NewSongInput } from "@synq/db";
import { Directory, File, Paths } from "expo-file-system";
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
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Development only: the manifest is committed next to the files it describes.
  const { songs } = JSON.parse(text) as { songs: SampleSong[] };
  return songs;
}

async function copyCover(sample: Directory, cover: string, dir: string) {
  const target = new Directory(Paths.document, ...dir.split("/"));
  target.create({ idempotent: true, intermediates: true });
  for (const size of ["full", "small"] as const) {
    const file = new File(target, `cover_${size}.jpg`);
    if (file.exists) file.delete();
    await new File(sample, `${cover}_${size}.jpg`).copy(file);
  }
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
  const ids = new Array<number>();
  for (let i = 0; i < songs.length + fillers; i += 1) {
    const song = songs[i % songs.length];
    if (song === undefined) break;
    const title =
      i < songs.length ? song.title : `Filler ${i - songs.length + 1}`;
    const id = await importSample(sample, song, title);
    if (id !== null) ids.push(id);
  }
  return ids;
}
