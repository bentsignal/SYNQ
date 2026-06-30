import { useMemo } from "react";
import { ArtistType, PageType } from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/lib/image-utils";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

export const useArtistInfoQuery = (artistId: number) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select()
      .from(schema.artists)
      .where(eq(schema.artists.id, artistId)),
  );

  const artist = useMemo<ArtistType | null>(() => {
    const row = data?.[0] ?? null;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name ?? "",
      image: row.profileImage
        ? getImagePathFromHash(row.profileImage).pathToSmallImage
        : undefined,
      pageType: PageType.ARTIST,
    };
  }, [data]);

  return {
    artist,
    error,
    updatedAt,
    isEmpty: !artist,
  };
};
