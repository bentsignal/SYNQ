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
          fileName TEXT
        );
      `);
      return true;
    }
    catch (error) {
      throw new Error('Error creating song table: ' + error);
    }
  }

  async insertSong(
    title: string,
    artists: string,
    album: string,
    genre: string,
    duration: number,
    fileName: string
  ): Promise<number> {
    try {
      if (!this.db) {
        await this.initConnection();
      } 
      const result = await this.db?.runAsync(
        `INSERT INTO songs (title, artists, album, genre, duration, fileName)
         VALUES (${title}, ${artists}, ${album}, ${genre}, ${duration}, ${fileName})`
      );
      return result?.lastInsertRowId ? result.lastInsertRowId : -1;
    } catch (error) {
      console.error(`Error inserting song: ${title}`, error);
      throw new Error('Failed to insert song');
    }
  }

}

export default DataManager;