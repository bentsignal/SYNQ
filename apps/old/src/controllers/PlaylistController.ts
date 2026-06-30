import PlaylistModel from "@/src/models/PlaylistModel";
import * as FileSystem from 'expo-file-system';
import { getSongByResult } from "@/src/controllers/SongController";
import { PageType, SortOrder, SortType } from "@/src/constants/Types";
import { writeImageToLibrary } from "@/src/features/images/repository/image-repository";
import { saveCoverImage } from "@/src/lib/image-utils";
import { db as drizzleDb } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const createPlaylist = async (name: string, image?: string) => {
  const db = PlaylistModel.getInstance();
  const id = await db.createPlaylist(name);
  if (image) {
    const dir = `${FileSystem.documentDirectory}playlists/${id}`;
    await makePlaylistsDir();
    await FileSystem.makeDirectoryAsync(dir);
    await writeImageToLibrary(image, dir);
    const coverImage = await saveCoverImage(image);
    if (coverImage) {
      await drizzleDb
        .update(schema.playlists)
        .set({ coverImage })
        .where(eq(schema.playlists.id, id));
    }
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

export const getPlaylists = async (
  query?: string,
  sort?: SortType,
  order?: SortOrder,
) => {
  return await PlaylistModel.getInstance().getPlaylists(
    query,
    sort,
    order,
  );
}

export const removeFromAllPlaylists = async (songId: number) => {
  try {
    const db = PlaylistModel.getInstance();
    const playlists = await db.getPlaylists();
    for (const playlist of playlists) {
      await db.removeFromPlaylist(playlist.id, songId);
    }
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

export const getPlaylistSongs = async (
  playlistId: number,
  pageType?: PageType,
  sort: SortType = SortType.DATE,
  order: SortOrder = SortOrder.DESC,
  query?: string
) => {
  const db = PlaylistModel.getInstance();
  const results = await db.getSongsFromPlaylist(playlistId, sort, order, query);
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

export const updatePlaylist = async (
  playlistId: number,
  name?: string,
  image?: string,
) => {
  const db = PlaylistModel.getInstance();
  if (name) {
    await db.updatePlaylist(playlistId, name);
  }
  if (image) {
    await writeImageToLibrary(image, `${FileSystem.documentDirectory}playlists/${playlistId}`);
    const coverImage = await saveCoverImage(image);
    if (coverImage) {
      await drizzleDb
        .update(schema.playlists)
        .set({ coverImage })
        .where(eq(schema.playlists.id, playlistId));
    }
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

export const getPlaylistsContainingSong = async (songId: number) => {
  const playlists = await PlaylistModel.getInstance().getPlaylistsContainingSong(songId);
  return playlists;
}
