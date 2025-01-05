import Model from "./Model";
import { AlbumType, SortType, SongResultType, ArtistType, PageType } from "@/constants/Types";
import { getArtistsFromSong } from "@/lib/controllers/ArtistController";

export default class AlbumModel extends Model {

  private static instance: AlbumModel;

  constructor() {
    super();
  }

  public static getInstance(): AlbumModel {
    if (!AlbumModel.instance) {
      AlbumModel.instance = new AlbumModel();
    }
    return AlbumModel.instance;
  }

  public async getAlbums(sort: SortType = SortType.ALBUM): Promise<AlbumType[]> {
    const result = await AlbumModel.db?.getAllAsync<AlbumType>(`SELECT * FROM albums;`);
    if (!result) {
      return [];
    }
    if (sort === SortType.ALBUM) {
      return result.sort((a, b) => a?.name.localeCompare(b?.name));
    }
    return result;
  }

  public async checkForDuplicateName(name: string): Promise<boolean> {
    const result = await AlbumModel.db?.getFirstAsync(`SELECT * FROM albums WHERE name = ?;`, [name]);
    return result ? true : false;
  }

  public async createAlbum(name: string, year?: number): Promise<number> {
    const cleanName = name.trim();
    if (await this.checkForDuplicateName(cleanName)) {
      throw new Error('Album already exists');
    }
    if (cleanName === '') {
      throw new Error('Album name is required');
    }
    const result = await AlbumModel.db?.runAsync(
      `INSERT INTO albums (name, year) VALUES (?, ?);`, 
      [cleanName, year || null]
    );
    return result?.lastInsertRowId ? result.lastInsertRowId : -1;
  }

  public async deleteAlbum(albumId: number): Promise<void> {
    await AlbumModel.db?.runAsync(`DELETE FROM albums WHERE id = ?;`, [albumId]);
    await AlbumModel.db?.runAsync(`DELETE FROM albumSongs WHERE albumId = ?;`, [albumId]);
    await AlbumModel.db?.runAsync(`DELETE FROM artistsAlbums WHERE albumId = ?;`, [albumId]);
  }

  public async getAlbumInfo(albumId: number): Promise<AlbumType | null> {
    const result = await AlbumModel.db?.getFirstAsync(`SELECT * FROM albums WHERE id = ?;`, [albumId]);
    return result ? result as AlbumType : null;
  }

  public async updateAlbum(albumId: number, name: string, year?: number): Promise<void> {
    if (year !== undefined) {
      await AlbumModel.db?.runAsync(
        `UPDATE albums SET name = ?, year = ? WHERE id = ?;`, 
        [name, year, albumId]
      );
    } else {
      await AlbumModel.db?.runAsync(
        `UPDATE albums SET name = ? WHERE id = ?;`, 
        [name, albumId]
      );
    }
  }

  public async addAlbumToSong(albumId: number, songId: number): Promise<void> {
    await AlbumModel.db?.runAsync(
      `INSERT INTO albumSongs (albumId, songId) VALUES (?, ?);`, 
      [albumId, songId]
    );
  }

  public async removeAlbumFromSong(albumId: number, songId: number): Promise<void> {
    await AlbumModel.db?.runAsync(
      `DELETE FROM albumSongs WHERE albumId = ? AND songId = ?;`, 
      [albumId, songId]
    );
  }

  public async isAlbumOnSong(albumId: number, songId: number): Promise<boolean> {
    const result = await AlbumModel.db?.getFirstAsync(
      `SELECT * FROM albumSongs WHERE albumId = ? AND songId = ?;`, 
      [albumId, songId]
    );
    return result ? true : false;
  }

  public async getAlbumsFromSong(songId: number): Promise<AlbumType[]> {
    const result = await AlbumModel.db?.getAllAsync(`
      SELECT albums.*
      FROM albums 
      INNER JOIN albumSongs ON albums.id = albumSongs.albumId 
      WHERE albumSongs.songId = ? 
      ORDER BY albumSongs.rowid;`, [songId]);
    return result ? result as AlbumType[] : [];
  }

  public async getSongsFromAlbum(albumId: number, sort: SortType = SortType.NEWEST): Promise<SongResultType[]> {
    let result = await AlbumModel.db?.getAllAsync<SongResultType>(
      `SELECT * FROM songs WHERE id IN (SELECT songId FROM albumSongs WHERE albumId = ?);`, 
      [albumId]
    );
    if (result) {
      result = await Promise.all(result.map(async (song) => {
        const artists = await getArtistsFromSong(song.id);
        song.artists = artists.map(artist => artist.name).join(', ');
        return song;
      }));
    }
    if (sort === SortType.NEWEST) {
      return result.reverse();
    }
    return result;
  }

  public async getArtistsFromAlbum(albumId: number): Promise<ArtistType[]> {
    const result = await AlbumModel.db?.getAllAsync(`
      SELECT artists.* 
      FROM artists
      INNER JOIN artistsAlbums ON artists.id = artistsAlbums.artistId
      WHERE artistsAlbums.albumId = ?;`, 
      [albumId]
    );
    const artists = result ? result as ArtistType[] : [];
    artists.forEach(artist => {
      artist.pageType = PageType.ALBUM;
    });
    return artists;
  }

  public async addArtistToAlbum(artistId: number, albumId: number): Promise<void> {
    await AlbumModel.db?.runAsync(
      `INSERT INTO artistsAlbums (artistId, albumId) VALUES (?, ?);`, 
      [artistId, albumId]
    );
  }

  public async removeArtistFromAlbum(artistId: number, albumId: number): Promise<void> {
    await AlbumModel.db?.runAsync(
      `DELETE FROM artistsAlbums WHERE artistId = ? AND albumId = ?;`, 
      [artistId, albumId]
    );
  }

  public async isArtistOnAlbum(albumId: number, artistId: number): Promise<boolean> {
    const result = await AlbumModel.db?.getFirstAsync(
      `SELECT * FROM artistsAlbums WHERE artistId = ? AND albumId = ?;`, 
      [artistId, albumId]
    );
    return result ? true : false;
  }
}
