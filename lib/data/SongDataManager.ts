import DataManager from './DataManager';
import { SongResultType } from '@/constants/Types';
import { getArtistsFromSong } from '../controllers/ArtistController';

class SongDataManager extends DataManager {

  private static instance: SongDataManager;

  constructor() {
    super();
  }

  public static getInstance(): SongDataManager {
    if (!SongDataManager.instance) {
      SongDataManager.instance = new SongDataManager();
    }
    return SongDataManager.instance;
  }

  public async insertSong(
    title: string,
    artists: string,
    album: string,
    genre: string,
    duration: number,
    fileType: string,
    fileName: string,
    edited: boolean,
  ): Promise<number> {
    try {   
      if (!SongDataManager.db) {
        await SongDataManager.initConnection();
      } 
      const result = await SongDataManager.db?.runAsync(
        `INSERT INTO songs (title, artists, album, genre, duration, fileType, fileName, edited)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, artists, album, genre, duration, fileType, fileName, edited] 
      );
      return result?.lastInsertRowId ? result.lastInsertRowId : -1;
    } catch (error) {
      console.error(`Error inserting song: ${title}`, error);
      throw new Error('Failed to insert song');
    }
  }

  public async getSongs(): Promise<any> {
    try {
      if (!SongDataManager.db) {
        await SongDataManager.initConnection();
      }
      const result = await SongDataManager.db?.getAllAsync(`SELECT * FROM songs;`);
      return result ? result : [];
    } catch (error) {
      console.error('Error getting songs:', error);
    }
  }

  public async getSongById(id: number): Promise<any> {
    try {
      if (!SongDataManager.db) {
        await SongDataManager.initConnection();
      }
      const result = await SongDataManager.db?.getFirstAsync<SongResultType>(`SELECT * FROM songs WHERE id = ?;`, [id]);
      const artists = await getArtistsFromSong(id);
      if (result !== null){
        result.artists = artists.map(artist => artist.name).join(', ');
      }
      return result ? result : null;
    } catch (error) {
      console.error('Error getting song by id:', error);
    }
  }

  public async removeSong(id: number): Promise<boolean> {
    try {
      if (!SongDataManager.db) {
        await SongDataManager.initConnection();
      }
      await SongDataManager.db?.runAsync(`DELETE FROM songs WHERE id = ?;`, [id]);
      return true;
    } catch (error) {
      console.error('Error removing song:', error);
      return false;
    }
  }

  public async songExported(id: number): Promise<boolean> {
    try {
      await SongDataManager.db?.runAsync(`UPDATE songs SET edited = FALSE WHERE id = ?;`, [id]);
      return true;
    } 
    catch (error) {
      console.error('Error marking song as exported:', error);
      return false;
    }
  }

  public async editSong(id: number, title: string, artists: string, album: string): Promise<boolean> {
    try {
      await SongDataManager.db?.runAsync(
        `UPDATE songs SET title = ?, artists = ?, album = ?, edited = TRUE WHERE id = ?;`, 
        [title, artists, album, id]
      );
      return true;
    } catch (error) {
      console.error('Error editing song:', error);
      return false;
    }
  }

}

export default SongDataManager;