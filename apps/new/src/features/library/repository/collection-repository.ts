import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq, ne } from "drizzle-orm";

const normalizeName = (name: string) => name.trim();

const assertUniqueName = async ({
  entity,
  excludeId,
  name,
}: {
  entity: "album" | "artist" | "playlist";
  excludeId?: number;
  name: string;
}) => {
  const article = entity === "playlist" ? "A" : "An";

  switch (entity) {
    case "album": {
      const matchingAlbum = await db
        .select({ id: schema.albums.id })
        .from(schema.albums)
        .where(
          excludeId
            ? and(eq(schema.albums.name, name), ne(schema.albums.id, excludeId))
            : eq(schema.albums.name, name),
        )
        .limit(1);
      if (matchingAlbum.length > 0) {
        throw new Error(`${article} album with this name already exists.`);
      }
      return;
    }
    case "artist": {
      const matchingArtist = await db
        .select({ id: schema.artists.id })
        .from(schema.artists)
        .where(
          excludeId
            ? and(
                eq(schema.artists.name, name),
                ne(schema.artists.id, excludeId),
              )
            : eq(schema.artists.name, name),
        )
        .limit(1);
      if (matchingArtist.length > 0) {
        throw new Error(`${article} artist with this name already exists.`);
      }
      return;
    }
    case "playlist": {
      const matchingPlaylist = await db
        .select({ id: schema.playlists.id })
        .from(schema.playlists)
        .where(
          excludeId
            ? and(
                eq(schema.playlists.name, name),
                ne(schema.playlists.id, excludeId),
              )
            : eq(schema.playlists.name, name),
        )
        .limit(1);
      if (matchingPlaylist.length > 0) {
        throw new Error(`${article} playlist with this name already exists.`);
      }
    }
  }
};

export async function createAlbum({
  name,
  year,
}: {
  name: string;
  year?: number;
}) {
  const cleanName = normalizeName(name);

  if (!cleanName) {
    throw new Error("Album name is required.");
  }

  await assertUniqueName({ entity: "album", name: cleanName });

  const createdAlbum = await db
    .insert(schema.albums)
    .values({ name: cleanName, year })
    .returning({ id: schema.albums.id });

  const id = createdAlbum[0]?.id;

  if (!id) {
    throw new Error("Album could not be created.");
  }

  return {
    id,
    name: cleanName,
    year,
  };
}

export async function createArtist(name: string) {
  const cleanName = normalizeName(name);

  if (!cleanName) {
    throw new Error("Artist name is required.");
  }

  await assertUniqueName({ entity: "artist", name: cleanName });

  const createdArtist = await db
    .insert(schema.artists)
    .values({ name: cleanName })
    .returning({ id: schema.artists.id });

  const id = createdArtist[0]?.id;

  if (!id) {
    throw new Error("Artist could not be created.");
  }

  return {
    id,
    name: cleanName,
  };
}

export async function createPlaylist(name: string) {
  const cleanName = normalizeName(name);

  if (!cleanName) {
    throw new Error("Playlist name is required.");
  }

  await assertUniqueName({ entity: "playlist", name: cleanName });

  const createdPlaylist = await db
    .insert(schema.playlists)
    .values({ name: cleanName })
    .returning({ id: schema.playlists.id });

  const id = createdPlaylist[0]?.id;

  if (!id) {
    throw new Error("Playlist could not be created.");
  }

  return {
    id,
    name: cleanName,
  };
}

export async function updateAlbum({
  id,
  name,
  year,
}: {
  id: number;
  name: string;
  year?: number | null;
}) {
  const cleanName = normalizeName(name);

  if (!cleanName) {
    throw new Error("Album name is required.");
  }

  await assertUniqueName({ entity: "album", excludeId: id, name: cleanName });

  await db
    .update(schema.albums)
    .set({ name: cleanName, year })
    .where(eq(schema.albums.id, id));

  return {
    id,
    name: cleanName,
    year,
  };
}

export async function updateArtist({ id, name }: { id: number; name: string }) {
  const cleanName = normalizeName(name);

  if (!cleanName) {
    throw new Error("Artist name is required.");
  }

  await assertUniqueName({ entity: "artist", excludeId: id, name: cleanName });

  await db
    .update(schema.artists)
    .set({ name: cleanName })
    .where(eq(schema.artists.id, id));

  return {
    id,
    name: cleanName,
  };
}

export async function updatePlaylist({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const cleanName = normalizeName(name);

  if (!cleanName) {
    throw new Error("Playlist name is required.");
  }

  await assertUniqueName({
    entity: "playlist",
    excludeId: id,
    name: cleanName,
  });

  await db
    .update(schema.playlists)
    .set({ name: cleanName })
    .where(eq(schema.playlists.id, id));

  return {
    id,
    name: cleanName,
  };
}
