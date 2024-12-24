import DataManager from "./DataManager";
import { ArtistType, SortType } from "@/constants/Types";

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

}

export default ArtistDataManager;