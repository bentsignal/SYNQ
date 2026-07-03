import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { assertCollectionName } from "../services/collection-metadata-service";
import { systemPlaylistId } from "../services/library-playlist-constants-service";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";

const unknownArtistLabels = new Set(["", "unknown", "unknown artist"]);

const normalizeArtistName = (name: string) => name.trim();

const splitArtistNames = (value: string) =>
  value
    .split(",")
    .map(normalizeArtistName)
    .filter((name) => !unknownArtistLabels.has(name.toLowerCase()));

const ensureArtist = async (name: string) => {
  const cleanName = normalizeArtistName(name);
  const existing = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(eq(schema.artists.name, cleanName))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(schema.artists)
    .values({ name: cleanName })
    .returning({ id: schema.artists.id });

  return inserted[0].id;
};

const replaceAlbumArtists = async ({
  albumId,
  artistNames,
}: {
  albumId: number;
  artistNames: string;
}) => {
  const artistIds = new Set<number>();

  for (const artistName of splitArtistNames(artistNames)) {
    artistIds.add(await ensureArtist(artistName));
  }

  await db
    .delete(schema.artistsAlbums)
    .where(eq(schema.artistsAlbums.albumId, albumId));

  if (artistIds.size === 0) {
    return;
  }

  await db.insert(schema.artistsAlbums).values(
    Array.from(artistIds).map((artistId) => ({
      albumId,
      artistId,
    })),
  );
};

export async function updateAlbum({
  artistNames,
  coverImage,
  id,
  name,
  year,
}: {
  artistNames?: string;
  coverImage?: string | null;
  id: number;
  name: string;
  year?: number | null;
}) {
  const cleanName = assertCollectionName({ kind: "album", name });

  await assertUniqueCollectionName({
    excludeId: id,
    kind: "album",
    name: cleanName,
  });

  await db
    .update(schema.albums)
    .set({
      ...(coverImage !== undefined
        ? { coverImage: await saveCoverImage(coverImage) }
        : {}),
      name: cleanName,
      year,
    })
    .where(eq(schema.albums.id, id));

  if (artistNames !== undefined) {
    await replaceAlbumArtists({ albumId: id, artistNames });
  }

  return {
    id,
    name: cleanName,
    year,
  };
}

export async function updateArtist({
  id,
  name,
  profileImage,
}: {
  id: number;
  name: string;
  profileImage?: string | null;
}) {
  const cleanName = assertCollectionName({ kind: "artist", name });

  await assertUniqueCollectionName({
    excludeId: id,
    kind: "artist",
    name: cleanName,
  });

  await db
    .update(schema.artists)
    .set({
      ...(profileImage !== undefined
        ? { profileImage: await saveCoverImage(profileImage) }
        : {}),
      name: cleanName,
    })
    .where(eq(schema.artists.id, id));

  return {
    id,
    name: cleanName,
  };
}

export async function updatePlaylist({
  coverImage,
  id,
  name,
}: {
  coverImage?: string | null;
  id: number;
  name: string;
}) {
  if (id === systemPlaylistId) {
    throw new Error("This system playlist cannot be edited.");
  }

  const cleanName = assertCollectionName({ kind: "playlist", name });

  await assertUniqueCollectionName({
    excludeId: id,
    kind: "playlist",
    name: cleanName,
  });

  await db
    .update(schema.playlists)
    .set({
      ...(coverImage !== undefined
        ? { coverImage: await saveCoverImage(coverImage) }
        : {}),
      name: cleanName,
    })
    .where(eq(schema.playlists.id, id));

  return {
    id,
    name: cleanName,
  };
}
