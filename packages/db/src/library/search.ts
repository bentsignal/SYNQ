import type { LibraryDb } from "../client.ts";
import { loadAlbumItems, sortAlbums, type AlbumListItem } from "./albums.ts";
import { listArtists, type ArtistListItem } from "./artists.ts";
import { listPlaylists, type PlaylistListItem } from "./playlists.ts";
import { loadSongItems, songSearchFields, type SongListItem } from "./song-items.ts";
import { sortSongs } from "./songs.ts";
import { matchesSearch, searchTerms } from "./text.ts";

export interface LibrarySearchResults {
  songs: SongListItem[];
  albums: AlbumListItem[];
  artists: ArtistListItem[];
  playlists: PlaylistListItem[];
}

/**
 * The Search tab: each kind matched on its own names (songs on title,
 * artists, and albums; albums on name and artists; artists and playlists on
 * name), sorted by name. An empty query returns nothing.
 */
export function searchLibrary(db: LibraryDb, query: string): LibrarySearchResults {
  if (searchTerms(query).length === 0) return { songs: [], albums: [], artists: [], playlists: [] };
  return {
    songs: sortSongs(
      loadSongItems(db).filter((song) => matchesSearch(query, songSearchFields(song))),
      "title",
      "asc",
    ),
    albums: sortAlbums(
      loadAlbumItems(db).filter((album) => matchesSearch(query, [album.name, ...album.artists.map((a) => a.name)])),
      "name",
      "asc",
    ),
    artists: listArtists(db, { sort: "name", order: "asc" }).filter((artist) => matchesSearch(query, [artist.name])),
    playlists: listPlaylists(db, { sort: "name", order: "asc", search: query }),
  };
}
