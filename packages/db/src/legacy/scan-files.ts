/**
 * Looks at the legacy folders (before the import transaction opens, since
 * file access may be async) to find each song's audio file and which
 * entities have cover files. Nothing is written or moved.
 */
import type { ArtworkKind } from "../library/artwork.ts";
import type { LegacyFileSystem, LegacyImportWarning } from "./types.ts";

const FOLDERS: Record<ArtworkKind, string> = {
  song: "library",
  album: "albums",
  artist: "artists",
  playlist: "playlists",
};

const COVER_FULL = "cover_full.jpg";
const COVER_SMALL = "cover_small.jpg";

/** Files in a song folder that are never its audio. */
function isNonAudio(name: string): boolean {
  return name === COVER_FULL || name === COVER_SMALL || name.startsWith("cover_temp.") || name.startsWith(".");
}

export interface FolderInfo {
  entries: string[];
  /** Cover mtime (ms) if `cover_full.jpg` or `cover_small.jpg` exists; 1 when the mtime is unknown. */
  artworkVersion: number | null;
  partialArtwork: boolean;
}

export type FolderScan = Record<ArtworkKind, Map<number, FolderInfo>>;

export async function scanFolders(fs: LegacyFileSystem, root: string): Promise<FolderScan> {
  const scan = { song: new Map(), album: new Map(), artist: new Map(), playlist: new Map() } as FolderScan;
  for (const kind of Object.keys(FOLDERS) as ArtworkKind[]) {
    const base = `${root}/${FOLDERS[kind]}`;
    for (const name of await fs.list(base)) {
      if (!/^\d+$/.test(name)) continue;
      const id = Number(name);
      const dir = `${base}/${name}`;
      const entries = await fs.list(dir);
      const hasFull = entries.includes(COVER_FULL);
      const hasSmall = entries.includes(COVER_SMALL);
      let artworkVersion: number | null = null;
      if (hasFull || hasSmall) {
        const stat = await fs.stat(`${dir}/${hasFull ? COVER_FULL : COVER_SMALL}`);
        artworkVersion = stat?.modifiedMs ? Math.max(1, Math.round(stat.modifiedMs)) : 1;
      }
      scan[kind].set(id, { entries, artworkVersion, partialArtwork: hasFull !== hasSmall });
    }
  }
  return scan;
}

export interface ResolvedAudio {
  /** Relative to the legacy root (and so to `Documents/` after an upgrade). */
  filePath: string | null;
  found: boolean;
  recovered: boolean;
}

/**
 * The song's audio file: `library/{id}/{fileName}` when it exists (matched
 * Unicode-normalization-insensitively, using the on-disk spelling); else the
 * folder's only non-cover file, which covers 2.5.2's empty-`fileName` bug
 * (`song.audio/mpeg`) and renamed files; else the recorded path, kept so a
 * user who restores the file via the Files app gets the song back.
 */
export function resolveAudio(songId: number, fileName: string | null, folder: FolderInfo | undefined): ResolvedAudio {
  const dir = `library/${songId}`;
  const entries = folder?.entries ?? [];
  const usable = fileName !== null && fileName !== "" && !fileName.includes("/");
  if (usable) {
    const wanted = fileName.normalize("NFC");
    const onDisk = entries.find((entry) => entry.normalize("NFC") === wanted);
    if (onDisk) return { filePath: `${dir}/${onDisk}`, found: true, recovered: false };
  }
  const candidates = entries.filter((entry) => !isNonAudio(entry));
  if (candidates.length === 1) return { filePath: `${dir}/${candidates[0]}`, found: true, recovered: true };
  return { filePath: usable ? `${dir}/${fileName}` : null, found: false, recovered: false };
}

export function orphanFolderWarning(scan: FolderScan, known: Record<ArtworkKind, ReadonlySet<number>>): LegacyImportWarning | null {
  const orphans: string[] = [];
  for (const kind of Object.keys(FOLDERS) as ArtworkKind[]) {
    for (const id of scan[kind].keys()) if (!known[kind].has(id)) orphans.push(`${FOLDERS[kind]}/${id}`);
  }
  if (orphans.length === 0) return null;
  return {
    code: "orphan-folders",
    message: `Folders without a matching row (left in place): ${orphans.sort().join(", ")}`,
  };
}
