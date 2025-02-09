import * as SQLite from 'expo-sqlite';
import { SongType } from '@/src/constants/Types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Model {

  protected static db: SQLite.SQLiteDatabase | null = null;
  private static currentVersion: number = 2; // set current db version
  private static storedVersionKey: string = 'dbVersion';

  protected constructor() {}
  
  public static async initConnection() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('synq.db');
    }
  }

  public static async reconnect() {
    await this.db?.closeAsync();
    this.db = await SQLite.openDatabaseAsync('synq.db');
  }

  public static async checkConnection(): Promise<boolean> {
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

  public static async createTables(): Promise<boolean> {
    try {
      await this.createSongsTable();
      await this.createPlaylistsTable();
      await this.createPlaylistSongsTable();
      await this.createAlbumsTable();
      await this.createAlbumSongsTable();
      await this.createArtistsTable();
      await this.createArtistSongsTable();
      await this.createArtistsAlbumsTable();
      await this.migrate();
      return true;
    }
    catch (error) {
      console.error('Error creating tables:', error);
      return false;
    }
  }

  public static async createSongsTable(): Promise<boolean> {
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

  public static async createPlaylistsTable(): Promise<boolean> {
    try {
      // create playlists table
      await this.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS playlists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        );
      `);
      // create playlist named library if it doesn't exist
      await this.db?.execAsync(`
        INSERT INTO playlists (name)
        SELECT 'Library'
        WHERE NOT EXISTS (
          SELECT 1 FROM playlists WHERE id = 1
        );
      `);
      // create playlist named favorites if it doesn't exist
      await this.db?.execAsync(`
        INSERT INTO playlists (name)
        SELECT 'Liked Songs'
        WHERE NOT EXISTS (
          SELECT 1 FROM playlists WHERE id = 2
        );
      `);
      return true;
    }
    catch (error) {
      console.error('Error creating playlists table:', error);
      return false;
    }
  }

  public static async createPlaylistSongsTable(): Promise<boolean> {
    try {
      await this.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS playlistSongs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          playlistId INTEGER,
          songId INTEGER
        );
      `);
      return true;
    }
    catch (error) {
      console.error('Error creating playlist songs table:', error);
      return false;
    }
  }

  public static async createAlbumsTable(): Promise<boolean> {
    try {
      await this.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS albums (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          year INTEGER
        );
      `);
      return true;
    }
    catch (error) {
      console.error('Error creating albums table:', error);
      return false;
    }
  }

  public static async createAlbumSongsTable(): Promise<boolean> {
    try {
      await this.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS albumSongs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          albumId INTEGER,
          songId INTEGER
        );
      `);
      return true;
    }
    catch (error) {
      console.error('Error creating album songs table:', error);
      return false;
    }
  }

  public static async createArtistsTable(): Promise<boolean> {
    try {
      await this.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS artists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        );
      `);
      return true;
    }
    catch (error) {
      console.error('Error creating artists table:', error);
      return false;
    }
  }

  public static async createArtistSongsTable(): Promise<boolean> {
    try {
      await this.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS artistSongs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          artistId INTEGER,
          songId INTEGER 
        );
      `);
      return true;
    }
    catch (error) {
      console.error('Error creating artist songs table:', error);
      return false;
    }
  } 

  public static async createArtistsAlbumsTable(): Promise<boolean> {
    try {
      await this.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS artistsAlbums (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          artistId INTEGER,
          albumId INTEGER
        );
      `);
      return true;
    }
    catch (error) {
      console.error('Error creating artists albums table:', error);
      return false;
    }
  } 

  private static async getVersion(): Promise<number> {
    try {
      const versionString = await AsyncStorage.getItem(this.storedVersionKey);
      const version = versionString ? parseInt(versionString, 10) : 0;
      return version;
    } catch (error) {
      console.error("Failed to get database version from async storage, assuming version 0", error);
      return 0;
    }
  }

  private static async setVersion(version: number): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storedVersionKey, version.toString());
    } catch (error) {
      console.error("Failed to update database version in async storage", error);
    }
  }

  private static async migrate(): Promise<void> {
    const storedVersion = await this.getVersion();

    if (storedVersion < this.currentVersion) {
      console.log(`Database migration needed. Current version: ${storedVersion}, target version: ${this.currentVersion}`);

      if (storedVersion < 2) {
        try {
          await this.db?.execAsync(`ALTER TABLE albumSongs ADD COLUMN track INTEGER;`);
          console.log('Migration to version 2 complete: added track column to albumSongs table.');
        } catch (migrationError) {
          console.error('Error migrating to version 2:', migrationError);
        }
      }

      await this.setVersion(this.currentVersion);
      console.log(`Database migrated to version ${this.currentVersion}`);

    } else {
      console.log('No database migration needed.');
    }
  }
}