import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

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

export const replaceAlbumArtists = async ({
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
