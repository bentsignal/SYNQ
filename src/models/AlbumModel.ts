import Model from "./Model";
import { AlbumType, SortType, SongResultType, ArtistType, PageType, SortOrder } from "@/src/constants/Types";
import { getArtistsFromSong } from "@/src/controllers/ArtistController";

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

  public async getAlbums(
    query?: string,
    sort: SortType = SortType.ALBUM,
    order: SortOrder = SortOrder.ASC
  ): Promise<AlbumType[]> {
    const result = await AlbumModel.db?.getAllAsync<AlbumType>(`
      SELECT albums.*, COUNT(artistsAlbums.artistId) as artistCount
      FROM albums
      INNER JOIN artistsAlbums ON albums.id = artistsAlbums.albumId
      LEFT JOIN artists ON artistsAlbums.artistId = artists.id
      ${query ? 'WHERE LOWER(albums.name) LIKE ? OR LOWER(artists.name) LIKE ?' : ''}
      GROUP BY albums.id;
      `, query ? [`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`] : []);
    if (!result) {
      return [];
    }
    if (sort === SortType.ALBUM) {
      const sorted = result.sort((a, b) => {
        if (!a?.name) return 1;
        if (!b?.name) return -1;
        return a.name.localeCompare(b.name);
      });
      return order === SortOrder.DESC ? sorted.reverse() : sorted;
    }
    else if (sort === SortType.DATE) {
      return order === SortOrder.DESC ? result.reverse() : result;
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

  public async addAlbumToSong(albumId: number, songId: number, track?: number): Promise<void> {
    await AlbumModel.db?.runAsync(
      `INSERT INTO albumSongs (albumId, songId, track) VALUES (?, ?, ?);`, 
      [albumId, songId, track || null]
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

  public async getSongsFromAlbum(
    albumId: number,
    sort: SortType = SortType.TRACK,
    order: SortOrder = SortOrder.ASC,
    query?: string
  ): Promise<SongResultType[]> {
    let result = await AlbumModel.db?.getAllAsync<SongResultType>(
      `SELECT DISTINCT songs.*, albumSongs.track 
      FROM songs 
      INNER JOIN albumSongs ON songs.id = albumSongs.songId 
      LEFT JOIN artistSongs ON songs.id = artistSongs.songId
      LEFT JOIN artists ON artistSongs.artistId = artists.id
      WHERE albumSongs.albumId = ?
      ${query ? 'AND (LOWER(songs.title) LIKE ? OR LOWER(artists.name) LIKE ?)' : ''};`, 
      query ? [albumId, `%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`] : [albumId]
    );
    if (result) {
      result = await Promise.all(result.map(async (song) => {
        const artists = await getArtistsFromSong(song.id);
        song.artists = artists.map(artist => artist.name).join(', ');
        const albums = await this.getAlbumsFromSong(song.id);
        song.album = albums.map(album => album.name).join(', ');
        return song;
      }));
    }
    if (sort === SortType.TRACK) {
      const sorted = result.sort((a, b) => {
        if (!a?.track) return 1;
        if (!b?.track) return -1;
        return a.track - b.track;
      });
      return order === SortOrder.ASC ? sorted : sorted.reverse();
    }
    else if (sort === SortType.TITLE) {
      const sorted = result.sort((a, b) => {
        if (!a?.title) return 1;
        if (!b?.title) return -1;
        return a.title.localeCompare(b.title);
      });
      return order === SortOrder.ASC ? sorted : sorted.reverse();
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
      `INSERT OR IGNORE INTO artistsAlbums (artistId, albumId) VALUES (?, ?);`,
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

  public async getAlbumsContainingSong(songId: number): Promise<AlbumType[]> {
    const result = await AlbumModel.db?.getAllAsync(`SELECT * from albums where id in (SELECT albumId from albumSongs where songId = ?);`, [songId]);
    return result ? result as AlbumType[] : [];
  }

  public async getAlbumsFromArtist(artistId: number, query?: string): Promise<AlbumType[]> {
    const result = await AlbumModel.db?.getAllAsync(`
      SELECT DISTINCT albums.*
      FROM albums
      INNER JOIN artistsAlbums ON albums.id = artistsAlbums.albumId
      LEFT JOIN artistsAlbums aa2 ON albums.id = aa2.albumId
      LEFT JOIN artists a2 ON aa2.artistId = a2.id
      WHERE artistsAlbums.artistId = ?
      ${query ? 'AND (LOWER(albums.name) LIKE ? OR LOWER(a2.name) LIKE ?)' : ''}
      `, query ? [artistId, `%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`] : [artistId]);
    return result ? result as AlbumType[] : [];
  }
}
