import { getAudioMetadata } from "@missingcore/audio-metadata";
import { eq, inArray } from "drizzle-orm";
import { Data, Effect } from "effect";
import * as Crypto from "expo-crypto";
import { DocumentPickerAsset } from "expo-document-picker";
import * as DocumentPicker from "expo-document-picker";
import { db } from "../db";
import { albums, albumSongs, artists, artistSongs, songs } from "../db/schema";
import { getAudioDurationFromFile } from "./audio-utils";
import { saveCoverImage } from "./image-utils";

const audioMetadataTagsToRetrieve = [
  "artwork",
  "artist",
  "name",
  "album",
  "year",
  "track",
] as const;

const supportedAudioFileTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/flac",
  "audio/aac",
];

export class FileSelectionCanceled extends Data.TaggedError(
  "FileSelectionCanceled",
)<object> {}

export class NoFilesSelected extends Data.TaggedError(
  "NoFilesSelected",
)<object> {}

export const selectFiles = Effect.gen(function* () {
  const results = yield* Effect.promise(() =>
    DocumentPicker.getDocumentAsync({
      type: supportedAudioFileTypes,
      multiple: true,
      copyToCacheDirectory: true,
    }),
  );
  if (results.canceled)
    return yield* Effect.fail(new FileSelectionCanceled({}));
  if (results.assets.length === 0)
    return yield* Effect.fail(new NoFilesSelected({}));
  return results.assets;
});

export const getMetadataFromFile = async (filePath: string) => {
  const result = await getAudioMetadata(filePath, audioMetadataTagsToRetrieve);
  return result.metadata;
};

export const digest = async (asset: DocumentPickerAsset) => {
  const metadata = await getMetadataFromFile(asset.uri);
  const duration = await getAudioDurationFromFile(asset.uri);
  const coverImageHash = await saveCoverImage(metadata.artwork);
  const { strippedValue: songTitle } = getTrackNumberFromString(
    metadata.name ?? asset.name,
  );
  const insertResult = await db.insert(songs).values({
    title: songTitle,
    duration: duration,
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
        .values({ name: album, coverImage: coverImage })
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
    .map((album) => `${album.name ?? ""}${album.year ?? ""}${album.coverImage ?? ""}`)
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

export const getTrackNumberFromString = (value: string) => {
  const trackNumber = checkForTrackNumber(value);
  if (trackNumber) {
    return {
      strippedValue: value.substring(3),
      trackNumber: trackNumber,
    };
  }
  return { strippedValue: value, trackNumber: null };
};

export const checkForTrackNumber = (str: string) => {
  if (str.length < 3) return null;

  const firstTwoChars = str.substring(0, 2);
  const thirdChar = str[2];

  if (thirdChar !== " ") return null;

  const num = parseInt(firstTwoChars);
  if (isNaN(num)) return null;

  return num;
};
