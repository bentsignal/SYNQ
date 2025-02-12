import { AlbumType, SongType, SortType } from "@/src/constants/Types";
import AlbumModel from "@/src/models/AlbumModel";
import { writeImageToLibrary } from "./ImageController";
import * as FileSystem from 'expo-file-system';
import { AlbumBusEvent } from "@/src/events/album/Events";
import albumBus from "@/src/events/album";
import { flagSongAsEdited, getSongByResult } from "./SongController";

export const createAlbum = async (name: string, year?: number, image?: string): Promise<AlbumType> => {
  const albumId = await AlbumModel.getInstance().createAlbum(name, year);
  if (image) {
    const dir = `${FileSystem.documentDirectory}albums/${albumId}`;
    await makeAlbumsDir();
    await FileSystem.makeDirectoryAsync(dir);
    await writeImageToLibrary(image, dir);
  }
  return { id: albumId, name: name, year: year };
}

export const deleteAlbum = async (albumId: number) => {
  const db = AlbumModel.getInstance();
  try {
    await FileSystem.deleteAsync(`${FileSystem.documentDirectory}albums/${albumId}`);
    await db.deleteAlbum(albumId);
  }
  catch (error) {
    console.log('error deleting album:', error);
  }
}

export const getAlbumInfo = async (albumId: number): Promise<AlbumType | null> => {
  return await AlbumModel.getInstance().getAlbumInfo(albumId);
}

export const getAlbums = async (): Promise<AlbumType[]> => {
  return await AlbumModel.getInstance().getAlbums();
}

export const getArtistsFromAlbum = async (albumId: number): Promise<AlbumType[]> => {
  return await AlbumModel.getInstance().getArtistsFromAlbum(albumId);
}

export const addArtistToAlbum = async (artistId: number, albumId: number): Promise<void> => {
  const alreadyExists = await AlbumModel.getInstance().isArtistOnAlbum(albumId, artistId);
  if (!alreadyExists) {
    await AlbumModel.getInstance().addArtistToAlbum(artistId, albumId);
  }
}

export const removeArtistFromAlbum = async (artistId: number, albumId: number): Promise<void> => {
  await AlbumModel.getInstance().removeArtistFromAlbum(artistId, albumId);
}

const makeAlbumsDir = async () => {
  try {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}albums`);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!(message.includes('folder') && message.includes("already exists"))) {
      console.log('error making albums directory:', error);
    }
  }
}

export const getAlbumCover = async (albumId: number, full: boolean = false) => {
  await makeAlbumsDir();
  const dir = `${FileSystem.documentDirectory}albums/${albumId}`;
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

export const updateAlbum = async (albumId: number, name: string, year?: number, image?: string) => {
  if (name || year !== undefined) {
    await AlbumModel.getInstance().updateAlbum(albumId, name, year);
    albumBus.emit(AlbumBusEvent.ALBUM_MODIFIED, {
      id: albumId,
      name: name,
      year: year,
    });
  }
  if (image) {
    await writeImageToLibrary(image, `${FileSystem.documentDirectory}albums/${albumId}`);
    const albumSongs = await getSongsFromAlbum(albumId);
    albumSongs.forEach(song => {
      flagSongAsEdited(song.id);
    });
    albumBus.emit(AlbumBusEvent.ALBUM_IMAGE_MODIFIED, {
      id: albumId,
    });
  }
}

export const addAlbumToSong = async (albumId: number, songId: number, track?: number) => {
  await AlbumModel.getInstance().addAlbumToSong(albumId, songId, track);
}

export const removeAlbumFromSong = async (albumId: number, songId: number) => {
  await AlbumModel.getInstance().removeAlbumFromSong(albumId, songId);
}

export const isAlbumOnSong = async (albumId: number, songId: number): Promise<boolean> => {
  return await AlbumModel.getInstance().isAlbumOnSong(albumId, songId);
}

export const isArtistOnAlbum = async (albumId: number, artistId: number): Promise<boolean> => {
  return await AlbumModel.getInstance().isArtistOnAlbum(artistId, albumId);
}

export const getAlbumsFromSong = async (songId: number): Promise<AlbumType[]> => {
  return await AlbumModel.getInstance().getAlbumsFromSong(songId);
}

export const getSongsFromAlbum = async (albumId: number, sort: SortType = SortType.TRACK): Promise<SongType[]> => {
  const results = await AlbumModel.getInstance().getSongsFromAlbum(albumId, sort);
  return results.map(result => getSongByResult(result));
}

export const getAlbumFromMetadata = async (value: string, year?: number, image?: string): Promise<AlbumType> => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const allAlbums = await AlbumModel.getInstance().getAlbums();
  const existingAlbum = allAlbums.find(album => album.name && album.name.toLowerCase() === value.toLowerCase());

  if (existingAlbum) {
    return existingAlbum;
  } else {
    const newAlbum = await createAlbum(value, year, image);
    return newAlbum;
  }

}

export const getAlbumCoverFromSong = async (songId: number, full: boolean = false): Promise<string> => {
  const albums = await getAlbumsFromSong(songId);
  for (let i = 0; i < albums.length; i++) {
    const path = await getAlbumCover(albums[i].id, full);
    if (path) {
      return path;
    }
  }
  return null;
}

export const getAlbumsContainingSong = async (songId: number): Promise<AlbumType[]> => {
  return await AlbumModel.getInstance().getAlbumsContainingSong(songId);
}

export const getAlbumsFromArtist = async (artistId: number): Promise<AlbumType[]> => {
  return await AlbumModel.getInstance().getAlbumsFromArtist(artistId);
}
