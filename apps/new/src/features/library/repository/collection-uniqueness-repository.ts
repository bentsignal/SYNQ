import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq, ne } from "drizzle-orm";
import {
  getCollectionDuplicateNameMessage,
  type CollectionMetadataKind,
} from "../services/collection-metadata-service";

type UniqueCollectionNameParams = {
  excludeId?: number;
  kind: CollectionMetadataKind;
  name: string;
};

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
  switch (kind) {
    case "album": {
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

      if (matchingAlbum.length > 0) {
        throw new Error(getCollectionDuplicateNameMessage(kind));
      }

      return;
    }
    case "artist": {
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

      if (matchingArtist.length > 0) {
        throw new Error(getCollectionDuplicateNameMessage(kind));
      }

      return;
    }
    case "playlist": {
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

      if (matchingPlaylist.length > 0) {
        throw new Error(getCollectionDuplicateNameMessage(kind));
      }
    }
  }
};
