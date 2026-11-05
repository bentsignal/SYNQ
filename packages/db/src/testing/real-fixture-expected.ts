/**
 * The library the real 2.5.2 fixture (`fixtures/legacy-2.5.2/EXPECTED.md`)
 * must migrate to, in 2.5.2's terms: ids, names, join-table order, and
 * artwork as presence (its version is a cover mtime, which a checkout or an
 * unzip resets). File names are NFC; `real-fixture.test.ts` compares them
 * ignoring normalization and checks the on-disk bytes separately.
 */
import { NOW } from "./run-import.ts";

// Songs, in id order: [id, title, file name, MIME type, seconds, edited, own cover].
const SONGS = [
  [1, "Headlights", "01 Headlights.mp3", "audio/mpeg", 12, true, false],
  [2, "Overpass", "02 Overpass.mp3", "audio/mpeg", 9, true, false],
  [
    3,
    "Static Bloom (2024 Remaster)",
    "03 Static Bloom.mp3",
    "audio/mpeg",
    15,
    true,
    false,
  ],
  [4, "Exit 9 (Ending)", "Exit 9 (Ending).mp3", "audio/mpeg", 19, true, false],
  [
    5,
    "An Extremely Long Song Title That Should Definitely Truncate In Every List Row (Extended Mix)",
    "An Extremely Long Song Title (Extended Mix).m4a",
    "audio/x-m4a",
    16,
    true,
    false,
  ],
  [
    6,
    "Foundations",
    "Blueprints - Foundations.m4a",
    "audio/x-m4a",
    9,
    false,
    false,
  ],
  [
    7,
    "Scaffold & Steel",
    "Blueprints - Scaffold & Steel.m4a",
    "audio/x-m4a",
    7,
    false,
    false,
  ],
  [8, "Keystone", "Blueprints - Keystone.m4a", "audio/x-m4a", 13, false, false],
  [9, "Interlude", "interlude.mp3", "audio/mpeg", 6, false, false],
  [10, "Café Ünïcødé", "Café Ünïcødé.mp3", "audio/mpeg", 13, false, true],
  [
    11,
    "東京の夜 (Tokyo Night)",
    "東京の夜.m4a",
    "audio/x-m4a",
    15,
    false,
    false,
  ],
  // Untitled in 2.5.2 (it showed the file name): titled from the file name.
  [13, "No Tags At All", "No Tags At All.mp3", "audio/mpeg", 7, false, false],
  [14, "LOUD", "LOUD.MP3", "audio/mpeg", 8, false, false],
  [15, "field recording", "field recording.wav", "audio/wav", 6, false, false],
  [
    16,
    "Voice Memo 2024-05-01",
    "Voice Memo 2024-05-01.wav",
    "audio/wav",
    5,
    false,
    false,
  ],
  [17, "Lost Signal", "05 Lost Signal.mp3", "audio/mpeg", 11, false, false],
  [
    18,
    "Saoirse Ní Bhriain - Dew Point",
    "Saoirse Ní Bhriain - Dew Point.flac",
    "audio/flac",
    5,
    false,
    false,
  ],
  [19, "Fern Light", "02 Fern Light.flac", "audio/flac", 6, false, false],
  [20, "Glasshouse", "01 Glasshouse.flac", "audio/flac", 7, false, false],
] as const;

const ARTISTS = [
  [1, "Neon Coast", true],
  [2, "Mira Vale", false],
  [3, "Lúa Moreno", false],
  [4, "Kaito Mori", false],
  [5, "Marlow", false],
  [6, "The Architect", false],
  [7, "Saoirse Ní Bhriain", false],
] as const;

const ALBUMS = [
  [1, "Night Drive", 2021, true],
  [2, "Blueprints", 2018, true],
  [3, "Transmissions", null, false],
  [4, "Glass Garden", 2023, true],
  [5, "Mixtape Vol. 1", 2024, false],
] as const;

const PLAYLISTS = [
  [2, "Liked Songs", "liked", false],
  [3, "Late Night", "user", true],
  [4, "Road Trip ’26 🚗", "user", false],
  [5, "Focus", "user", false],
] as const;

/** Song → its artists, in 2.5.2's credit order (artistSongs rowid order). */
const SONG_ARTISTS = {
  1: [1],
  2: [1, 2, 3],
  3: [1],
  4: [1],
  5: [1, 2, 3, 4],
  6: [5, 6],
  7: [5, 6, 1],
  8: [5, 6],
  9: [2],
  10: [3, 2],
  11: [4, 2, 3],
  17: [2, 3],
  19: [7],
  20: [7],
};

/**
 * Song → [album, track]. 2.5.2 also had Overpass (2) on Mixtape Vol. 1 #2 and
 * Lost Signal (17) on Mixtape Vol. 1 #3; each keeps one album, the first with
 * a cover, else the first (`oneAlbumEach`).
 */
const SONG_ALBUMS = {
  1: [[1, 1]],
  2: [[1, 2]],
  3: [[1, 3]],
  4: [[1, 4]],
  5: [[1, 5]],
  // Stored packed as 196609..196611 ("n of 3" read as one integer).
  6: [[2, 1]],
  7: [[2, 2]],
  8: [[2, 3]],
  9: [[3, 7]],
  10: [[5, 4]],
  11: [[5, 1]],
  17: [[3, 5]],
  19: [[4, 2]],
  20: [[4, 1]],
};

/** Album → its artists, in artistsAlbums rowid order. */
const ALBUM_ARTISTS = {
  1: [1, 2, 3, 4],
  2: [5, 6, 1],
  3: [2],
  4: [7],
  5: [2, 3],
};

/** Playlist → [playlistSongs id, song] in add order (what 3.0 keeps). */
const PLAYLIST_SONGS = {
  2: [
    [41, 2],
    [42, 20],
    [43, 10],
    [45, 8],
    [46, 11],
  ],
  3: [
    [33, 4],
    [34, 11],
    [35, 9],
    [37, 18],
    [38, 1],
  ],
  4: [
    [27, 1],
    [28, 2],
    [29, 3],
    [30, 6],
    [31, 7],
    [32, 14],
  ],
  5: [
    [22, 20],
    [23, 19],
    [24, 8],
    [25, 17],
    [26, 15],
  ],
};

function grouped<T, R>(
  groups: Record<number, readonly T[]>,
  row: (key: number, value: T, position: number) => R,
) {
  return Object.entries(groups).flatMap(([key, values]) =>
    values.map((value, position) => row(Number(key), value, position)),
  );
}

/**
 * The whole library in 2.5.2's terms, imported at `now`; artwork as
 * presence, file names NFC. `fileNames` replaces songs' file names, for a
 * copy of the fixture with a file renamed.
 */
export function expectedLibrary(
  now = NOW,
  fileNames: Readonly<Record<number, string>> = {},
) {
  return {
    songs: SONGS.map(
      ([id, title, fileName, mimeType, seconds, edited, cover], index) => ({
        id,
        title,
        filePath: `library/${id}/${fileNames[id] ?? fileName}`,
        mimeType,
        durationMs: seconds * 1000,
        artwork: cover,
        addedAt: now - SONGS.length + index,
        modifiedSinceExport: edited,
      }),
    ),
    artists: ARTISTS.map(([id, name, artwork], index) => ({
      id,
      name,
      artwork,
      addedAt: now - ARTISTS.length + index,
    })),
    albums: ALBUMS.map(([id, name, year, artwork], index) => ({
      id,
      name,
      year,
      artwork,
      addedAt: now - ALBUMS.length + index,
    })),
    playlists: PLAYLISTS.map(([id, name, kind, artwork], index) => ({
      id,
      name,
      kind,
      artwork,
      createdAt: now - PLAYLISTS.length + index,
      updatedAt: now - PLAYLISTS.length + index,
    })),
    songArtists: grouped(SONG_ARTISTS, (songId, artistId, position) => ({
      songId,
      artistId,
      position,
    })),
    albumSongs: grouped(SONG_ALBUMS, (songId, [albumId, track], position) => ({
      albumId,
      songId,
      track,
      position,
    })),
    albumArtists: grouped(ALBUM_ARTISTS, (albumId, artistId, position) => ({
      albumId,
      artistId,
      position,
    })),
    playlistSongs: grouped(
      PLAYLIST_SONGS,
      (playlistId, [id, songId], position) => ({
        id,
        playlistId,
        songId,
        position: position + 1,
      }),
    ),
  };
}
