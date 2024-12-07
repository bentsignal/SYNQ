import * as SQLite from 'expo-sqlite';
import { SongType } from '@/constants/Types';

class DataManager {

  protected static db: SQLite.SQLiteDatabase | null = null;

  protected constructor() {}
  
  public static async initConnection() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('synq.db');
    }
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
      // await this.createAlbumsTable();
      // await this.createAlbumSongsTable();
      // await this.createArtistsTable();
      // await this.createArtistSongsTable();
      // await this.createArtistsAlbumsTable();
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
          songId INTEGER,
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
          name TEXT,
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
          songId INTEGER,
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
          albumId INTEGER,
        );
      `);
      return true;
    }
    catch (error) {
      console.error('Error creating artists albums table:', error);
      return false;
    }
  } 

}

export default DataManager;