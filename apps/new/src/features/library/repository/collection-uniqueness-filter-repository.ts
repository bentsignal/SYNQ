import * as schema from "@synq/db/schema";
import { and, eq, ne } from "drizzle-orm";

type CollectionIdColumn =
  | typeof schema.albums.id
  | typeof schema.artists.id
  | typeof schema.playlists.id;

type CollectionNameColumn =
  | typeof schema.albums.name
  | typeof schema.artists.name
  | typeof schema.playlists.name;

export const buildUniqueCollectionNameFilter = ({
  excludeId,
  idColumn,
  name,
  nameColumn,
}: {
  excludeId?: number;
  idColumn: CollectionIdColumn;
  name: string;
  nameColumn: CollectionNameColumn;
}) =>
  excludeId
    ? and(eq(nameColumn, name), ne(idColumn, excludeId))
    : eq(nameColumn, name);
