/** The ids and files a merge plan takes up, and never one that's in use. */
import type { ArtworkKind } from "../library/artwork.ts";
import type { PathIndex } from "./file-index.ts";
import { artworkDir, artworkPath } from "../library/artwork.ts";

export interface MergeFileMove {
  from: string;
  to: string;
}

export interface MergeIds {
  songs: number;
  artists: number;
  albums: number;
  playlists: number;
}

interface WithCovers {
  id: number;
  artworkVersion: number | null;
}

const COVER_SIZES = ["full", "small"] as const;

function lastSegment(path: string) {
  return path.slice(path.lastIndexOf("/") + 1);
}

export function songFileIn(id: number, source: string) {
  return `${artworkDir("song", id)}/${lastSegment(source)}`;
}

export class PlanFiles {
  readonly moves = new Array<MergeFileMove>();
  /** Files added to folders that already exist. */
  readonly addedFiles = new Array<string>();
  /** Folders that don't exist yet, whose contents are all this merge's. */
  readonly newFolders = new Set<string>();
  /** Existing rows given covers. */
  readonly artworkFills = new Array<{ kind: ArtworkKind; id: number }>();
  readonly ids: MergeIds;
  readonly #fs: PathIndex;
  readonly #targets = new Set<string>();
  readonly #filled = new Set<string>();

  constructor(fs: PathIndex, ids: MergeIds) {
    this.#fs = fs;
    this.ids = ids;
  }

  /** A fresh id, past any folder a failed delete or restore left behind. */
  allocate(table: keyof MergeIds, kind: ArtworkKind) {
    do this.ids[table] += 1;
    while (this.#fs.exists("library", artworkDir(kind, this.ids[table])));
    this.newFolders.add(artworkDir(kind, this.ids[table]));
    return this.ids[table];
  }

  move(from: string, to: string) {
    if (this.#targets.has(to)) return;
    this.#targets.add(to);
    this.moves.push({ from, to });
  }

  /** Moves a file into an existing row's folder, which may not exist yet. */
  #moveIntoExisting(folder: string, from: string, to: string) {
    if (this.#fs.exists("library", folder)) this.addedFiles.push(to);
    else this.newFolders.add(folder);
    this.move(from, to);
  }

  #covers(kind: ArtworkKind, row: WithCovers) {
    if (row.artworkVersion === null) return [];
    return COVER_SIZES.filter((size) =>
      this.#fs.exists("backup", artworkPath({ id: row.id, kind }, size)),
    );
  }

  /** Moves a backup row's covers to its new id; returns the version it gets. */
  newCovers(kind: ArtworkKind, row: WithCovers, id: number) {
    const sizes = this.#covers(kind, row);
    for (const size of sizes) {
      this.move(
        artworkPath({ id: row.id, kind }, size),
        artworkPath({ id, kind }, size),
      );
    }
    return sizes.length === 0 ? null : row.artworkVersion;
  }

  /**
   * Gives an existing row the backup's covers, if it has none and no cover
   * file is in the way. Returns whether it did.
   */
  fillCovers(kind: ArtworkKind, row: WithCovers, existing: WithCovers) {
    const key = `${kind}:${String(existing.id)}`;
    if (existing.artworkVersion !== null || this.#filled.has(key)) return false;
    const sizes = this.#covers(kind, row);
    const inTheWay = COVER_SIZES.some((size) =>
      this.#fs.exists("library", artworkPath({ id: existing.id, kind }, size)),
    );
    if (sizes.length === 0 || inTheWay) return false;
    this.#filled.add(key);
    for (const size of sizes) {
      this.#moveIntoExisting(
        artworkDir(kind, existing.id),
        artworkPath({ id: row.id, kind }, size),
        artworkPath({ id: existing.id, kind }, size),
      );
    }
    this.artworkFills.push({ id: existing.id, kind });
    return true;
  }

  /** Gives a song missing its file the backup's; returns where it'll be, if it can. */
  fillAudio(songId: number, source: string) {
    const to = songFileIn(songId, source);
    if (this.#fs.exists("library", to)) return null;
    this.#moveIntoExisting(artworkDir("song", songId), source, to);
    return to;
  }
}
