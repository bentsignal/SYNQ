import PlaylistModel from "@/lib/models/PlaylistModel";
import playlistBus from "@/src/events/playlist";
import * as FileSystem from 'expo-file-system';
import { getSongByResult } from "@/lib/controllers/SongController";
import { PageType, SortType } from "@/src/constants/Types";
import { writeImageToLibrary } from "@/lib/controllers/ImageController";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";

export const createPlaylist = async (name: string, image?: string) => {
  const db = PlaylistModel.getInstance();
  const id = await db.createPlaylist(name);
  if (image) {
    const dir = `${FileSystem.documentDirectory}playlists/${id}`;
    await makePlaylistsDir();
    await FileSystem.makeDirectoryAsync(dir);
    await writeImageToLibrary(image, dir);
  }
}

export const deletePlaylist = async (playlistId: number) => {
  const db = PlaylistModel.getInstance();
  try {
    await FileSystem.deleteAsync(`${FileSystem.documentDirectory}playlists/${playlistId}`);
    await db.deletePlaylist(playlistId);
  }
  catch (error) {
    console.log('error deleting playlist:', error);
  }
  
}

export const getPlaylists = async () => {
  const db = PlaylistModel.getInstance();
  return await db.getPlaylists();
}

export const removeFromAllPlaylists = async (songId: number) => {
  try {
    const db = PlaylistModel.getInstance();
    const playlists = await db.getPlaylists();
    for (const playlist of playlists) {
      await db.removeFromPlaylist(playlist.id, songId);
    }
    setTimeout(() => {
      playlistBus.emit(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED);
    }, 50);
  }
  catch (error) {
    console.log('error removing from all playlists: ', error);
  }
}

export const addToPlaylist = async (playlistId: number, songId: number) => {
  const db = PlaylistModel.getInstance();
  await db.addToPlaylist(playlistId, songId);
}

export const removeFromPlaylist = async (playlistId: number, songId: number) => {
  const db = PlaylistModel.getInstance();
  await db.removeFromPlaylist(playlistId, songId);
}

export const isSongInPlaylist = async (playlistId: number, songId: number) => {
  const db = PlaylistModel.getInstance();
  return await db.isSongInPlaylist(playlistId, songId);
}

export const getPlaylistInfo = async (playlistId: number) => {
  const db = PlaylistModel.getInstance();
  return await db.getPlaylistInfoById(playlistId);
}

export const getPlaylistSongs = async (playlistId: number, pageType?: PageType, sort: SortType = SortType.NEWEST) => {
  const db = PlaylistModel.getInstance();
  const results = await db.getSongsFromPlaylist(playlistId, sort);
  const songs = results.map(song => {
    const result = getSongByResult(song);
    result.pageType = pageType ?? PageType.LIBRARY;
    return result;
  });
  return songs;
}

const makePlaylistsDir = async () => {
  try {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}playlists`);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!(message.includes('folder') && message.includes("already exists"))) {
      console.log('error making playlists directory:', error);
    }
  }
}

export const updatePlaylist = async (playlistId: number, name: string, image: string) => {
  const db = PlaylistModel.getInstance();
  if (name) {
    await db.updatePlaylist(playlistId, name);
    playlistBus.emit(PlaylistBusEvent.PLAYLIST_NAME_MODIFIED, {
      id: playlistId,
      name: name,
    });
  }
  if (image) {
    await writeImageToLibrary(image, `${FileSystem.documentDirectory}playlists/${playlistId}`);
    playlistBus.emit(PlaylistBusEvent.PLAYLIST_IMAGE_MODIFIED, {
      id: playlistId,
    });
  }
}

export const getPlaylistCover = async (playlistId: number, full: boolean = false) => {
  await makePlaylistsDir();
  const dir = `${FileSystem.documentDirectory}playlists/${playlistId}`;
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

export const getSongCount = async (playlistId: number) => {
  const songs = await PlaylistModel.getInstance().getSongsFromPlaylist(playlistId);
  return songs.length;
}
