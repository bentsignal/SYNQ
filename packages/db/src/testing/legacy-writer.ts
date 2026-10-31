import type { DatabaseSync, SQLInputValue } from "node:sqlite";

export interface SongSpec {
  title: string;
  fileName: string;
  type: string;
  seconds: number;
  /** The name on disk when it differs from `fileName`. */
  diskName?: string;
  noFile?: boolean;
  /** The import failed before `addToPlaylist(1, id)`. */
  failed?: boolean;
}

/** 2.5.2's model SQL, statement for statement. */
export class LegacyWriter {
  readonly files: [dir: string, name: string][] = [];
  readonly #db: DatabaseSync;
  readonly #hasTrack: boolean;

  constructor(db: DatabaseSync, hasTrack: boolean) {
    this.#db = db;
    this.#hasTrack = hasTrack;
  }

  raw(sql: string, params: SQLInputValue[] = []): number {
    return Number(this.#db.prepare(sql).run(...params).lastInsertRowid);
  }

  createArtist(name: string) {
    return this.raw("INSERT INTO artists (name) VALUES (?);", [name]);
  }

  createAlbum(name: string, year: number | string | null) {
    return this.raw("INSERT INTO albums (name, year) VALUES (?, ?);", [
      name,
      year,
    ]);
  }

  importSong(spec: SongSpec): number {
    const id = this.raw(
      `INSERT INTO songs (title, artists, album, genre, duration, fileType, fileName, edited)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [spec.title, "", "", "Music", spec.seconds, spec.type, spec.fileName, 0],
    );
    if (!spec.noFile)
      this.files.push([`library/${id}`, spec.diskName ?? spec.fileName]);
    if (!spec.failed) this.addToPlaylist(1, id);
    return id;
  }

  editSong(id: number, title: string, artists: string, album: string) {
    this.raw(
      "UPDATE songs SET title = ?, artists = ?, album = ?, edited = TRUE WHERE id = ?;",
      [title, artists, album, id],
    );
  }

  removeSong(id: number) {
    this.raw("DELETE FROM songs WHERE id = ?;", [id]);
  }

  addArtistToSong(artistId: number, songId: number) {
    this.raw(
      `INSERT INTO artistSongs (artistId, songId)
      SELECT ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM artistSongs WHERE artistId = ? AND songId = ?);`,
      [artistId, songId, artistId, songId],
    );
  }

  addAlbumToSong(albumId: number, songId: number, track: number | null) {
    if (this.#hasTrack) {
      this.raw(
        "INSERT INTO albumSongs (albumId, songId, track) VALUES (?, ?, ?);",
        [albumId, songId, track],
      );
    } else {
      this.raw("INSERT INTO albumSongs (albumId, songId) VALUES (?, ?);", [
        albumId,
        songId,
      ]);
    }
  }

  /** `INSERT OR IGNORE` without a unique constraint: it never ignores. */
  addArtistToAlbum(artistId: number, albumId: number) {
    this.raw(
      "INSERT OR IGNORE INTO artistsAlbums (artistId, albumId) VALUES (?, ?);",
      [artistId, albumId],
    );
  }

  createPlaylist(name: string) {
    return this.raw("INSERT INTO playlists (name) VALUES (?);", [name]);
  }

  updatePlaylist(id: number, name: string) {
    this.raw("UPDATE playlists SET name = ? WHERE id = ?;", [name, id]);
  }

  deletePlaylist(id: number) {
    this.raw("DELETE FROM playlists WHERE id = ?;", [id]);
  }

  addToPlaylist(playlistId: number, songId: number) {
    this.raw("INSERT INTO playlistSongs (playlistId, songId) VALUES (?, ?);", [
      playlistId,
      songId,
    ]);
  }

  removeFromAllPlaylists(songId: number) {
    this.raw("DELETE FROM playlistSongs WHERE songId = ?;", [songId]);
  }
}
