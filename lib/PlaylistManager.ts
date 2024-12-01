import PlaylistDataManager from "./data/PlaylistDataManager";
import playlistBus from "@/station/playlistBus";

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

export const deletePlaylist = async (playlistId: number) => {
  const db = PlaylistDataManager.getInstance();
  await db.deletePlaylist(playlistId);
}