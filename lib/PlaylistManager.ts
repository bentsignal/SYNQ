import PlaylistDataManager from "./data/PlaylistDataManager";
import playlistBus from "@/station/playlistBus";
import { getSongByResult } from "./SongManager";
import { PageType } from "@/constants/Types";

export const createPlaylist = async (name: string) => {
  const db = PlaylistDataManager.getInstance();
  await db.createPlaylist(name);
}

export const deletePlaylist = async (playlistId: number) => {
  const db = PlaylistDataManager.getInstance();
  await db.deletePlaylist(playlistId);
}

export const getPlaylists = async () => {
  const db = PlaylistDataManager.getInstance();
  return await db.getPlaylists();
}

export const removeFromAllPlaylists = async (songId: number) => {
  try {
    const db = PlaylistDataManager.getInstance();
    const playlists = await db.getPlaylists();
    for (const playlist of playlists) {
      await db.removeFromPlaylist(playlist.id, songId);
    }
    setTimeout(() => {
      playlistBus.emit('playlistChangesMade');
    }, 200);
  }
  catch (error) {
    console.log('error removing from all playlists: ', error);
  }
}

export const addToPlaylist = async (playlistId: number, songId: number) => {
  const db = PlaylistDataManager.getInstance();
  await db.addToPlaylist(playlistId, songId);
}

export const removeFromPlaylist = async (playlistId: number, songId: number) => {
  const db = PlaylistDataManager.getInstance();
  await db.removeFromPlaylist(playlistId, songId);
}

export const isSongInPlaylist = async (playlistId: number, songId: number) => {
  const db = PlaylistDataManager.getInstance();
  return await db.isSongInPlaylist(playlistId, songId);
}

export const getPlaylistInfo = async (playlistId: number) => {
  const db = PlaylistDataManager.getInstance();
  return await db.getPlaylistInfoById(playlistId);
}

export const getPlaylistSongs = async (playlistId: number, pageType?: PageType) => {
  const db = PlaylistDataManager.getInstance();
  const results = await db.getSongsFromPlaylist(playlistId);
  const songs = results.map(song => {
    const result = getSongByResult(song);
    result.pageType = pageType ?? PageType.LIBRARY;
    return result;
  });
  return songs;
}