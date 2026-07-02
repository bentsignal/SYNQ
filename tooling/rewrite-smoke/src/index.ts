import assert from "node:assert/strict";
import {
  formatDurationMs,
  formatRemainingDurationMs,
} from "../../../apps/new/src/features/app-shell/services/duration-format-service";
import { parseNumericRouteParam } from "../../../apps/new/src/features/app-shell/services/route-param-service";
import {
  getActiveTrack,
  getNextQueueIndex,
  initialPlaybackState,
  playbackReducer,
} from "../../../apps/new/src/features/playback/services/playback-session-service";
import {
  getFreeListeningRemainingMs,
  getPlaybackProgressPercent,
  getSeekTargetPosition,
} from "../../../apps/new/src/features/playback/services/playback-player-state-service";
import type { PlaybackQueueItem } from "../../../apps/new/src/features/playback/types/playback-state";
import {
  getImportFilesActionState,
  getImportSaveActionState,
  getImportWifiState,
  importSessionReducer,
  initialImportSessionState,
} from "../../../apps/new/src/features/import/services/import-session-state-service";
import {
  buildEditedImportSongDraft,
  parseImportTrackInput,
} from "../../../apps/new/src/features/import/services/import-song-form-service";
import type { ImportSongDraft } from "../../../apps/new/src/features/import/types/import-session";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
  rowsToCollectionDetailSongs,
} from "../../../apps/new/src/features/library/services/library-collection-detail-service";
import {
  canDeleteLibraryCollection,
  getAddableSongRowState,
  getCollectionListHref,
  getPlayableCollectionSongs,
  getSelectedAddableSongIds,
  removeSongIdSelection,
  reorderCollectionSongs,
  toggleSongIdSelection,
} from "../../../apps/new/src/features/library/services/library-collection-interaction-service";
import {
  albumRowsToPreview,
  artistRowsToPreview,
  getLibraryCollectionPreviewHref,
  playlistRowsToPreview,
} from "../../../apps/new/src/features/library/services/library-collection-preview-service";
import { parseAlbumYearInput } from "../../../apps/new/src/features/library/services/collection-form-service";
import { rowsToAddableCollectionSongs } from "../../../apps/new/src/features/library/services/addable-collection-songs-service";
import { buildEditCollectionState } from "../../../apps/new/src/features/library/services/edit-collection-query-service";
import { filterCollectionPreviews } from "../../../apps/new/src/features/library/services/library-collection-list-service";
import {
  buildLibrarySongDetail,
  getLibrarySongDetailActionState,
  getLibrarySongRelationshipHref,
} from "../../../apps/new/src/features/library/services/library-song-detail-service";
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

function assertPlaybackPlayerStateSmoke() {
  assert.equal(
    getPlaybackProgressPercent({ duration: 0, position: 5_000 }),
    0,
  );
  assert.equal(
    getPlaybackProgressPercent({ duration: 100_000, position: -10_000 }),
    0,
  );
  assert.equal(
    getPlaybackProgressPercent({ duration: 100_000, position: 45_000 }),
    45,
  );
  assert.equal(
    getPlaybackProgressPercent({ duration: 100_000, position: 150_000 }),
    100,
  );
  assert.equal(
    getFreeListeningRemainingMs({
      accumulatedMs: 120_000,
      thresholdMs: 600_000,
    }),
    480_000,
  );
  assert.equal(
    getFreeListeningRemainingMs({
      accumulatedMs: 700_000,
      thresholdMs: 600_000,
    }),
    0,
  );
  assert.equal(
    getSeekTargetPosition({
      direction: "backward",
      duration: 120_000,
      position: 5_000,
    }),
    0,
  );
  assert.equal(
    getSeekTargetPosition({
      direction: "forward",
      duration: 120_000,
      position: 110_000,
    }),
    120_000,
  );
  assert.equal(
    getSeekTargetPosition({
      direction: "forward",
      duration: 120_000,
      position: 60_000,
      stepMs: 10_000,
    }),
    70_000,
  );
}

function assertImportSessionSmoke() {
  const first = importDraft(1);
  const second = importDraft(2);

  let state = importSessionReducer(initialImportSessionState, {
    type: "begin-file-pick",
  });
  assert.equal(state.phase, "picking");
  assert.equal(state.source, "files");
  assert.deepEqual(getImportFilesActionState(state), {
    canChooseFiles: false,
    chooseLabel: "Choosing",
    isWorking: true,
  });
  assert.deepEqual(
    getImportSaveActionState({ isExporting: false, state }),
    {
      canDiscard: true,
      canExport: false,
      canFinish: false,
      hasSongs: false,
      isWorking: false,
    },
  );

  state = importSessionReducer(state, {
    songs: [first, second],
    type: "review",
  });
  assert.equal(state.phase, "reviewing");
  assert.equal(state.selectedSongId, first.id);
  assert.deepEqual(state.progress, { current: 2, total: 2 });
  assert.deepEqual(getImportFilesActionState(state), {
    canChooseFiles: true,
    chooseLabel: "Choose songs",
    isWorking: false,
  });
  assert.deepEqual(
    getImportSaveActionState({ isExporting: false, state }),
    {
      canDiscard: true,
      canExport: true,
      canFinish: true,
      hasSongs: true,
      isWorking: false,
    },
  );
  assert.deepEqual(
    getImportSaveActionState({ isExporting: true, state }),
    {
      canDiscard: false,
      canExport: false,
      canFinish: false,
      hasSongs: true,
      isWorking: true,
    },
  );

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
  assert.deepEqual(
    getImportSaveActionState({ isExporting: false, state }),
    {
      canDiscard: false,
      canExport: false,
      canFinish: false,
      hasSongs: true,
      isWorking: true,
    },
  );

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
  assert.deepEqual(
    getImportWifiState({
      error: null,
      isReady: true,
      state,
    }),
    {
      canReviewSave: false,
      hasSongs: false,
      isTransferring: true,
      progressLabel: "0/2 received",
      statusLabel: "Receiving files",
    },
  );
  assert.equal(
    getImportWifiState({
      error: "Port unavailable",
      isReady: false,
      state,
    }).statusLabel,
    "Server failed",
  );

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
  assert.deepEqual(
    getImportWifiState({
      error: null,
      isReady: true,
      state,
    }),
    {
      canReviewSave: true,
      hasSongs: true,
      isTransferring: true,
      progressLabel: "1/2 received",
      statusLabel: "Receiving files",
    },
  );

  const readyState = {
    ...state,
    phase: "reviewing" as const,
  };
  assert.equal(
    getImportWifiState({
      error: null,
      isReady: true,
      state: readyState,
    }).statusLabel,
    "Server ready",
  );

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

function assertLibraryCollectionInteractionSmoke() {
  const songs = rowsToCollectionDetailSongs([
    {
      albumName: "Smoke Album",
      artistName: "Smoke Artist",
      duration: 100_000,
      pathToFile: "/tmp/first.mp3",
      songId: 1,
      title: "First",
      track: 1,
    },
    {
      albumName: "Smoke Album",
      artistName: "Smoke Artist",
      duration: 100_000,
      pathToFile: null,
      songId: 2,
      title: "Second",
      track: 2,
    },
    {
      albumName: "Smoke Album",
      artistName: "Smoke Artist",
      duration: 100_000,
      pathToFile: "/tmp/third.mp3",
      songId: 3,
      title: "Third",
      track: 3,
    },
  ]);

  assert.deepEqual(
    getPlayableCollectionSongs(songs).map((song) => song.id),
    [1, 3],
  );
  assert.deepEqual(
    reorderCollectionSongs({ direction: "down", songId: 1, songs }).map(
      (song) => song.id,
    ),
    [2, 1, 3],
  );
  assert.deepEqual(
    reorderCollectionSongs({ direction: "up", songId: 3, songs }).map(
      (song) => song.id,
    ),
    [1, 3, 2],
  );
  assert.equal(
    reorderCollectionSongs({ direction: "up", songId: 1, songs }),
    songs,
  );
  assert.equal(
    reorderCollectionSongs({ direction: "down", songId: 99, songs }),
    songs,
  );
  assert.equal(getCollectionListHref("album"), "/(tabs)/library/albums");
  assert.equal(getCollectionListHref("artist"), "/(tabs)/library/artists");
  assert.equal(getCollectionListHref("playlist"), "/(tabs)/library/playlists");
  assert.equal(
    canDeleteLibraryCollection({
      id: 3,
      isMissing: false,
      kind: "playlist",
    }),
    true,
  );
  assert.equal(
    canDeleteLibraryCollection({
      id: 1,
      isMissing: false,
      kind: "playlist",
    }),
    false,
  );
  assert.equal(
    canDeleteLibraryCollection({
      id: 2,
      isMissing: false,
      kind: "playlist",
    }),
    false,
  );
  assert.equal(
    canDeleteLibraryCollection({
      id: 1,
      isMissing: false,
      kind: "album",
    }),
    true,
  );
  assert.equal(
    canDeleteLibraryCollection({
      id: 3,
      isMissing: true,
      kind: "artist",
    }),
    false,
  );

  const addableSongs = [
    {
      album: "Smoke Album",
      artist: "Smoke Artist",
      duration: 100_000,
      id: 1,
      isLinked: false,
      title: "First",
    },
    {
      album: "Smoke Album",
      artist: "Smoke Artist",
      duration: 100_000,
      id: 2,
      isLinked: true,
      title: "Second",
    },
    {
      album: "Smoke Album",
      artist: "Smoke Artist",
      duration: 100_000,
      id: 3,
      isLinked: false,
      title: "Third",
    },
  ];
  assert.deepEqual(
    getSelectedAddableSongIds({
      selectedSongIds: new Set([1, 2, 99]),
      songs: addableSongs,
    }),
    [1],
  );

  const selected = toggleSongIdSelection({
    selectedSongIds: new Set([1]),
    songId: 3,
  });
  assert.deepEqual(Array.from(selected).sort(), [1, 3]);
  assert.deepEqual(
    Array.from(
      toggleSongIdSelection({ selectedSongIds: selected, songId: 1 }),
    ).sort(),
    [3],
  );
  assert.deepEqual(
    Array.from(
      removeSongIdSelection({ selectedSongIds: new Set([1, 3]), songId: 3 }),
    ),
    [1],
  );
  assert.deepEqual(
    getAddableSongRowState({
      savingSongId: null,
      selectedSongIds: new Set([1]),
      song: addableSongs[0]!,
    }),
    { isDisabled: false, isSaving: false, isSelected: true },
  );
  assert.deepEqual(
    getAddableSongRowState({
      savingSongId: 1,
      selectedSongIds: new Set([1]),
      song: addableSongs[0]!,
    }),
    { isDisabled: true, isSaving: true, isSelected: true },
  );
  assert.deepEqual(
    getAddableSongRowState({
      savingSongId: null,
      selectedSongIds: new Set([2]),
      song: addableSongs[1]!,
    }),
    { isDisabled: true, isSaving: false, isSelected: false },
  );
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
  assert.equal(
    getLibraryCollectionPreviewHref({
      id: 2,
      kind: "playlists",
    }),
    "/(tabs)/library/playlist/2",
  );

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
  assert.equal(
    getLibraryCollectionPreviewHref({
      id: 1,
      kind: "albums",
    }),
    "/(tabs)/library/album/1",
  );

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
  assert.equal(
    getLibraryCollectionPreviewHref({
      id: 1,
      kind: "artists",
    }),
    "/(tabs)/library/artist/1",
  );
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

function assertLibrarySongDetailSmoke() {
  const detail = buildLibrarySongDetail({
    albumRows: [
      { id: 2, name: "Beta Album", track: 2, year: null },
      { id: 1, name: "Alpha Album", track: 1, year: 2026 },
      { id: 1, name: "Alpha Album", track: 1, year: 2026 },
    ],
    artistRows: [
      { id: 2, name: "Beta Artist" },
      { id: 1, name: "Alpha Artist" },
      { id: 1, name: "Alpha Artist" },
    ],
    likedRows: [{ id: 10 }],
    playlistRows: [
      { id: 5, name: "Smoke Playlist" },
      { id: 5, name: "Smoke Playlist" },
      { id: 6, name: null },
    ],
    songRow: {
      duration: 125_000,
      fileType: "audio/mpeg",
      originalFileName: "alpha.mp3",
      pathToFile: "/tmp/alpha.mp3",
      title: "Alpha",
    },
    updatedAt: 42,
  });

  assert.equal(detail.title, "Alpha");
  assert.equal(detail.durationLabel, "2:05");
  assert.equal(detail.artistLabel, "Alpha Artist, Beta Artist");
  assert.equal(detail.albumLabel, "Alpha Album, Beta Album");
  assert.equal(detail.relationshipSummary, "2 artists / 2 albums / 2 playlists");
  assert.equal(detail.isLiked, true);
  assert.equal(detail.isMissing, false);
  assert.deepEqual(
    detail.albums.map((album) => `${album.id}:${album.detail}`),
    ["2:Album", "1:2026"],
  );
  assert.deepEqual(
    detail.playlists.map((playlist) => playlist.title),
    ["Smoke Playlist", "Untitled playlist"],
  );
  assert.equal(
    getLibrarySongRelationshipHref({ id: 1, kind: "album" }),
    "/(tabs)/library/album/1",
  );
  assert.equal(
    getLibrarySongRelationshipHref({ id: 2, kind: "artist" }),
    "/(tabs)/library/artist/2",
  );
  assert.equal(
    getLibrarySongRelationshipHref({ id: 3, kind: "playlist" }),
    "/(tabs)/library/playlist/3",
  );
  assert.deepEqual(
    getLibrarySongDetailActionState({
      detail,
      isDeleting: false,
      isExporting: false,
      isTogglingLiked: false,
    }),
    {
      canDelete: true,
      canExport: true,
      canPlay: true,
      canToggleLiked: true,
    },
  );
  assert.equal(
    getLibrarySongDetailActionState({
      detail,
      isDeleting: false,
      isExporting: true,
      isTogglingLiked: false,
    }).canExport,
    false,
  );

  const missing = buildLibrarySongDetail({
    albumRows: [],
    artistRows: [],
    likedRows: [],
    playlistRows: [],
    songRow: null,
    updatedAt: 0,
  });
  assert.equal(missing.title, "Song not found");
  assert.equal(missing.durationLabel, "--:--");
  assert.equal(missing.fileType, "Unknown file type");
  assert.equal(missing.originalFileName, "Unknown source file");
  assert.equal(missing.artistLabel, "Unknown");
  assert.equal(missing.isMissing, true);
  assert.deepEqual(
    getLibrarySongDetailActionState({
      detail: missing,
      isDeleting: false,
      isExporting: false,
      isTogglingLiked: false,
    }),
    {
      canDelete: false,
      canExport: false,
      canPlay: false,
      canToggleLiked: false,
    },
  );
}

function assertEditCollectionQuerySmoke() {
  const getImagePath = (hash: string) => `/images/${hash}-small.jpg`;

  const album = buildEditCollectionState({
    albumRow: { coverImage: "album-cover", name: "Smoke Album", year: 2026 },
    getImagePath,
    hasLoaded: true,
    kind: "album",
  });
  assert.equal(album.name, "Smoke Album");
  assert.equal(album.year, "2026");
  assert.equal(album.imagePath, "/images/album-cover-small.jpg");
  assert.equal(album.isMissing, false);

  const artist = buildEditCollectionState({
    artistRow: { name: null, profileImage: "artist-profile" },
    getImagePath,
    hasLoaded: true,
    kind: "artist",
  });
  assert.equal(artist.name, "");
  assert.equal(artist.year, "");
  assert.equal(artist.imagePath, "/images/artist-profile-small.jpg");

  const playlist = buildEditCollectionState({
    getImagePath,
    hasLoaded: true,
    kind: "playlist",
    playlistRow: undefined,
  });
  assert.equal(playlist.isMissing, true);
  assert.equal(playlist.imagePath, null);
  assert.equal(playlist.name, "");
}

function assertCollectionFormSmoke() {
  assert.equal(parseAlbumYearInput(""), undefined);
  assert.equal(parseAlbumYearInput("   "), undefined);
  assert.equal(parseAlbumYearInput("0"), 0);
  assert.equal(parseAlbumYearInput(" 2026 "), 2026);
  assert.throws(
    () => parseAlbumYearInput("-1"),
    /Album year must be a positive whole number/,
  );
  assert.throws(
    () => parseAlbumYearInput("2026.5"),
    /Album year must be a positive whole number/,
  );
  assert.throws(
    () => parseAlbumYearInput("future-ish"),
    /Album year must be a positive whole number/,
  );
}

function assertLibraryCollectionListSmoke() {
  const collections = [
    {
      detail: "2 songs",
      id: 1,
      imagePath: null,
      kind: "albums" as const,
      meta: "Alpha Artist / 2026",
      title: "Alpha Album",
    },
    {
      detail: "5 songs",
      id: 2,
      imagePath: null,
      kind: "artists" as const,
      meta: "Artist",
      title: "Beta Artist",
    },
    {
      detail: "12 songs",
      id: 3,
      imagePath: null,
      kind: "playlists" as const,
      meta: "Playlist",
      title: "Road Mix",
    },
  ];

  assert.deepEqual(
    filterCollectionPreviews({ collections, query: "" }).map(
      (collection) => collection.id,
    ),
    [1, 2, 3],
  );
  assert.deepEqual(
    filterCollectionPreviews({ collections, query: " alpha artist " }).map(
      (collection) => collection.id,
    ),
    [1],
  );
  assert.deepEqual(
    filterCollectionPreviews({ collections, query: "12 SONGS" }).map(
      (collection) => collection.id,
    ),
    [3],
  );
  assert.deepEqual(
    filterCollectionPreviews({ collections, query: "missing" }),
    [],
  );
}

function assertDurationFormatSmoke() {
  assert.equal(formatDurationMs(null), "--:--");
  assert.equal(formatDurationMs(undefined), "--:--");
  assert.equal(formatDurationMs(0), "--:--");
  assert.equal(formatDurationMs(61_400), "1:01");
  assert.equal(formatDurationMs(3_665_000), "61:05");
  assert.equal(
    formatRemainingDurationMs({ duration: 180_000, position: 70_000 }),
    "-1:50",
  );
  assert.equal(
    formatRemainingDurationMs({ duration: 180_000, position: 200_000 }),
    "-0:00",
  );
  assert.equal(
    formatRemainingDurationMs({ duration: 0, position: 0 }),
    "--:--",
  );
}

function assertRouteParamSmoke() {
  assert.equal(parseNumericRouteParam("42"), 42);
  assert.equal(parseNumericRouteParam(["7", "8"]), 7);
  assert.equal(parseNumericRouteParam("0"), 0);
  assert.equal(parseNumericRouteParam(undefined), null);
  assert.equal(parseNumericRouteParam("not-a-number"), null);
  assert.equal(parseNumericRouteParam(["not-a-number"]), null);
}

function assertImportSongFormSmoke() {
  assert.equal(parseImportTrackInput(""), null);
  assert.equal(parseImportTrackInput("  "), null);
  assert.equal(parseImportTrackInput("1"), 1);
  assert.equal(parseImportTrackInput(" 12 "), 12);
  assert.throws(
    () => parseImportTrackInput("0"),
    /Track must be a positive whole number/,
  );
  assert.throws(
    () => parseImportTrackInput("2.5"),
    /Track must be a positive whole number/,
  );

  const edited = buildEditedImportSongDraft({
    album: "  ",
    artist: "  Featured Artist ",
    song: importDraft(9),
    title: "  Edited Title ",
    track: " 4 ",
  });
  assert.equal(edited.album, "Unknown");
  assert.equal(edited.artist, "Featured Artist");
  assert.equal(edited.title, "Edited Title");
  assert.equal(edited.track, 4);
  assert.equal(edited.id, 9);
}

assertDurationFormatSmoke();
assertRouteParamSmoke();
assertImportSongFormSmoke();
assertPlaybackSessionSmoke();
assertPlaybackPlayerStateSmoke();
assertImportSessionSmoke();
assertLibraryCollectionDetailSmoke();
assertLibraryCollectionInteractionSmoke();
assertLibraryCollectionPreviewSmoke();
assertLibrarySongPreviewSmoke();
assertAddableCollectionSongsSmoke();
assertLibrarySongDetailSmoke();
assertEditCollectionQuerySmoke();
assertCollectionFormSmoke();
assertLibraryCollectionListSmoke();
console.log("Rewrite deterministic smoke checks passed.");
