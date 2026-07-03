import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq, ne } from "drizzle-orm";
import {
  assertUniqueCollectionNameWithDependencies,
  type UniqueCollectionNameParams,
} from "./collection-uniqueness-executor-repository";

const buildUniqueNameFilter = ({
  excludeId,
  idColumn,
  name,
  nameColumn,
}: {
  excludeId?: number;
  idColumn:
    | typeof schema.albums.id
    | typeof schema.artists.id
    | typeof schema.playlists.id;
  name: string;
  nameColumn:
    | typeof schema.albums.name
    | typeof schema.artists.name
    | typeof schema.playlists.name;
}) =>
  excludeId
    ? and(eq(nameColumn, name), ne(idColumn, excludeId))
    : eq(nameColumn, name);

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
            buildUniqueNameFilter({
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
            buildUniqueNameFilter({
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
            buildUniqueNameFilter({
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
