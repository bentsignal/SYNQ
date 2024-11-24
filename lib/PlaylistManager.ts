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
      playlistBus.emit('savePlaylistChanges');
    }, 200);
  }
  catch (error) {
    console.log('error removing from all playlists: ', error);
  }
}