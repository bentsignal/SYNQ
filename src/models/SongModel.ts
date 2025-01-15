import Model from './Model';
import { SongResultType } from '@/src/constants/Types';
import { getArtistsFromSong } from '../controllers/ArtistController';

export default class SongModel extends Model {

  private static instance: SongModel;

  constructor() {
    super();
  }

  public static getInstance(): SongModel {
    if (!SongModel.instance) {
      SongModel.instance = new SongModel();
    }
    return SongModel.instance;
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
      if (!SongModel.db) {
        await SongModel.initConnection();
      } 
      const result = await SongModel.db?.runAsync(
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
      if (!SongModel.db) {
        await SongModel.initConnection();
      }
      const result = await SongModel.db?.getAllAsync(`SELECT * FROM songs;`);
      return result ? result : [];
    } catch (error) {
      console.error('Error getting songs:', error);
    }
  }

  public async getSongById(id: number): Promise<any> {
    try {
      if (!SongModel.db) {
        await SongModel.initConnection();
      }
      const result = await SongModel.db?.getFirstAsync<SongResultType>(`SELECT * FROM songs WHERE id = ?;`, [id]);
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
      if (!SongModel.db) {
        await SongModel.initConnection();
      }
      await SongModel.db?.runAsync(`DELETE FROM songs WHERE id = ?;`, [id]);
      return true;
    } catch (error) {
      console.error('Error removing song:', error);
      return false;
    }
  }

  public async songExported(id: number): Promise<boolean> {
    try {
      await SongModel.db?.runAsync(`UPDATE songs SET edited = FALSE WHERE id = ?;`, [id]);
      return true;
    } 
    catch (error) {
      console.error('Error marking song as exported:', error);
      return false;
    }
  }

  public async editSong(id: number, title: string, artists: string, album: string): Promise<boolean> {
    try {
      await SongModel.db?.runAsync(
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