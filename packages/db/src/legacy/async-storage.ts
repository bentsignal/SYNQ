/**
 * Reads 2.5.2's AsyncStorage (`@react-native-async-storage/async-storage`
 * 1.23.1, iOS) straight from disk, since 3.0 doesn't ship that module.
 *
 * Verified against `ios/RNCAsyncStorage.mm` 1.23.1 and React Native's
 * `RCTMD5Hash`:
 * - The directory is `Library/Application Support/{bundleId}/RCTAsyncLocalStorage_V1`.
 * - `manifest.json` is a JSON object of key → value string. A value longer
 *   than 1024 UTF-16 units is stored instead in a sibling file named by the
 *   lowercase hex MD5 of the key's UTF-8 bytes, and the manifest holds `null`.
 * - A `null` whose file is missing means the key is absent (the module drops
 *   it the same way).
 */
import type { LegacyTextFileSystem } from "./types.ts";

/**
 * MD5 file names of every key 2.5.2 wrote, precomputed so the app needs no
 * MD5 implementation (a test checks them against `node:crypto`).
 */
export const LEGACY_ASYNC_STORAGE_KEY_FILES: Readonly<Record<string, string>> = {
  theme: "f484570d7cf557020e11ace406901b10",
  haptic: "3c434c2d01b9818524ee50aa9578c458",
  shuffle: "644c45fc2b003bf415a3fb655412508d",
  loop: "e48b981fb62db33b98a27fc6cf8bf40a",
  queue: "a9d1cbf71942327e98b40cf5ef38a960",
  lastTrackIndex: "d8093b774e1dc420099b2113369b2396",
  position: "4757fe07fd492a8be0ea6a760d683d6e",
  sourceType: "5ab77627345a0347f34da97a041920c9",
  sourceId: "52195dae0174459c5f066fa0df053c26",
  expiration: "018e77635d40709feb0c09c6fb84ee00",
  playAd: "b2d4b8dd92cf62389a453a9f7fd11059",
  timePlayed: "aeedbc966aeba69fb12decb7668c9be2",
  addOffset: "c9651e74664e1bf4e1d624336a87071b",
  importCount: "b785de90f4f8806001b4ebb2a0eed0e1",
  reviewAlreadyRequested: "8056e1ddb4307711708e7775407299a8",
  exportNumber: "a794eb9bf5a39e32657effbe770924e8",
  dbVersion: "2d85ebe33b5f7825f69013d14eadb759",
  allowAnalytics: "8c7e0acd3b46c3797ded0b9ab21b730c",
};

/** `RCTAsyncLocalStorage_V1`, relative to `Library/Application Support/{bundleId}/`. */
export const LEGACY_ASYNC_STORAGE_DIR_NAME = "RCTAsyncLocalStorage_V1";

export interface LegacyAsyncStorage {
  /** Every readable key → value string. */
  values: Record<string, string>;
  /** Keys or files that couldn't be read, for the import report. */
  problems: string[];
}

/**
 * Parses the AsyncStorage directory. Returns null when there is no manifest
 * (a fresh install, or the user never changed a setting); never throws for
 * malformed content, because preferences must not block a library import.
 */
export async function readLegacyAsyncStorage(
  dir: string,
  fs: LegacyTextFileSystem,
): Promise<LegacyAsyncStorage | null> {
  const base = dir.replace(/\/+$/, "");
  let manifestText: string | null;
  try {
    manifestText = await fs.readText(`${base}/manifest.json`);
  } catch (error) {
    return { values: {}, problems: [`manifest.json unreadable: ${String(error)}`] };
  }
  if (manifestText === null) return null;

  let manifest: unknown;
  try {
    manifest = JSON.parse(manifestText);
  } catch {
    return { values: {}, problems: ["manifest.json is not valid JSON"] };
  }
  if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) {
    return { values: {}, problems: ["manifest.json is not an object"] };
  }

  const values: Record<string, string> = {};
  const problems: string[] = [];
  for (const [key, value] of Object.entries(manifest as Record<string, unknown>)) {
    if (typeof value === "string") {
      values[key] = value;
    } else if (value === null) {
      const fileName = LEGACY_ASYNC_STORAGE_KEY_FILES[key];
      if (!fileName) {
        problems.push(`${key}: stored out of line under an unknown key`);
        continue;
      }
      try {
        const text = await fs.readText(`${base}/${fileName}`);
        if (text !== null) values[key] = text;
      } catch (error) {
        problems.push(`${key}: value file unreadable: ${String(error)}`);
      }
    } else {
      problems.push(`${key}: unexpected ${typeof value} in manifest`);
    }
  }
  return { values, problems };
}
