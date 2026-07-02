import assert from "node:assert/strict";
import {
  getActiveTrack,
  getNextQueueIndex,
  initialPlaybackState,
  playbackReducer,
} from "../../../apps/new/src/features/playback/services/playback-session-service";
import type { PlaybackQueueItem } from "../../../apps/new/src/features/playback/types/playback-state";
import {
  importSessionReducer,
  initialImportSessionState,
} from "../../../apps/new/src/features/import/services/import-session-state-service";
import type { ImportSongDraft } from "../../../apps/new/src/features/import/types/import-session";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
  rowsToCollectionDetailSongs,
} from "../../../apps/new/src/features/library/services/library-collection-detail-service";
import {
  albumRowsToPreview,
  artistRowsToPreview,
  playlistRowsToPreview,
} from "../../../apps/new/src/features/library/services/library-collection-preview-service";
import { rowsToAddableCollectionSongs } from "../../../apps/new/src/features/library/services/addable-collection-songs-service";
import { rowsToSongPreviews } from "../../../apps/new/src/features/library/services/library-song-preview-service";

const song = ({
  duration = 180_000,
  id,
  title,
}: {
  duration?: number;
  id: number;
  title: string;
}): PlaybackQueueItem => ({
  album: "Smoke Album",
  artist: "Smoke Artist",
  duration,
  id,
  pathToFile: `/tmp/${id}.mp3`,
  title,
});

const importDraft = (id: number): ImportSongDraft => ({
  album: "Smoke Album",
  artist: "Smoke Artist",
  artwork: null,
  cacheUri: `/tmp/import-${id}.mp3`,
  duration: 120_000,
  fileName: `import-${id}.mp3`,
  fileType: "audio/mpeg",
  id,
  title: `Import ${id}`,
  track: id,
});

function assertPlaybackSessionSmoke() {
  const first = song({ id: 1, title: "First" });
  const second = song({ id: 2, title: "Second" });
  const third = song({ id: 3, title: "Third" });

  let state = playbackReducer(initialPlaybackState, {
    song: first,
    type: "play-song",
  });
  assert.equal(state.activeTrackId, first.id);
  assert.equal(getActiveTrack(state)?.title, "First");
  assert.equal(state.isPlaying, true);
  assert.equal(state.queueRevision, 1);

  state = playbackReducer(state, { song: second, type: "add-to-queue" });
  state = playbackReducer(state, { song: third, type: "add-to-queue" });
  assert.deepEqual(
    state.queue.map((item) => item.id),
    [1, 2, 3],
  );
  assert.equal(state.queueRevision, 3);

  state = playbackReducer(state, {
    direction: "up",
    songId: third.id,
    type: "move-queue-song",
  });
  assert.deepEqual(
    state.queue.map((item) => item.id),
    [1, 3, 2],
  );
  assert.equal(state.activeQueueIndex, 0);

  state = playbackReducer(state, { songId: first.id, type: "remove-from-queue" });
  assert.equal(state.activeTrackId, third.id);
  assert.equal(state.activeQueueIndex, 0);
  assert.equal(state.isPlaying, true);

  state = playbackReducer(state, { type: "toggle-shuffle" });
  assert.equal(
    getNextQueueIndex({
      activeQueueIndex: state.activeQueueIndex,
      loop: state.mode.loop,
      queue: state.queue,
      random: () => 0,
      shuffle: state.mode.shuffle,
    }),
    1,
  );

  state = playbackReducer(state, {
    premiumActive: false,
    status: {
      didJustFinish: false,
      duration: 600_000,
      isLoaded: true,
      isPlaying: true,
      position: 0,
      songId: third.id,
      source: "library",
    },
    type: "native-status",
  });
  assert.equal(state.adGate.lastTrackedPosition, 0);

  state = playbackReducer(state, {
    premiumActive: false,
    status: {
      didJustFinish: false,
      duration: 600_000,
      isLoaded: true,
      isPlaying: true,
      position: 600_000,
      songId: third.id,
      source: "library",
    },
    type: "native-status",
  });
  assert.equal(state.adGate.due, true);

  state = playbackReducer(state, { type: "begin-ad-break" });
  assert.equal(state.adGate.active, true);
  assert.equal(state.isPlaying, false);

  state = playbackReducer(state, { premiumActive: true, type: "sync-premium" });
  assert.equal(state.adGate.active, false);
  assert.equal(state.adGate.due, false);
  assert.equal(state.isPlaying, true);
}

function assertImportSessionSmoke() {
  const first = importDraft(1);
  const second = importDraft(2);

  let state = importSessionReducer(initialImportSessionState, {
    type: "begin-file-pick",
  });
  assert.equal(state.phase, "picking");
  assert.equal(state.source, "files");

  state = importSessionReducer(state, {
    songs: [first, second],
    type: "review",
  });
  assert.equal(state.phase, "reviewing");
  assert.equal(state.selectedSongId, first.id);
  assert.deepEqual(state.progress, { current: 2, total: 2 });

  state = importSessionReducer(state, {
    song: { ...second, title: "Edited Import 2" },
    type: "update-song",
  });
  assert.equal(state.songs[1]?.title, "Edited Import 2");

  state = importSessionReducer(state, {
    songIds: [first.id],
    type: "remove-songs",
  });
  assert.deepEqual(
    state.songs.map((item) => item.id),
    [second.id],
  );
  assert.equal(state.selectedSongId, second.id);

  state = importSessionReducer(state, {
    shouldSaveToLibrary: false,
    type: "set-save-to-library",
  });
  state = importSessionReducer(state, { type: "saving" });
  assert.equal(state.phase, "discarding");

  state = importSessionReducer(state, {
    summary: { discarded: 1, saved: 0, savedSongIds: [] },
    type: "finish",
  });
  assert.equal(state.phase, "success");
  assert.deepEqual(state.progress, { current: 1, total: 1 });

  state = importSessionReducer(state, {
    total: 2,
    type: "begin-wifi-transfer",
  });
  assert.equal(state.phase, "processing");
  assert.equal(state.source, "wifi");
  assert.equal(state.songs.length, 0);

  state = importSessionReducer(state, {
    song: first,
    type: "receive-wifi-song",
  });
  state = importSessionReducer(state, {
    song: first,
    type: "receive-wifi-song",
  });
  assert.deepEqual(
    state.songs.map((item) => item.id),
    [first.id],
  );
  assert.deepEqual(state.progress, { current: 1, total: 2 });

  state = importSessionReducer(state, { type: "discard" });
  assert.equal(state.phase, "idle");
  assert.equal(state.songs.length, 0);
}

function assertLibraryCollectionDetailSmoke() {
  const songs = rowsToCollectionDetailSongs([
    {
      albumName: "Smoke Album",
      artistName: "Second Artist",
      duration: 120_000,
      pathToFile: "/tmp/second.mp3",
      songId: 2,
      title: "Second",
      track: 2,
    },
    {
      albumName: "Smoke Album",
      artistName: "First Artist",
      duration: 100_000,
      pathToFile: "/tmp/first.mp3",
      songId: 1,
      title: "First",
      track: 1,
    },
    {
      albumName: "Smoke Album",
      artistName: "Featured Artist",
      duration: 100_000,
      pathToFile: "/tmp/first.mp3",
      songId: 1,
      title: "First",
      track: 1,
    },
  ]);

  assert.deepEqual(
    songs.map((item) => item.id),
    [1, 2],
  );
  assert.equal(songs[0]?.artist, "Featured Artist, First Artist");
  assert.equal(songs[0]?.album, "Smoke Album");

  const playlist = buildPlaylistDetail({
    playlistRows: [{ coverImage: null, name: "Smoke Playlist" }],
    songRows: [
      {
        albumName: null,
        artistName: null,
        duration: null,
        pathToFile: null,
        songId: 5,
        title: null,
        track: null,
      },
    ],
    updatedAt: 12,
  });
  assert.equal(playlist.title, "Smoke Playlist");
  assert.equal(playlist.detail, "1 song");
  assert.equal(playlist.songs[0]?.artist, "Unknown");
  assert.equal(playlist.songs[0]?.title, "Untitled song");

  const album = buildAlbumDetail({
    albumRows: [
      {
        artistName: "Album Artist",
        coverImage: null,
        name: "Smoke Album",
        year: 2026,
      },
    ],
    songRows: [],
    updatedAt: 20,
  });
  assert.equal(album.eyebrow, "Album");
  assert.equal(album.meta, "Album Artist / 2026");

  const artist = buildArtistDetail({
    artistRows: [
      { albumId: 1, name: "Smoke Artist", profileImage: null },
      { albumId: 1, name: "Smoke Artist", profileImage: null },
      { albumId: 2, name: "Smoke Artist", profileImage: null },
    ],
    songRows: songs.map((item) => ({
      albumName: item.album,
      artistName: item.artist,
      duration: item.duration,
      pathToFile: item.pathToFile,
      songId: item.id,
      title: item.title,
      track: item.track,
    })),
    updatedAt: 30,
  });
  assert.equal(artist.title, "Smoke Artist");
  assert.equal(artist.detail, "2 songs / 2 albums");
}

function assertLibraryCollectionPreviewSmoke() {
  const getImagePath = (hash: string) => `/images/${hash}-small.jpg`;

  const playlists = playlistRowsToPreview({
    getImagePath,
    limit: 1,
    rows: [
      {
        coverImage: "playlist-cover",
        playlistId: 1,
        playlistName: "First Playlist",
        songId: 10,
      },
      {
        coverImage: "playlist-cover",
        playlistId: 1,
        playlistName: "First Playlist",
        songId: 11,
      },
      {
        coverImage: null,
        playlistId: 2,
        playlistName: null,
        songId: null,
      },
    ],
  });
  assert.equal(playlists.length, 1);
  assert.equal(playlists[0]?.id, 2);
  assert.equal(playlists[0]?.title, "Untitled playlist");
  assert.equal(playlists[0]?.detail, "0 songs");

  const albums = albumRowsToPreview({
    getImagePath,
    limit: null,
    rows: [
      {
        albumCoverImage: "alpha-cover",
        albumId: 2,
        albumName: "Beta Album",
        artistName: "Beta Artist",
        songId: 21,
        year: null,
      },
      {
        albumCoverImage: "alpha-cover",
        albumId: 1,
        albumName: "Alpha Album",
        artistName: "Alpha Artist",
        songId: 20,
        year: 2026,
      },
      {
        albumCoverImage: "alpha-cover",
        albumId: 1,
        albumName: "Alpha Album",
        artistName: "Featured Artist",
        songId: 20,
        year: 2026,
      },
    ],
  });
  assert.deepEqual(
    albums.map((album) => album.title),
    ["Alpha Album", "Beta Album"],
  );
  assert.equal(albums[0]?.detail, "1 song");
  assert.equal(albums[0]?.imagePath, "/images/alpha-cover-small.jpg");
  assert.equal(albums[0]?.meta, "Alpha Artist, Featured Artist / 2026");

  const artists = artistRowsToPreview({
    limit: null,
    rows: [
      {
        albumId: 2,
        artistId: 2,
        artistName: "Beta Artist",
        profileImage: null,
        songId: 31,
      },
      {
        albumId: 1,
        artistId: 1,
        artistName: "Alpha Artist",
        profileImage: "artist-profile",
        songId: 30,
      },
      {
        albumId: 1,
        artistId: 1,
        artistName: "Alpha Artist",
        profileImage: "artist-profile",
        songId: 30,
      },
    ],
    getImagePath,
  });
  assert.deepEqual(
    artists.map((artist) => artist.title),
    ["Alpha Artist", "Beta Artist"],
  );
  assert.equal(artists[0]?.detail, "1 song / 1 album");
  assert.equal(artists[0]?.imagePath, "/images/artist-profile-small.jpg");
}

function assertLibrarySongPreviewSmoke() {
  const previews = rowsToSongPreviews({
    limit: 10,
    order: "desc",
    query: "featured",
    rows: [
      {
        albumName: "Beta Album",
        artistName: "Beta Artist",
        duration: 20_000,
        pathToFile: "/tmp/beta.mp3",
        songId: 2,
        title: "Beta",
      },
      {
        albumName: "Alpha Album",
        artistName: "Alpha Artist",
        duration: 10_000,
        pathToFile: "/tmp/alpha.mp3",
        songId: 1,
        title: "Alpha",
      },
      {
        albumName: "Alpha Album",
        artistName: "Featured Artist",
        duration: 10_000,
        pathToFile: "/tmp/alpha.mp3",
        songId: 1,
        title: "Alpha",
      },
      {
        albumName: null,
        artistName: null,
        duration: null,
        pathToFile: null,
        songId: 3,
        title: "Gamma",
      },
    ],
    sort: "title",
  });
  assert.deepEqual(
    previews.map((song) => song.id),
    [1],
  );
  assert.equal(previews[0]?.artist, "Alpha Artist, Featured Artist");
  assert.equal(previews[0]?.album, "Alpha Album");

  const recentAsc = rowsToSongPreviews({
    limit: 2,
    order: "asc",
    rows: [
      {
        albumName: null,
        artistName: null,
        duration: null,
        pathToFile: null,
        songId: 1,
        title: "Alpha",
      },
      {
        albumName: null,
        artistName: null,
        duration: null,
        pathToFile: null,
        songId: 2,
        title: "Beta",
      },
      {
        albumName: null,
        artistName: null,
        duration: null,
        pathToFile: null,
        songId: 3,
        title: "Gamma",
      },
    ],
    sort: "recent",
  });
  assert.deepEqual(
    recentAsc.map((song) => song.id),
    [1, 2],
  );
  assert.equal(recentAsc[0]?.artist, "Unknown");
}

function assertAddableCollectionSongsSmoke() {
  const songs = rowsToAddableCollectionSongs({
    linkedSongIds: new Set([2]),
    query: "featured",
    rows: [
      {
        albumName: "Second Album",
        artistName: "Second Artist",
        duration: 20_000,
        songId: 2,
        title: "Beta",
      },
      {
        albumName: "First Album",
        artistName: "First Artist",
        duration: 10_000,
        songId: 1,
        title: "Alpha",
      },
      {
        albumName: "First Album",
        artistName: "Featured Artist",
        duration: 10_000,
        songId: 1,
        title: "Alpha",
      },
      {
        albumName: null,
        artistName: null,
        duration: null,
        songId: 3,
        title: null,
      },
    ],
  });
  assert.deepEqual(
    songs.map((song) => song.id),
    [1],
  );
  assert.equal(songs[0]?.artist, "Featured Artist, First Artist");
  assert.equal(songs[0]?.album, "First Album");
  assert.equal(songs[0]?.isLinked, false);

  const sorted = rowsToAddableCollectionSongs({
    linkedSongIds: new Set([1]),
    limit: 2,
    rows: [
      {
        albumName: null,
        artistName: null,
        duration: null,
        songId: 1,
        title: "Alpha",
      },
      {
        albumName: null,
        artistName: null,
        duration: null,
        songId: 2,
        title: "Beta",
      },
      {
        albumName: null,
        artistName: null,
        duration: null,
        songId: 3,
        title: null,
      },
    ],
  });
  assert.deepEqual(
    sorted.map((song) => song.id),
    [2, 3],
  );
  assert.equal(sorted[1]?.artist, "Unknown");
  assert.equal(sorted[1]?.title, "Untitled song");
}

assertPlaybackSessionSmoke();
assertImportSessionSmoke();
assertLibraryCollectionDetailSmoke();
assertLibraryCollectionPreviewSmoke();
assertLibrarySongPreviewSmoke();
assertAddableCollectionSongsSmoke();
console.log("Rewrite deterministic smoke checks passed.");
