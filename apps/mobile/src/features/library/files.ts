import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import type { ArtworkKind, ArtworkRef } from "@synq/db";
import { artworkDir, artworkPath, setArtwork } from "@synq/db";
import { documentFile } from "@synq/db/expo";

import { writeLibrary } from "./queries";

/**
 * A folder inside `Documents/` from a stored relative path, joined by
 * segment (see `documentFile` in `@synq/db/expo`).
 */
export function documentDirectory(relativePath: string) {
  return new Directory(
    Paths.document,
    ...relativePath.split("/").filter(Boolean),
  );
}

/**
 * Removes the folders a delete reported (`deletePaths`), after its commit.
 * A folder that's already gone, or won't go, is left: the database no
 * longer points at it.
 */
export function deleteLibraryFolders(paths: readonly string[]) {
  for (const path of paths) {
    try {
      const folder = documentDirectory(path);
      if (folder.exists) folder.delete();
    } catch {
      // Orphaned files are harmless; the delete itself already happened.
    }
  }
}

/** 2.5.2's sizes: `cover_full.jpg` up to 1500 px, `cover_small.jpg` up to 200 px. */
const COVER_SIZES = { full: 1500, small: 200 } as const;

/** Square-crops and scales an image, then saves it as JPEG at `target`. */
async function saveCover(
  source: string,
  side: number,
  edge: number,
  target: File,
) {
  const context = ImageManipulator.manipulate(source);
  const size = Math.min(side, edge);
  const rendered = await context
    .resize({ height: size, width: size })
    .renderAsync();
  const saved = await rendered.saveAsync({
    compress: 0.85,
    format: SaveFormat.JPEG,
  });
  const file = new File(saved.uri);
  if (target.exists) target.delete();
  file.moveSync(target);
}

/**
 * Writes a picked photo (already cropped square by the picker) as the
 * entity's cover in both sizes, then records it, so the new artwork shows
 * everywhere at once (`artwork_version` changes).
 */
export async function writeArtwork({
  kind,
  id,
  uri,
  width,
}: {
  kind: ArtworkKind;
  id: number;
  /** The picked image's URI. */
  uri: string;
  /** Its width in pixels (the picker's crop is square). */
  width: number;
}) {
  const folder = documentDirectory(artworkDir(kind, id));
  if (!folder.exists) folder.create({ intermediates: true });
  await saveCover(
    uri,
    width,
    COVER_SIZES.full,
    new File(folder, "cover_full.jpg"),
  );
  await saveCover(
    uri,
    width,
    COVER_SIZES.small,
    new File(folder, "cover_small.jpg"),
  );
  writeLibrary((db) => setArtwork(db, { id, kind, present: true }));
}

/**
 * Gives an album with no cover a copy of a song's, as an import gives a new
 * album the first song's. The song's own files stay where they are. A cover
 * is a nicety here, so a failure leaves the album without one.
 */
export function copyCoverToAlbum(albumId: number, cover: ArtworkRef) {
  try {
    const folder = documentDirectory(artworkDir("album", albumId));
    if (!folder.exists) folder.create({ intermediates: true });
    for (const size of ["full", "small"] as const) {
      const target = new File(folder, `cover_${size}.jpg`);
      if (target.exists) target.delete();
      documentFile(artworkPath(cover, size)).copySync(target);
    }
    writeLibrary((db) =>
      setArtwork(db, { id: albumId, kind: "album", present: true }),
    );
  } catch {
    // The album shows its placeholder, and can be given a cover in Edit.
  }
}

/** Deletes an entity's cover files and records that it has none. */
export function removeArtwork(kind: ArtworkKind, id: number) {
  const folder = documentDirectory(artworkDir(kind, id));
  for (const name of ["cover_full.jpg", "cover_small.jpg"]) {
    const file = new File(folder, name);
    if (file.exists) file.delete();
  }
  writeLibrary((db) => setArtwork(db, { id, kind, present: false }));
}
