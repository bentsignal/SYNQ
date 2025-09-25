import { getAudioMetadata } from "@missingcore/audio-metadata";
import { eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import { Audio } from "expo-av";
import * as Crypto from "expo-crypto";
import { DocumentPickerAsset } from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { SaveFormat } from "expo-image-manipulator";
import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";
import { db } from "../db";
import {
  albums,
  albumSongs,
  artists,
  artistSongs,
  images,
  songs,
} from "../db/schema";
import { tryCatch } from "./util";

const tags = ["artwork", "artist", "name", "album", "year", "track"] as const;

const imageDirectory = `${FileSystem.documentDirectory}images`;

export const getMetadataFromFile = async (filePath: string) => {
  const result = await getAudioMetadata(filePath, tags);
  return result.metadata;
};

export const digest = async (asset: DocumentPickerAsset) => {
  const metadata = await getMetadataFromFile(asset.uri);
  const duration = await getAudioDurationFromFile(asset.uri);
  const coverImageHash = await saveCoverImage(metadata.artwork);
  const { strippedValue: songTitle, trackNumber } = getTrackNumberFromString(
    metadata.name,
  );
  const insertResult = await db.insert(songs).values({
    title: songTitle,
    duration: duration,
    fileType: asset.mimeType,
    pathToFile: asset.uri,
    originalFileName: asset.name,
    coverImage: coverImageHash,
  });
  const songId = insertResult.lastInsertRowId;
  await storeArtistsForNewSong(songId, metadata.artist);
  await storeAlbumsForNewSong(songId, metadata.album, coverImageHash);
  // TODO: store artists for new album
  await saveSongSnapshot(songId);
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
  coverImage?: string,
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
    .map((album) => album.name + album.year + album.coverImage)
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

export const getAudioDurationFromFile = async (filePath: string) => {
  let sound: Audio.Sound | null = null;
  try {
    const { sound: loadedSound } = await Audio.Sound.createAsync({
      uri: filePath,
    });
    sound = loadedSound;
    const status = await loadedSound.getStatusAsync();
    if (!status.isLoaded) return 0;
    return Math.floor(status.durationMillis / 1000);
  } catch (error) {
    console.error("Error getting audio duration from file: ", filePath);
    throw error;
  } finally {
    if (sound) {
      await sound.unloadAsync();
    }
  }
};

export const saveCoverImage = async (base64image?: string) => {
  if (!base64image) return null;
  await assertImageDirectoryExists();
  const numberOfCharactersToUse = 100;
  const hashFunctionInput =
    base64image.length > numberOfCharactersToUse
      ? base64image.slice(0, numberOfCharactersToUse)
      : base64image;

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    hashFunctionInput,
  );
  const imageAlreadyIngested = await checkIfImageExists(hash);
  if (imageAlreadyIngested) {
    return hash;
  }
  await writeImageToFileSystem(base64image, hash);
  await db.insert(images).values({ hash });
  return hash;
};

export const checkIfImageExists = async (hash: string) => {
  const { pathToFullImage, pathToSmallImage } = getImagePathFromHash(hash);
  const [fullImageFile, smallImageFile] = await Promise.all([
    FileSystem.getInfoAsync(pathToFullImage),
    FileSystem.getInfoAsync(pathToSmallImage),
  ]);
  const existsInDB = await db
    .select()
    .from(images)
    .where(eq(images.hash, hash));
  return fullImageFile.exists && smallImageFile.exists && existsInDB.length > 0;
};

export const writeImageToFileSystem = async (
  base64image: string,
  hash: string,
) => {
  // get image file type
  const infoString = base64image.split(/,(.*)/s)[0];
  const mimeTypeFull = infoString.split(/;(.*)/s)[0];
  const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
  const buffer = base64image.split(",")[1];
  let extension = "";
  if (mimeType === "image/jpeg") {
    extension = "jpg";
  } else if (mimeType === "image/png") {
    extension = "png";
  }
  if (extension === "") {
    throw new Error("Invalid image format: " + mimeType);
  }
  const tempPath = `${imageDirectory}/${hash}-temp.${extension}`;
  const { pathToFullImage, pathToSmallImage } = getImagePathFromHash(hash);
  // write image as is
  await FileSystem.writeAsStringAsync(tempPath, buffer, { encoding: "base64" });
  // Get full size image dimensions
  const { width: imageWidth, height: imageHeight } = await new Promise<{
    width: number;
    height: number;
  }>((resolve, reject) => {
    Image.getSize(
      tempPath,
      (width, height) => resolve({ width, height }),
      reject,
    );
  });
  const fullResizeOptions: ImageManipulator.ActionResize = {
    resize: {
      width: Math.min(1500, imageWidth),
      height: Math.min(1500, imageWidth),
    },
  };
  const smallResizeOptions: ImageManipulator.ActionResize = {
    resize: {
      width: Math.min(200, imageWidth),
      height: Math.min(200, imageWidth),
    },
  };
  // convert image to jpeg, save full size
  const fullConvert = await ImageManipulator.manipulateAsync(
    tempPath,
    [...[fullResizeOptions]],
    { compress: 1, format: SaveFormat.JPEG, base64: true },
  );
  if (fullConvert.base64) {
    await FileSystem.writeAsStringAsync(pathToFullImage, fullConvert.base64, {
      encoding: "base64",
    });
  }
  // convert image to jpeg, save small size
  const smallConvert = await ImageManipulator.manipulateAsync(
    tempPath,
    [...[smallResizeOptions]],
    { compress: 0.5, format: SaveFormat.JPEG, base64: true },
  );
  if (smallConvert.base64) {
    await FileSystem.writeAsStringAsync(pathToSmallImage, smallConvert.base64, {
      encoding: "base64",
    });
  }
  // delete temp image
  await FileSystem.deleteAsync(tempPath);
};

export const getImagePathFromHash = (hash: string) => {
  return {
    pathToFullImage: `${imageDirectory}/${hash}-full.jpg`,
    pathToSmallImage: `${imageDirectory}/${hash}-small.jpg`,
  };
};

export const assertImageDirectoryExists = async () => {
  const directoryPath = FileSystem.documentDirectory + "images";
  const info = await FileSystem.getInfoAsync(directoryPath);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directoryPath, {
      intermediates: true,
    });
  }
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
