import * as SQLite from 'expo-sqlite';

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
          artists TEXT,
          album TEXT,
          genre TEXT,
          duration INTEGER NOT NULL,
          path TEXT NOT NULL
        )
      `);
      return true;
    }
    catch (error) {
      throw new Error('Error creating song table: ' + error);
    }
  }

}