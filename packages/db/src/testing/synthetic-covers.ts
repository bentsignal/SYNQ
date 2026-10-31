import { mkdirSync, utimesSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { COVER_MTIMES } from "./synthetic-constants.ts";

export function writeCovers(
  documents: string,
  audioFiles: readonly (readonly [dir: string, name: string])[],
  ids: {
    s3: number;
    s6: number;
    flowerBoy: number;
    compilation: number;
    lemonade: number;
    bts: number;
    isolation: number;
    tyler: number;
    roadTrip: number;
  },
) {
  const { s3, s6, flowerBoy, compilation, lemonade, bts, isolation, tyler } =
    ids;
  const { roadTrip } = ids;
  // Covers. getAlbumCover/getPlaylistCover also created empty folders for anything displayed.
  function cover(
    dir: string,
    mtime: number,
    sizes: readonly ("full" | "small")[] = ["full", "small"],
  ) {
    mkdirSync(join(documents, dir), { recursive: true });
    for (const size of sizes) {
      const path = join(documents, dir, `cover_${size}.jpg`);
      writeFileSync(path, `jpeg ${dir} ${size}`);
      utimesSync(path, mtime, mtime);
    }
  }
  cover(`library/${s3}`, COVER_MTIMES.song3);
  cover(`library/${s6}`, COVER_MTIMES.song6);
  cover(`albums/${flowerBoy}`, COVER_MTIMES.album1);
  cover(`albums/${compilation}`, COVER_MTIMES.album6);
  cover(`albums/${lemonade}`, COVER_MTIMES.album4, ["small"]);
  cover(`artists/${bts}`, COVER_MTIMES.artist3);
  cover("playlists/2", COVER_MTIMES.playlist2);
  cover(`playlists/${roadTrip}`, COVER_MTIMES.playlist3);
  for (const dir of [
    `albums/${isolation}`,
    "albums/77",
    "playlists/1",
    `artists/${tyler}`,
  ]) {
    mkdirSync(join(documents, dir), { recursive: true });
  }
  for (const [dir, name] of audioFiles) {
    mkdirSync(join(documents, dir), { recursive: true });
    writeFileSync(join(documents, dir, name), `audio ${dir}/${name}`);
  }
}
