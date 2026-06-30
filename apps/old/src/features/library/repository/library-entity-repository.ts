import { AlbumType, ArtistType, PageType } from "@/src/constants/Types";
import {
  getImagePathFromHash,
  saveCoverImage,
} from "@/src/features/images/repository/image-repository";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq, ne } from "drizzle-orm";

const assertUniqueArtistName = async (name: string) => {
  const existingArtist = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(eq(schema.artists.name, name))
    .limit(1);

  if (existingArtist.length > 0) {
    throw new Error("Artist already exists");
  }
};

const assertUniqueArtistNameForUpdate = async (
  artistId: number,
  name: string,
) => {
  const existingArtist = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(and(eq(schema.artists.name, name), ne(schema.artists.id, artistId)))
    .limit(1);

  if (existingArtist.length > 0) {
    throw new Error("Artist already exists");
  }
};

const assertUniquePlaylistName = async (name: string) => {
  const existingPlaylist = await db
    .select({ id: schema.playlists.id })
    .from(schema.playlists)
    .where(eq(schema.playlists.name, name))
    .limit(1);

  if (existingPlaylist.length > 0) {
    throw new Error("Playlist already exists");
  }
};

const assertUniquePlaylistNameForUpdate = async (
  playlistId: number,
  name: string,
) => {
  const existingPlaylist = await db
    .select({ id: schema.playlists.id })
    .from(schema.playlists)
    .where(
      and(
        eq(schema.playlists.name, name),
        ne(schema.playlists.id, playlistId),
      ),
    )
    .limit(1);

  if (existingPlaylist.length > 0) {
    throw new Error("Playlist already exists");
  }
};

const assertUniqueAlbumName = async (name: string) => {
  const existingAlbum = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(eq(schema.albums.name, name))
    .limit(1);

  if (existingAlbum.length > 0) {
    throw new Error("Album already exists");
  }
};

const assertUniqueAlbumNameForUpdate = async (
  albumId: number,
  name: string,
) => {
  const existingAlbum = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(and(eq(schema.albums.name, name), ne(schema.albums.id, albumId)))
    .limit(1);

  if (existingAlbum.length > 0) {
    throw new Error("Album already exists");
  }
};

export const LIBRARY_PLAYLIST_ID = 1;

export const createLibraryArtist = async (name: string, image?: string) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Artist name is required");
  }

  await assertUniqueArtistName(cleanName);

  const profileImage = await saveCoverImage(image);
  const createdArtist = await db
    .insert(schema.artists)
    .values({
      name: cleanName,
      profileImage,
    })
    .returning({ id: schema.artists.id });

  return {
    id: createdArtist[0].id,
    name: cleanName,
  };
};

export const updateLibraryArtist = async ({
  id,
  name,
  image,
}: {
  id: number;
  name?: string;
  image?: string;
}) => {
  const cleanName = name?.trim();
  const profileImage = await saveCoverImage(image);

  if (cleanName !== undefined && !cleanName) {
    throw new Error("Artist name is required");
  }

  if (cleanName !== undefined) {
    await assertUniqueArtistNameForUpdate(id, cleanName);
  }

  if (cleanName === undefined && profileImage === null) {
    return;
  }

  await db
    .update(schema.artists)
    .set({
      ...(cleanName !== undefined ? { name: cleanName } : {}),
      ...(profileImage !== null ? { profileImage } : {}),
    })
    .where(eq(schema.artists.id, id));
};

export const deleteLibraryArtist = async (id: number) => {
  await db.delete(schema.artistSongs).where(eq(schema.artistSongs.artistId, id));
  await db
    .delete(schema.artistsAlbums)
    .where(eq(schema.artistsAlbums.artistId, id));
  await db.delete(schema.artists).where(eq(schema.artists.id, id));
};

export const addArtistToLibraryAlbum = async (
  artistId: number,
  albumId: number,
) => {
  const exists = await isArtistOnLibraryAlbum(artistId, albumId);
  if (exists) {
    return;
  }

  await db.insert(schema.artistsAlbums).values({
    artistId,
    albumId,
  });
};

export const removeArtistFromLibraryAlbum = async (
  artistId: number,
  albumId: number,
) => {
  await db
    .delete(schema.artistsAlbums)
    .where(
      and(
        eq(schema.artistsAlbums.artistId, artistId),
        eq(schema.artistsAlbums.albumId, albumId),
      ),
    );
};

export const isArtistOnLibraryAlbum = async (
  artistId: number,
  albumId: number,
) => {
  const rows = await db
    .select({ id: schema.artistsAlbums.id })
    .from(schema.artistsAlbums)
    .where(
      and(
        eq(schema.artistsAlbums.artistId, artistId),
        eq(schema.artistsAlbums.albumId, albumId),
      ),
    )
    .limit(1);

  return rows.length > 0;
};

export const getLibraryArtistCoverPath = async (
  artistId: number,
  full: boolean = false,
) => {
  const rows = await db
    .select({ profileImage: schema.artists.profileImage })
    .from(schema.artists)
    .where(eq(schema.artists.id, artistId))
    .limit(1);

  const profileImage = rows[0]?.profileImage;
  if (!profileImage) {
    return null;
  }

  const paths = getImagePathFromHash(profileImage);
  return full ? paths.pathToFullImage : paths.pathToSmallImage;
};

export const getLibraryArtistsFromMetadata = async (value: string) => {
  const names = value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return [];
  }

  const existingArtists = await db.select().from(schema.artists);
  const artists: ArtistType[] = [];

  for (const name of names) {
    const existingArtist = existingArtists.find(
      (artist) => artist.name?.toLowerCase() === name.toLowerCase(),
    );

    if (existingArtist) {
      const imagePaths = existingArtist.profileImage
        ? getImagePathFromHash(existingArtist.profileImage)
        : null;
      artists.push({
        id: existingArtist.id,
        name: existingArtist.name ?? name,
        image: imagePaths?.pathToSmallImage,
        fullImage: imagePaths?.pathToFullImage,
      });
      continue;
    }

    artists.push(await createLibraryArtist(name));
  }

  return artists;
};

export const createLibraryPlaylist = async (name: string, image?: string) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Name is required");
  }

  await assertUniquePlaylistName(cleanName);

  const coverImage = await saveCoverImage(image);
  const createdPlaylist = await db
    .insert(schema.playlists)
    .values({
      name: cleanName,
      coverImage,
    })
    .returning({ id: schema.playlists.id });

  return {
    id: createdPlaylist[0].id,
    name: cleanName,
  };
};

export const updateLibraryPlaylist = async ({
  id,
  name,
  image,
}: {
  id: number;
  name?: string;
  image?: string;
}) => {
  const cleanName = name?.trim();
  const coverImage = await saveCoverImage(image);

  if (cleanName !== undefined && !cleanName) {
    throw new Error("Name is required");
  }

  if (cleanName !== undefined) {
    await assertUniquePlaylistNameForUpdate(id, cleanName);
  }

  if (cleanName === undefined && coverImage === null) {
    return;
  }

  await db
    .update(schema.playlists)
    .set({
      ...(cleanName !== undefined ? { name: cleanName } : {}),
      ...(coverImage !== null ? { coverImage } : {}),
    })
    .where(eq(schema.playlists.id, id));
};

export const deleteLibraryPlaylist = async (id: number) => {
  await db
    .delete(schema.playlistSongs)
    .where(eq(schema.playlistSongs.playlistId, id));
  await db.delete(schema.playlists).where(eq(schema.playlists.id, id));
};

export const addSongToLibraryPlaylist = async (
  playlistId: number,
  songId: number,
) => {
  const exists = await isSongInLibraryPlaylist(playlistId, songId);
  if (exists) {
    return;
  }

  await db.insert(schema.playlistSongs).values({
    playlistId,
    songId,
  });
};

export const removeSongFromLibraryPlaylist = async (
  playlistId: number,
  songId: number,
) => {
  await db
    .delete(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, playlistId),
        eq(schema.playlistSongs.songId, songId),
      ),
    );
};

export const removeSongFromAllLibraryPlaylists = async (songId: number) => {
  await db
    .delete(schema.playlistSongs)
    .where(eq(schema.playlistSongs.songId, songId));
};

export const isSongInLibraryPlaylist = async (
  playlistId: number,
  songId: number,
) => {
  const rows = await db
    .select({ id: schema.playlistSongs.id })
    .from(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, playlistId),
        eq(schema.playlistSongs.songId, songId),
      ),
    )
    .limit(1);

  return rows.length > 0;
};

export const getLibraryPlaylistCoverPath = async (
  playlistId: number,
  full: boolean = false,
) => {
  const rows = await db
    .select({ coverImage: schema.playlists.coverImage })
    .from(schema.playlists)
    .where(eq(schema.playlists.id, playlistId))
    .limit(1);

  const coverImage = rows[0]?.coverImage;
  if (!coverImage) {
    return null;
  }

  const paths = getImagePathFromHash(coverImage);
  return full ? paths.pathToFullImage : paths.pathToSmallImage;
};

export const createLibraryAlbum = async (
  name: string,
  year?: number,
  image?: string,
) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Album name is required");
  }

  await assertUniqueAlbumName(cleanName);

  const coverImage = await saveCoverImage(image);
  const createdAlbum = await db
    .insert(schema.albums)
    .values({
      name: cleanName,
      year,
      coverImage,
    })
    .returning({ id: schema.albums.id });

  return {
    id: createdAlbum[0].id,
    name: cleanName,
    year,
  };
};

export const updateLibraryAlbum = async ({
  id,
  name,
  year,
  image,
}: {
  id: number;
  name?: string;
  year?: number | null;
  image?: string;
}) => {
  const cleanName = name?.trim();
  const coverImage = await saveCoverImage(image);

  if (cleanName !== undefined && !cleanName) {
    throw new Error("Album name is required");
  }

  if (cleanName !== undefined) {
    await assertUniqueAlbumNameForUpdate(id, cleanName);
  }

  if (cleanName === undefined && year === undefined && coverImage === null) {
    return;
  }

  await db
    .update(schema.albums)
    .set({
      ...(cleanName !== undefined ? { name: cleanName } : {}),
      ...(year !== undefined ? { year } : {}),
      ...(coverImage !== null ? { coverImage } : {}),
    })
    .where(eq(schema.albums.id, id));
};

export const deleteLibraryAlbum = async (id: number) => {
  await db.delete(schema.albumSongs).where(eq(schema.albumSongs.albumId, id));
  await db
    .delete(schema.artistsAlbums)
    .where(eq(schema.artistsAlbums.albumId, id));
  await db.delete(schema.albums).where(eq(schema.albums.id, id));
};

export const getLibraryAlbumCoverPath = async (
  albumId: number,
  full: boolean = false,
) => {
  const rows = await db
    .select({ coverImage: schema.albums.coverImage })
    .from(schema.albums)
    .where(eq(schema.albums.id, albumId))
    .limit(1);

  const coverImage = rows[0]?.coverImage;
  if (!coverImage) {
    return null;
  }

  const paths = getImagePathFromHash(coverImage);
  return full ? paths.pathToFullImage : paths.pathToSmallImage;
};

export const getLibraryAlbumArtists = async (albumId: number) => {
  const rows = await db
    .select({ artist: schema.artists })
    .from(schema.artistsAlbums)
    .innerJoin(
      schema.artists,
      eq(schema.artistsAlbums.artistId, schema.artists.id),
    )
    .where(eq(schema.artistsAlbums.albumId, albumId));

  return rows.map(({ artist }) => {
    const imagePaths = artist.profileImage
      ? getImagePathFromHash(artist.profileImage)
      : null;

    return {
      id: artist.id,
      name: artist.name ?? "",
      image: imagePaths?.pathToSmallImage,
      fullImage: imagePaths?.pathToFullImage,
      pageType: PageType.EDIT,
    } satisfies ArtistType;
  });
};

export const getLibraryAlbumFromMetadata = async (
  value: string,
  year?: number,
  image?: string,
): Promise<AlbumType | null> => {
  const name = value.trim();
  if (!name) {
    return null;
  }

  const albums = await db.select().from(schema.albums);
  const existingAlbum = albums.find(
    (album) => album.name?.toLowerCase() === name.toLowerCase(),
  );

  if (existingAlbum) {
    const imagePaths = existingAlbum.coverImage
      ? getImagePathFromHash(existingAlbum.coverImage)
      : null;

    return {
      id: existingAlbum.id,
      name: existingAlbum.name ?? name,
      year: existingAlbum.year ?? undefined,
      image: imagePaths?.pathToSmallImage,
      fullImage: imagePaths?.pathToFullImage,
    } satisfies AlbumType;
  }

  return createLibraryAlbum(name, year, image);
};
