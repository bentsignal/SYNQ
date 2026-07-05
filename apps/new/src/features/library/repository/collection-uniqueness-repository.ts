import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import {
  assertUniqueCollectionNameWithDependencies,
  type UniqueCollectionNameParams,
} from "./collection-uniqueness-executor-repository";
import { buildUniqueCollectionNameFilter } from "./collection-uniqueness-filter-repository";

export const assertUniqueCollectionName = async ({
  excludeId,
  kind,
  name,
}: UniqueCollectionNameParams) => {
  await assertUniqueCollectionNameWithDependencies(
    { excludeId, kind, name },
    {
      hasMatchingAlbumName: async ({ excludeId, name }) => {
        const matchingAlbum = await db
          .select({ id: schema.albums.id })
          .from(schema.albums)
          .where(
            buildUniqueCollectionNameFilter({
              excludeId,
              idColumn: schema.albums.id,
              name,
              nameColumn: schema.albums.name,
            }),
          )
          .limit(1);

        return matchingAlbum.length > 0;
      },
      hasMatchingArtistName: async ({ excludeId, name }) => {
        const matchingArtist = await db
          .select({ id: schema.artists.id })
          .from(schema.artists)
          .where(
            buildUniqueCollectionNameFilter({
              excludeId,
              idColumn: schema.artists.id,
              name,
              nameColumn: schema.artists.name,
            }),
          )
          .limit(1);

        return matchingArtist.length > 0;
      },
      hasMatchingPlaylistName: async ({ excludeId, name }) => {
        const matchingPlaylist = await db
          .select({ id: schema.playlists.id })
          .from(schema.playlists)
          .where(
            buildUniqueCollectionNameFilter({
              excludeId,
              idColumn: schema.playlists.id,
              name,
              nameColumn: schema.playlists.name,
            }),
          )
          .limit(1);

        return matchingPlaylist.length > 0;
      },
    },
  );
};
