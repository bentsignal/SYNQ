import { ArtistType } from "@/constants/Types";
import ArtistDataManager from "@/lib/data/ArtistDataManager";
import { writeImageToLibrary } from "./SongController";
import * as FileSystem from 'expo-file-system';

export const createArtist = async (name: string, image?: string): Promise<ArtistType> => {
  const artistId = await ArtistDataManager.getInstance().createArtist(name);
  if (image) {
    const dir = `${FileSystem.documentDirectory}artists/${artistId}`;
    await makeArtistsDir();
    await FileSystem.makeDirectoryAsync(dir);
    await writeImageToLibrary(image, dir);
  }
  return { id: artistId, name: name };
}

export const getArtists = async (): Promise<ArtistType[]> => {
  return await ArtistDataManager.getInstance().getArtists();
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
      const path = `${dir}/${name}`;
      const artwork = await FileSystem.readAsStringAsync(path, { encoding: 'base64' });
      return artwork ? `${artwork}` : null;
    }
    else {
      return null;
    }
  }
}