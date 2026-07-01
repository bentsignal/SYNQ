import { db } from "@synq/db";
import * as schema from "@synq/db/schema";

const normalizeName = (name: string) => name.trim();

const assertUniqueName = async ({
  entity,
  name,
}: {
  entity: "album" | "artist" | "playlist";
  name: string;
}) => {
  const lowerName = name.toLowerCase();
  const article = entity === "playlist" ? "A" : "An";

  switch (entity) {
    case "album": {
      const albums = await db.select({ name: schema.albums.name }).from(schema.albums);
      if (albums.some((album) => album.name?.toLowerCase() === lowerName)) {
        throw new Error(`${article} album with this name already exists.`);
      }
      return;
    }
    case "artist": {
      const artists = await db.select({ name: schema.artists.name }).from(schema.artists);
      if (artists.some((artist) => artist.name?.toLowerCase() === lowerName)) {
        throw new Error(`${article} artist with this name already exists.`);
      }
      return;
    }
    case "playlist": {
      const playlists = await db
        .select({ name: schema.playlists.name })
        .from(schema.playlists);
      if (
        playlists.some((playlist) => playlist.name?.toLowerCase() === lowerName)
      ) {
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
