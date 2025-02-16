import Model from './Model';
import { PlaylistType, SongResultType, SortOrder, SortType } from '@/src/constants/Types';
import { getArtistsFromSong } from '../controllers/ArtistController';
import { getAlbumsFromSong } from '../controllers/AlbumController';

export default class PlaylistModel extends Model {

  private static instance: PlaylistModel;

  constructor() {
    super();  
  }

  public static getInstance(): PlaylistModel {
    if (!PlaylistModel.instance) {
      PlaylistModel.instance = new PlaylistModel();
    }
    return PlaylistModel.instance;
  }

  public async getPlaylists(query?: string): Promise<PlaylistType[]> {
    try {
      const result = await PlaylistModel.db?.getAllAsync(`
        SELECT playlists.*, COUNT(playlistSongs.songId) as songCount 
        FROM playlists
        LEFT JOIN playlistSongs ON playlists.id = playlistSongs.playlistId
        ${query ? 'WHERE LOWER(playlists.name) LIKE ?' : ''}
        GROUP BY playlists.id;
      `, query ? [`%${query.toLowerCase()}%`] : []);
      return result as PlaylistType[];
    }
    catch (error) {
      throw new Error('Error getting playlists: ' + error);
    }
  }

  public async getPlaylistInfoById(id: number): Promise<PlaylistType | null> {
    try {
      const result = await PlaylistModel.db?.getFirstAsync(`
        SELECT playlists.*, COUNT(playlistSongs.songId) as songCount 
        FROM playlists
        LEFT JOIN playlistSongs ON playlists.id = playlistSongs.playlistId
        WHERE playlists.id = ?;
      `, [id]);
      return result ? result as PlaylistType : null;
    }
    catch (error) {
      throw new Error('Error getting playlist by id: ' + error);
    }
  }

  public async getSongsFromPlaylist(
    playlistId: number,
    sort: SortType = SortType.NEWEST,
    order: SortOrder = SortOrder.DESC,
    query?: string
  ): Promise<SongResultType[]> {
    try {
      if (!PlaylistModel.db) {
        await PlaylistModel.initConnection();
      }
      let result = await PlaylistModel.db?.getAllAsync<SongResultType>(`
        SELECT DISTINCT songs.* 
        FROM songs
        INNER JOIN playlistSongs ON songs.id = playlistSongs.songId
        LEFT JOIN albumSongs ON songs.id = albumSongs.songId
        LEFT JOIN albums ON albumSongs.albumId = albums.id
        LEFT JOIN artistSongs ON songs.id = artistSongs.songId
        LEFT JOIN artists ON artistSongs.artistId = artists.id
        WHERE playlistSongs.playlistId = ?
        ${query ? 'AND (LOWER(songs.title) LIKE ? OR LOWER(artists.name) LIKE ? OR LOWER(albums.name) LIKE ?)' : ''};
      `, query ? [playlistId, `%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`] : [playlistId]);

      if (!result) {
        return [];
      }

      result = await Promise.all( result.map(async (song) => {
        const artists = await getArtistsFromSong(song.id);
        song.artists = artists.map(artist => artist.name).join(', ');
        const albums = await getAlbumsFromSong(song.id);
        song.album = albums.map(album => album.name).join(', ');
        return song;
      }));

      if (!result) {
        return [];
      }
      if (sort === SortType.DATE) {
        return order === SortOrder.DESC ? result.reverse() : result;
      }
      else if (sort === SortType.TITLE) {
        const sorted = result.sort((a, b) => a?.title.localeCompare(b?.title));
        return order === SortOrder.DESC ? sorted.reverse() : sorted;
      }
      else if (sort === SortType.ARTIST) {
        const sorted = result.sort((a, b) => a?.artists.localeCompare(b?.artists));
        return order === SortOrder.DESC ? sorted.reverse() : sorted;
      }
      else if (sort === SortType.ALBUM) {
        const sorted = result.sort((a, b) => a?.album.localeCompare(b?.album));
        return order === SortOrder.DESC ? sorted.reverse() : sorted;
      }
      return result;
    }
    catch (error) {
      throw new Error('Error getting songs from playlist: ' + error);
    }
  }

  public async addToPlaylist(playlistId: number, songId: number): Promise<boolean> {
    try {
      await PlaylistModel.db?.runAsync(`INSERT INTO playlistSongs (playlistId, songId) VALUES (?, ?);`, [playlistId, songId]);
      return true;
    }
    catch (error) {
      throw new Error('Error adding to playlist: ' + error);
    }
  }

  public async removeFromPlaylist(playlistId: number, songId: number): Promise<boolean> {
    try {
      await PlaylistModel.db?.runAsync(
        `DELETE FROM playlistSongs WHERE playlistId = ? AND songId = ?;`, 
        [playlistId, songId]
      );
      return true;
    }
    catch (error) {
      throw new Error('Error removing from playlist: ' + error);
    }
  }

  public async checkForDuplicateName(name: string): Promise<boolean> {
    const result = await PlaylistModel.db?.getFirstAsync(`SELECT * FROM playlists WHERE name = ?;`, [name]);
    return result ? true : false;
  }

  public async createPlaylist(name: string): Promise<number> {
    try {
      if (await this.checkForDuplicateName(name)) {
        throw new Error('Playlist already exists');
      }
      const result = await PlaylistModel.db?.runAsync(`INSERT INTO playlists (name) VALUES (?);`, [name]);
      return result?.lastInsertRowId ? result.lastInsertRowId : -1;
    }
    catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async deletePlaylist(playlistId: number): Promise<boolean> {
    await PlaylistModel.db?.runAsync(`DELETE FROM playlists WHERE id = ?;`, [playlistId]);
    return true;
  }

  public async updatePlaylist(playlistId: number, name: string): Promise<boolean> {
    if (await this.checkForDuplicateName(name)) {
      throw new Error('Playlist already exists');
    }
    await PlaylistModel.db?.runAsync(`UPDATE playlists SET name = ? WHERE id = ?;`, [name, playlistId]);
    return true;
  }

  public async isSongInPlaylist(playlistId: number, songId: number): Promise<boolean> {
    const result = await PlaylistModel.db?.getFirstAsync(
      `SELECT * FROM playlistSongs WHERE playlistId = ? AND songId = ?;`, 
      [playlistId, songId]
    );
    return result ? true : false;
  }

  public async getPlaylistsContainingSong(songId: number): Promise<PlaylistType[]> {
    const result = await PlaylistModel.db?.getAllAsync(`SELECT * from playlists where id in (SELECT playlistId from playlistSongs where songId = ?);`, [songId]);
    return result ? result as PlaylistType[] : [];
  }

}

