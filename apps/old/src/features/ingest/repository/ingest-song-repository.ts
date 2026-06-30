import {
  getAudioDurationFromFile,
  getMetadataFromFile,
  getTrackNumberFromString,
} from "@synq/audio";
import { db } from "@synq/db";
import {
  albums,
  albumSongs,
  artists,
  artistSongs,
  songs,
} from "@synq/db/schema";
import { eq, inArray } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { DocumentPickerAsset } from "expo-document-picker";
import { saveCoverImage } from "@/src/features/images/repository/image-repository";

export const createIngestedSongFromAsset = async (
  asset: DocumentPickerAsset,
) => {
  const metadata = await getMetadataFromFile(asset.uri);
  const duration = await getAudioDurationFromFile(asset.uri);
  const coverImageHash = await saveCoverImage(metadata.artwork);
  const { strippedValue: songTitle } = getTrackNumberFromString(
    metadata.name ?? asset.name,
  );
  const insertResult = await db.insert(songs).values({
    title: songTitle,
    duration,
    fileType: asset.mimeType ?? null,
    pathToFile: asset.uri,
    originalFileName: asset.name,
    coverImage: coverImageHash,
  });
  const songId = insertResult.lastInsertRowId;
  await storeArtistsForNewSong(songId, metadata.artist);
  await storeAlbumsForNewSong(songId, metadata.album, coverImageHash);
  // TODO: store artists for new album
  await saveSongSnapshot(songId);
  await db
    .update(songs)
    .set({ ingestComplete: 1 })
    .where(eq(songs.id, songId));
};

export const digest = createIngestedSongFromAsset;

const storeArtistsForNewSong = async (
  songId: number,
  artistsInMetadata?: string,
) => {
  if (!artistsInMetadata) return;
  const listOfArtistsInMetadata = artistsInMetadata
    .split(",")
    .map((artist) => artist.trim())
    .filter((artist) => artist !== "");
  const existingArtists = await db
    .select({ name: artists.name })
    .from(artists)
    .where(inArray(artists.name, listOfArtistsInMetadata));
  const newArtists = listOfArtistsInMetadata.filter(
    (artist) =>
      !existingArtists.some((existingArtist) => existingArtist.name === artist),
  );
  const newArtistsIds = await Promise.all(
    newArtists.map(async (artist) => {
      const newArtist = await db
        .insert(artists)
        .values({ name: artist })
        .returning({ id: artists.id });
      return newArtist[0].id;
    }),
  );
  await db
    .insert(artistSongs)
    .values(newArtistsIds.map((artistId) => ({ artistId, songId })));
};

const storeAlbumsForNewSong = async (
  songId: number,
  albumsInMetadata?: string,
  coverImage?: string | null,
) => {
  if (!albumsInMetadata) return;
  const listOfAlbumsInMetadata = albumsInMetadata
    .split(",")
    .map((album) => album.trim())
    .filter((album) => album !== "");
  const existingAlbums = await db
    .select({ name: albums.name })
    .from(albums)
    .where(inArray(albums.name, listOfAlbumsInMetadata));
  const newAlbums = listOfAlbumsInMetadata.filter(
    (album) =>
      !existingAlbums.some((existingAlbum) => existingAlbum.name === album),
  );
  const newAlbumsIds = await Promise.all(
    newAlbums.map(async (album) => {
      const newAlbum = await db
        .insert(albums)
        .values({ name: album, coverImage })
        .returning({ id: albums.id });
      return newAlbum[0].id;
    }),
  );
  await db
    .insert(albumSongs)
    .values(newAlbumsIds.map((albumId) => ({ albumId, songId })));
};

const getArtistsOnSong = async (songId: number) => {
  return await db
    .select({ name: artists.name, profileImage: artists.profileImage })
    .from(artistSongs)
    .innerJoin(artists, eq(artistSongs.artistId, artists.id))
    .where(eq(artistSongs.songId, songId));
};

const getAlbumsContainingSong = async (songId: number) => {
  return await db
    .select({
      name: albums.name,
      year: albums.year,
      coverImage: albums.coverImage,
    })
    .from(albumSongs)
    .innerJoin(albums, eq(albumSongs.albumId, albums.id))
    .where(eq(albumSongs.songId, songId));
};

const getSnapshotHash = async (songId: number) => {
  const result = await db
    .select()
    .from(songs)
    .where(eq(songs.id, songId))
    .limit(1);
  if (result.length === 0) {
    throw new Error("Song not found");
  }
  const song = result[0];
  const albumsContainingSong = await getAlbumsContainingSong(songId);
  const albumNames = albumsContainingSong
    .map(
      (album) =>
        `${album.name ?? ""}${album.year ?? ""}${album.coverImage ?? ""}`,
    )
    .sort()
    .join(",");
  const artistsOnSong = await getArtistsOnSong(songId);
  const artistNames = artistsOnSong
    .map((artist) => artist.name)
    .sort()
    .join(",");
  const hashFunctionInput = [
    song.title,
    song.duration,
    song.fileType,
    song.coverImage,
    artistNames,
    albumNames,
  ].join("-");
  console.log("hashFunctionInput", hashFunctionInput);
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    hashFunctionInput,
  );
  return hash;
};

const saveSongSnapshot = async (songId: number) => {
  const hash = await getSnapshotHash(songId);
  await db
    .update(songs)
    .set({ snapshotAtLastExport: hash })
    .where(eq(songs.id, songId));
};
