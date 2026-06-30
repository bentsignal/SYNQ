import { useMemo } from "react";
import { AlbumType, ArtistType, PageType } from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/lib/image-utils";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type AlbumInfoRow = {
  album: typeof schema.albums.$inferSelect;
  artist: typeof schema.artists.$inferSelect | null;
};

export const useAlbumInfoQuery = (albumId: number) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        album: schema.albums,
        artist: schema.artists,
      })
      .from(schema.albums)
      .leftJoin(
        schema.artistsAlbums,
        eq(schema.albums.id, schema.artistsAlbums.albumId),
      )
      .leftJoin(
        schema.artists,
        eq(schema.artistsAlbums.artistId, schema.artists.id),
      )
      .where(eq(schema.albums.id, albumId)),
  );

  const { album, artists } = useMemo(() => {
    const rows = (data ?? []) as AlbumInfoRow[];
    const firstAlbum = rows[0]?.album;

    if (!firstAlbum) {
      return {
        album: null,
        artists: [],
      };
    }

    const artistMap = new Map<number, ArtistType>();

    rows.forEach(({ artist }) => {
      if (artist) {
        artistMap.set(artist.id, {
          id: artist.id,
          name: artist.name ?? "",
          pageType: PageType.ALBUM,
        });
      }
    });

    return {
      album: {
        id: firstAlbum.id,
        name: firstAlbum.name ?? "",
        year: firstAlbum.year ?? undefined,
        image: firstAlbum.coverImage
          ? getImagePathFromHash(firstAlbum.coverImage).pathToSmallImage
          : undefined,
        pageType: PageType.ALBUM,
      } satisfies AlbumType,
      artists: Array.from(artistMap.values()),
    };
  }, [data]);

  return {
    album,
    artists,
    error,
    updatedAt,
    isEmpty: !album,
  };
};
