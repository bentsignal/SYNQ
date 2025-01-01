import DataManager from "./DataManager";
import { ArtistType, SortType, SongResultType } from "@/constants/Types";

class ArtistDataManager extends DataManager {

  private static instance: ArtistDataManager;

  constructor() {
    super();
  }

  public static getInstance(): ArtistDataManager {
    if (!ArtistDataManager.instance) {
      ArtistDataManager.instance = new ArtistDataManager();
    }
    return ArtistDataManager.instance;
  }

  public async getArtists(sort: SortType = SortType.ARTIST): Promise<ArtistType[]> {
    const result = await ArtistDataManager.db?.getAllAsync<ArtistType>(`SELECT * FROM artists;`);
    if (!result) {
      return [];
    }
    if (sort === SortType.ARTIST) {
      return result.sort((a, b) => a?.name.localeCompare(b?.name));
    }
    return result;
  }

  public async checkForDuplicateName(name: string): Promise<boolean> {
    const result = await ArtistDataManager.db?.getFirstAsync(`SELECT * FROM artists WHERE name = ?;`, [name]);
    return result ? true : false;
  }

  public async createArtist(name: string): Promise<number> {
    try {
      if (await this.checkForDuplicateName(name)) {
        throw new Error('Artist already exists');
      }
      const result = await ArtistDataManager.db?.runAsync(`INSERT INTO artists (name) VALUES (?);`, [name]);
      return result?.lastInsertRowId ? result.lastInsertRowId : -1;
    }
    catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async deleteArtist(artistId: number): Promise<void> {
    await ArtistDataManager.db?.runAsync(`DELETE FROM artists WHERE id = ?;`, [artistId]);
    await ArtistDataManager.db?.runAsync(`DELETE FROM artistSongs WHERE artistId = ?;`, [artistId]);
    await ArtistDataManager.db?.runAsync(`DELETE FROM artistsAlbums WHERE artistId = ?;`, [artistId]);
  }

  public async getArtistInfo(artistId: number): Promise<ArtistType | null> {
    const result = await ArtistDataManager.db?.getFirstAsync(`SELECT * FROM artists WHERE id = ?;`, [artistId]);
    return result ? result as ArtistType : null;
  }

  public async updateArtist(artistId: number, name: string): Promise<void> {
    await ArtistDataManager.db?.runAsync(`UPDATE artists SET name = ? WHERE id = ?;`, [name, artistId]);
  }

  public async addArtistToSong(artistId: number, songId: number): Promise<void> {
    await ArtistDataManager.db?.runAsync(`INSERT INTO artistSongs (artistId, songId) VALUES (?, ?);`, [artistId, songId]);
  }

  public async removeArtistFromSong(artistId: number, songId: number): Promise<void> {
    await ArtistDataManager.db?.runAsync(`DELETE FROM artistSongs WHERE artistId = ? AND songId = ?;`, [artistId, songId]);
  }

  public async isArtistOnSong(artistId: number, songId: number): Promise<boolean> {
    const result = await ArtistDataManager.db?.getFirstAsync(`SELECT * FROM artistSongs WHERE artistId = ? AND songId = ?;`, [artistId, songId]);
    return result ? true : false;
  }

  public async getArtistsFromSong(songId: number): Promise<ArtistType[]> {
    const result = await ArtistDataManager.db?.getAllAsync(`
      SELECT artists.*
      FROM artists 
      INNER JOIN artistSongs ON artists.id = artistSongs.artistId 
      WHERE artistSongs.songId = ? 
      ORDER BY artistSongs.rowid;`, [songId]);
    return result ? result as ArtistType[] : [];
  }

  public async getSongsFromArtist(artistId: number, sort: SortType = SortType.NEWEST): Promise<SongResultType[]> {
    let result = await ArtistDataManager.db?.getAllAsync<SongResultType>(`SELECT * FROM songs WHERE id IN (SELECT songId FROM artistSongs WHERE artistId = ?);`, [artistId]);
    if (result) {
      result = await Promise.all( result.map(async (song) => {
        const artists = await this.getArtistsFromSong(song.id);
        song.artists = artists.map(artist => artist.name).join(', ');
        return song;
      }));
    }
    if (sort === SortType.NEWEST) {
      return result.reverse();
    }
    else {
      return result;
    }
  }

}

export default ArtistDataManager;