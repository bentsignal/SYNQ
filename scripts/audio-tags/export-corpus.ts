/**
 * Runs SYNQ's own tag code over every corpus file, the way an export does, with
 * Node standing in for `spliceFile` and the file handle. Writes the copies and
 * `_results.json` for verify.py, and what import would read to `_imports.json`.
 *
 *   node export-corpus.ts <corpus> <out> <expected.json>
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { SongTags } from "../../apps/mobile/src/features/media/song-tags.ts";
import { bytesSource } from "../../apps/mobile/src/features/media/byte-source.ts";
import {
  planRetag,
  readEmbeddedTags,
  sniffAudio,
} from "../../apps/mobile/src/features/media/retag.ts";

const [corpus = "", out = "", expectedPath = ""] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const expected = JSON.parse(readFileSync(expectedPath, "utf8")) as {
  album: string;
  albumArtist: string;
  artists: string[];
  title: string;
  track: number;
  year: number;
};
const tags: SongTags = {
  album: expected.album,
  albumArtists: [expected.albumArtist],
  artists: expected.artists,
  artwork: new Uint8Array(readFileSync(join(corpus, "_cover.jpg"))),
  title: expected.title,
  track: expected.track,
  year: expected.year,
};

const results: Record<string, unknown> = {};
const imports: Record<string, unknown> = {};
for (const name of readdirSync(corpus)) {
  if (name.startsWith("_")) continue;
  const before = new Uint8Array(readFileSync(join(corpus, name)));
  const source = bytesSource(before);
  const format = sniffAudio(source, name);
  const read = readEmbeddedTags(source, name);
  imports[name] = {
    ...read?.tags,
    artworkBytes: read?.artwork?.length ?? 0,
    format,
  };
  const plan = planRetag(source, name, tags);
  if (plan === null) {
    writeFileSync(join(out, name), before);
    results[name] = { format: format ?? "unknown", tagged: false };
    continue;
  }
  const size = plan.head.length + before.length - plan.skip;
  const end = plan.patches.reduce(
    (top, patch) => Math.max(top, patch.offset + patch.bytes.length),
    size,
  );
  const copy = new Uint8Array(end);
  copy.set(plan.head);
  copy.set(before.subarray(plan.skip), plan.head.length);
  for (const patch of plan.patches) copy.set(patch.bytes, patch.offset);
  writeFileSync(join(out, name), copy);
  results[name] = { format: plan.format, tagged: true };
}
writeFileSync(join(out, "_results.json"), JSON.stringify(results, null, 2));
writeFileSync(join(out, "_imports.json"), JSON.stringify(imports, null, 2));
console.log(`exported ${String(Object.keys(results).length)} files to ${out}`);
