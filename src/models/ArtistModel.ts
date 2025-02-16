import { getAlbumsFromSong } from "../controllers/AlbumController";
import Model from "./Model";
import { ArtistType, SortType, SongResultType, SortOrder } from "@/src/constants/Types";

export default class ArtistModel extends Model {

  private static instance: ArtistModel;

  constructor() {
    super();
  }

  public static getInstance(): ArtistModel {
    if (!ArtistModel.instance) {
      ArtistModel.instance = new ArtistModel();
    }
    return ArtistModel.instance;
  }

  public async getArtists(
    query?: string, 
    sort: SortType = SortType.ARTIST, 
    order: SortOrder = SortOrder.ASC
  ): Promise<ArtistType[]> {
    const result = await ArtistModel.db?.getAllAsync<ArtistType>(`
      SELECT artists.* FROM artists
      LEFT JOIN artistSongs ON artists.id = artistSongs.artistId
      LEFT JOIN songs ON artistSongs.songId = songs.id
      LEFT JOIN albumSongs ON songs.id = albumSongs.songId
      LEFT JOIN albums ON albumSongs.albumId = albums.id
      ${query ? 'WHERE LOWER(artists.name) LIKE ? OR LOWER(songs.title) LIKE ? OR LOWER(albums.name) LIKE ?' : ''}
      GROUP BY artists.id;
      `, query ? [`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`] : []);

    if (!result) {
      return [];
    }
    if (sort === SortType.ARTIST) {
      const sorted = result.sort((a, b) => a?.name.localeCompare(b?.name));
      return order === SortOrder.ASC ? sorted : sorted.reverse();
    }
    else if (sort === SortType.DATE) {
      return order === SortOrder.ASC ? result : result.reverse();
    }
    return result;
  }

  public async checkForDuplicateName(name: string): Promise<boolean> {
    const result = await ArtistModel.db?.getFirstAsync(`SELECT * FROM artists WHERE name = ?;`, [name]);
    return result ? true : false;
  }

  public async createArtist(name: string): Promise<number> {
    const cleanName = name.trim();
    if (await this.checkForDuplicateName(cleanName)) {
      throw new Error('Artist already exists');
    }
    if (cleanName === '') {
      throw new Error('Artist name is required');
    }
    const result = await ArtistModel.db?.runAsync(`INSERT INTO artists (name) VALUES (?);`, [cleanName]);
    return result?.lastInsertRowId ? result.lastInsertRowId : -1;
  }

  public async deleteArtist(artistId: number): Promise<void> {
    await ArtistModel.db?.runAsync(`DELETE FROM artists WHERE id = ?;`, [artistId]);
    await ArtistModel.db?.runAsync(`DELETE FROM artistSongs WHERE artistId = ?;`, [artistId]);
    await ArtistModel.db?.runAsync(`DELETE FROM artistsAlbums WHERE artistId = ?;`, [artistId]);
  }

  public async getArtistInfo(artistId: number): Promise<ArtistType | null> {
    const result = await ArtistModel.db?.getFirstAsync(`SELECT * FROM artists WHERE id = ?;`, [artistId]);
    return result ? result as ArtistType : null;
  }

  public async updateArtist(artistId: number, name: string): Promise<void> {
    await ArtistModel.db?.runAsync(`UPDATE artists SET name = ? WHERE id = ?;`, [name, artistId]);
  }

  public async addArtistToSong(artistId: number, songId: number): Promise<void> {
    await ArtistModel.db?.runAsync(`
      INSERT INTO artistSongs (artistId, songId) 
      SELECT ?, ? 
      WHERE NOT EXISTS (
        SELECT 1 FROM artistSongs 
        WHERE artistId = ? AND songId = ?
      );`, [artistId, songId, artistId, songId]);
  }

  public async removeArtistFromSong(artistId: number, songId: number): Promise<void> {
    await ArtistModel.db?.runAsync(`DELETE FROM artistSongs WHERE artistId = ? AND songId = ?;`, [artistId, songId]);
  }

  public async isArtistOnSong(artistId: number, songId: number): Promise<boolean> {
    const result = await ArtistModel.db?.getFirstAsync(`SELECT * FROM artistSongs WHERE artistId = ? AND songId = ?;`, [artistId, songId]);
    return result ? true : false;
  }

  public async getArtistsFromSong(songId: number): Promise<ArtistType[]> {
    const result = await ArtistModel.db?.getAllAsync(`
      SELECT artists.*
      FROM artists 
      INNER JOIN artistSongs ON artists.id = artistSongs.artistId 
      WHERE artistSongs.songId = ? 
      ORDER BY artistSongs.rowid;`, [songId]);
    return result ? result as ArtistType[] : [];
  }

  public async getSongsFromArtist(
    artistId: number,
    sort: SortType = SortType.DATE,
    order: SortOrder = SortOrder.DESC,
    query?: string
  ): Promise<SongResultType[]> {
    let result = await ArtistModel.db?.getAllAsync<SongResultType>(`
      SELECT DISTINCT songs.*
      FROM songs
      LEFT JOIN albumSongs ON songs.id = albumSongs.songId
      LEFT JOIN albums ON albumSongs.albumId = albums.id
      LEFT JOIN artistSongs AS mainArtist ON songs.id = mainArtist.songId
      LEFT JOIN (
        SELECT songId, GROUP_CONCAT(artists.name) as all_artists
        FROM artistSongs
        JOIN artists ON artistSongs.artistId = artists.id
        GROUP BY songId
      ) AS otherArtists ON songs.id = otherArtists.songId
      WHERE mainArtist.artistId = ?
      ${query ? 'AND (LOWER(songs.title) LIKE ? OR LOWER(otherArtists.all_artists) LIKE ? OR LOWER(albums.name) LIKE ?)' : ''}
      `, query ? [artistId, `%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`] : [artistId]);
    if (result) {
      result = await Promise.all( result.map(async (song) => {
        const artists = await this.getArtistsFromSong(song.id);
        song.artists = artists.map(artist => artist.name).join(', ');
        const albums = await getAlbumsFromSong(song.id);
        song.album = albums.map(album => album.name).join(', ');
        return song;
      }));
    }
    if (sort === SortType.TITLE) {
      const sorted = result.sort((a, b) => a?.title.localeCompare(b?.title));
      return order === SortOrder.ASC ? sorted : sorted.reverse();
    }
    else if (sort === SortType.ALBUM) {
      const sorted = result.sort((a, b) => a?.album.localeCompare(b?.album));
      return order === SortOrder.ASC ? sorted : sorted.reverse();
    }
    else {
      return result;
    }
  }

}