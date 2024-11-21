import DataManager from './DataManager';
import { PlaylistType, SongType } from '@/constants/Types';

class PlaylistDataManager extends DataManager {

  private static instance: PlaylistDataManager;

  constructor() {
    super();  
  }

  public static getInstance(): PlaylistDataManager {
    if (!PlaylistDataManager.instance) {
      PlaylistDataManager.instance = new PlaylistDataManager();
    }
    return PlaylistDataManager.instance;
  }

  public async getPlaylists(): Promise<PlaylistType[]> {
    try {
      const result = await PlaylistDataManager.db?.getAllAsync(`
        SELECT playlists.*, COUNT(playlistSongs.songId) as songCount 
        FROM playlists
        LEFT JOIN playlistSongs ON playlists.id = playlistSongs.playlistId
        GROUP BY playlists.id;
      `);
      return result as PlaylistType[];
    }
    catch (error) {
      throw new Error('Error getting playlists: ' + error);
    }
  }

  public async getPlaylistById(id: number): Promise<PlaylistType | null> {
    try {
      const result = await PlaylistDataManager.db?.getFirstAsync(`
        SELECT playlists.*, COUNT(playlistSongs.songId) as songCount 
        FROM playlists
        LEFT JOIN playlistSongs ON playlists.id = playlistSongs.playlistId
        GROUP BY playlists.id;
      `, [id]);
      return result ? result as PlaylistType : null;
    }
    catch (error) {
      throw new Error('Error getting playlist by id: ' + error);
    }
  }

  public async getSongsFromPlaylist(playlistId: number): Promise<any[]> {
    try {
      if (!PlaylistDataManager.db) {
        await PlaylistDataManager.initConnection();
      }
      const result = await PlaylistDataManager.db?.getAllAsync(`
        SELECT songs.* 
        FROM songs
        INNER JOIN playlistSongs ON songs.id = playlistSongs.songId
        WHERE playlistSongs.playlistId = ?;
      `, [playlistId]);
      return result ? result : [];
    }
    catch (error) {
      throw new Error('Error getting songs from playlist: ' + error);
    }
  }

  public async addToPlaylist(playlistId: number, songId: number): Promise<boolean> {
    try {
      await PlaylistDataManager.db?.runAsync(`INSERT INTO playlistSongs (playlistId, songId) VALUES (?, ?);`, [playlistId, songId]);
      return true;
    }
    catch (error) {
      throw new Error('Error adding to playlist: ' + error);
    }
  }

}

export default PlaylistDataManager;

