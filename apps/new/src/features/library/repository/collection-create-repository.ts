import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import {
  createAlbumWithDependencies,
  createArtistWithDependencies,
  createPlaylistWithDependencies,
} from "./collection-create-executor-repository";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";

const collectionCreateDependencies = {
  assertUniqueCollectionName,
  insertAlbumRow: async ({
    coverImage,
    name,
    year,
  }: {
    coverImage: string | null;
    name: string;
    year?: number;
  }) => {
    const createdAlbum = await db
      .insert(schema.albums)
      .values({
        coverImage,
        name,
        year,
      })
      .returning({ id: schema.albums.id });

    return createdAlbum[0]?.id ?? null;
  },
  insertArtistRow: async ({
    name,
    profileImage,
  }: {
    name: string;
    profileImage?: string | null;
  }) => {
    const createdArtist = await db
      .insert(schema.artists)
      .values({ name, profileImage })
      .returning({ id: schema.artists.id });

    return createdArtist[0]?.id ?? null;
  },
  insertPlaylistRow: async ({
    coverImage,
    name,
  }: {
    coverImage: string | null;
    name: string;
  }) => {
    const createdPlaylist = await db
      .insert(schema.playlists)
      .values({
        coverImage,
        name,
      })
      .returning({ id: schema.playlists.id });

    return createdPlaylist[0]?.id ?? null;
  },
  saveCoverImage,
};

export async function createAlbum({
  coverImage,
  name,
  year,
}: {
  coverImage?: string | null;
  name: string;
  year?: number;
}) {
  return createAlbumWithDependencies(
    {
      coverImage,
      name,
      year,
    },
    collectionCreateDependencies,
  );
}

export async function createArtist(name: string) {
  return createArtistWithDependencies({ name }, collectionCreateDependencies);
}

export async function createArtistWithImage({
  name,
  profileImage,
}: {
  name: string;
  profileImage?: string | null;
}) {
  return createArtistWithDependencies(
    {
      name,
      profileImage,
    },
    collectionCreateDependencies,
  );
}

export async function createPlaylist({
  coverImage,
  name,
}: {
  coverImage?: string | null;
  name: string;
}) {
  return createPlaylistWithDependencies(
    {
      coverImage,
      name,
    },
    collectionCreateDependencies,
  );
}
