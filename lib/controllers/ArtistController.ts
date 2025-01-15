import { ArtistType, SongType, SortType } from "@/src/constants/Types";
import ArtistModel from "@/lib/models/ArtistModel";
import { writeImageToLibrary } from "./ImageController";
import * as FileSystem from 'expo-file-system';
import { ArtistBusEvent } from "@/src/events/artist/Events";
import artistBus from "@/src/events/artist";
import { getSongByResult } from "./SongController";

export const createArtist = async (name: string, image?: string): Promise<ArtistType> => {
  const artistId = await ArtistModel.getInstance().createArtist(name);
  if (image) {
    const dir = `${FileSystem.documentDirectory}artists/${artistId}`;
    await makeArtistsDir();
    await FileSystem.makeDirectoryAsync(dir);
    await writeImageToLibrary(image, dir);
  }
  return { id: artistId, name: name };
}

export const deleteArtist = async (artistId: number) => {
  const db = ArtistModel.getInstance();
  try {
    await FileSystem.deleteAsync(`${FileSystem.documentDirectory}artists/${artistId}`);
    await db.deleteArtist(artistId);
  }
  catch (error) {
    console.log('error deleting artist:', error);
  }
}

export const getArtistInfo = async (artistId: number): Promise<ArtistType | null> => {
  return await ArtistModel.getInstance().getArtistInfo(artistId);
}

export const getArtists = async (): Promise<ArtistType[]> => {
  return await ArtistModel.getInstance().getArtists();
}

const makeArtistsDir = async () => {
  try {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}artists`);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!(message.includes('folder') && message.includes("already exists"))) {
      console.log('error making artists directory:', error);
    }
  }
}

export const getArtistCover = async (artistId: number, full: boolean = false) => {
  await makeArtistsDir();
  const dir = `${FileSystem.documentDirectory}artists/${artistId}`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir);
    return null;
  }
  else {
    const contents = await FileSystem.readDirectoryAsync(dir);
    const name = full ? 'cover_full.jpg' : 'cover_small.jpg';
    if (contents.find(content => content === name)) {
      const path = `${dir}/${name}?${info.modificationTime}`;
      return path;
    }
    else {
      return null;
    }
  }
}

export const updateArtist = async (artistId: number, name: string, image: string) => {
  const db = ArtistModel.getInstance();
  if (name) {
    await db.updateArtist(artistId, name);
    artistBus.emit(ArtistBusEvent.ARTIST_MODIFIED, {
      id: artistId,
      name: name,
    });
  }
  if (image) {
    await writeImageToLibrary(image, `${FileSystem.documentDirectory}artists/${artistId}`);
    artistBus.emit(ArtistBusEvent.ARTIST_IMAGE_MODIFIED, {
      id: artistId,
    });
  }
}

export const addArtistToSong = async (artistId: number, songId: number) => {
  await ArtistModel.getInstance().addArtistToSong(artistId, songId);
}

export const removeArtistFromSong = async (artistId: number, songId: number) => {
  await ArtistModel.getInstance().removeArtistFromSong(artistId, songId);
}

export const isArtistOnSong = async (artistId: number, songId: number): Promise<boolean> => {
  return await ArtistModel.getInstance().isArtistOnSong(artistId, songId);
}

export const getArtistsFromSong = async (songId: number): Promise<ArtistType[]> => {
  return await ArtistModel.getInstance().getArtistsFromSong(songId);
}

export const getSongsFromArtist = async (artistId: number, sort: SortType = SortType.NEWEST): Promise<SongType[]> => {
  const results = await ArtistModel.getInstance().getSongsFromArtist(artistId, sort);
  const songs = results.map(result => getSongByResult(result));
  return songs;
}

export const getArtistsFromMetadata = async (value: string): Promise<ArtistType[]> => {
  
  if (value === '' || value === null || value === undefined) {
    return [];
  }

  let artists: ArtistType[] = [];

  let allNames = value.split(',');
  allNames = allNames.map(name => name.trim());
  allNames = allNames.filter(name => name !== '');

  const allArtists = await ArtistModel.getInstance().getArtists();
  const existingArtists = allArtists.filter(artist => {
    if (value.toLowerCase().includes(artist.name.toLowerCase())) {
      return true;
    }
    else {
      return false;
    }
  });

  for (let i = 0; i < allNames.length; i++) {
    const existingArtist = existingArtists.find(artist => artist.name === allNames[i]);
    if (existingArtist) {
      artists.push(existingArtist);
    }
    else {
      const newArtist = await createArtist(allNames[i]);
      artists.push(newArtist);
    }
  }
  
  return artists;
}
