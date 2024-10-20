import * as SQLite from 'expo-sqlite';
import { SongType } from '@/constants/Types';

class DataManager {
  private static instance: DataManager;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }
  
  async initConnection() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('synq.db');
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (!this.db) {
        await this.initConnection();
      }
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      this.db = null;
      return false;
    }
  }

  async createTables(): Promise<boolean> {
    try {
      await this.createSongsTable();
      return true;
    }
    catch (error) {
      console.error('Error creating tables:', error);
      return false;
    }
  }

  async createSongsTable(): Promise<boolean> {
    try {
      await this.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS songs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          edited BOOLEAN DEFAULT FALSE,
          artists TEXT,
          album TEXT,
          genre TEXT,
          duration INTEGER,
          fileType TEXT,
          fileName TEXT
        );
      `);
      return true;
    }
    catch (error) {
      throw new Error('Error creating song table: ' + error);
    }
  }

  async clearSongsTable(): Promise<boolean> {
    try {
      if (!this.db) {
        await this.initConnection();
      }
      await this.db?.execAsync(`DELETE FROM songs;`);
      return true;
    } catch (error) {
      console.error('Error clearing songs table:', error);
      return false;
    }
  }

  async insertSong(
    title: string,
    artists: string,
    album: string,
    genre: string,
    duration: number,
    fileType: string,
    fileName: string
  ): Promise<number> {
    try {   
      if (!this.db) {
        await this.initConnection();
      } 
      const result = await this.db?.runAsync(
        `INSERT INTO songs (title, artists, album, genre, duration, fileType, fileName)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, artists, album, genre, duration, fileType, fileName] 
      );
      return result?.lastInsertRowId ? result.lastInsertRowId : -1;
    } catch (error) {
      console.error(`Error inserting song: ${title}`, error);
      throw new Error('Failed to insert song');
    }
  }

  async getSongs(): Promise<any> {
    try {
      if (!this.db) {
        await this.initConnection();
      }
      const result = await this.db?.getAllAsync(`SELECT * FROM songs;`);
      return result ? result : [];
    } catch (error) {
      console.error('Error getting songs:', error);
    }
  }

  async getSongById(id: number): Promise<any> {
    try {
      if (!this.db) {
        await this.initConnection();
      }
      const result = await this.db?.getFirstAsync(`SELECT * FROM songs WHERE id = ?;`, [id]);
      return result ? result : null;
    } catch (error) {
      console.error('Error getting song by id:', error);
    }
  }

  async removeSong(id: number): Promise<boolean> {
    try {
      if (!this.db) {
        await this.initConnection();
      }
      await this.db?.runAsync(`DELETE FROM songs WHERE id = ?;`, [id]);
      return true;
    } catch (error) {
      console.error('Error removing song:', error);
      return false;
    }
  }

  async editSong(id: number, title: string, artists: string, album: string): Promise<boolean> {
    try {
      await this.db?.runAsync(
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

export default DataManager;