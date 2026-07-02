import assert from "node:assert/strict";
import {
  formatDurationMs,
  formatRemainingDurationMs,
} from "../../../apps/new/src/features/app-shell/services/duration-format-service";
import { getHomeNowPlayingState } from "../../../apps/new/src/features/app-shell/services/home-screen-service";
import { parseNumericRouteParam } from "../../../apps/new/src/features/app-shell/services/route-param-service";
import {
  getActiveTrack,
  getNextQueueIndex,
  getPlaybackQueueActionState,
  getPlaybackQueueRowState,
} from "../../../apps/new/src/features/playback/services/playback-queue-service";
import {
  initialPlaybackState,
  playbackReducer,
} from "../../../apps/new/src/features/playback/services/playback-session-service";
import {
  getFreeListeningRemainingMs,
  getPlaybackMiniPlayerState,
  getPlaybackPlayerActionState,
  getPlaybackPlayerViewState,
  getPlaybackProgressPercent,
  getSeekTargetPosition,
} from "../../../apps/new/src/features/playback/services/playback-player-state-service";
import { audioStatusToTrackPlayerSnapshot } from "../../../apps/new/src/features/playback/services/playback-native-status-service";
import {
  getPlaybackNativeCommandErrorMessage,
  getRemoveFromQueueNativeCommandPlan,
  getResumeNativeCommandPlan,
  getSkipNextNativeCommandPlan,
  getSkipPreviousNativeCommandPlan,
} from "../../../apps/new/src/features/playback/services/playback-native-command-plan-service";
import { runAdGatedPlaybackCommand } from "../../../apps/new/src/features/playback/services/playback-command-gate-service";
import {
  getClearQueuePlaybackCommandPlan,
  getPausePlaybackCommandPlan,
  getPlaySongPlaybackCommandPlan,
  getRemoveFromQueuePlaybackCommandPlan,
  getRemoteFailurePlaybackCommandPlan,
  getResetPlaybackCommandPlan,
  getResumePlaybackCommandPlan,
  getSeekToPlaybackCommandPlan,
  getSkipNextPlaybackCommandPlan,
  getSkipPreviousPlaybackCommandPlan,
  runPlaybackCommandPlan,
} from "../../../apps/new/src/features/playback/services/playback-command-plan-service";
import type { PlaybackQueueItem } from "../../../apps/new/src/features/playback/types/playback-state";
import {
  getImportDiscardResultHref,
  getImportFilesActionState,
  getImportFilesResultHref,
  getImportFailureState,
  getImportFinishResultHref,
  getImportHomeState,
  getImportPremiumGateState,
  getImportSaveActionState,
  getImportSaveExportErrorMessage,
  getImportSuccessState,
  getImportWifiState,
} from "../../../apps/new/src/features/import/services/import-screen-state-service";
import {
  getFinishWifiTransferAction,
  getImportSessionCommandErrorMessage,
  importSessionReducer,
  initialImportSessionState,
} from "../../../apps/new/src/features/import/services/import-session-state-service";
import {
  buildEditedImportSongDraft,
  getImportSongEditActionState,
  getImportSongEditErrorMessage,
  parseImportTrackInput,
} from "../../../apps/new/src/features/import/services/import-song-form-service";
import {
  buildImportLibrarySongSavePlan,
  hasMeaningfulImportLibraryName,
  splitImportLibraryNames,
} from "../../../apps/new/src/features/import/services/import-library-save-plan-service";
import { getImportFileCommandErrorMessage } from "../../../apps/new/src/features/import/services/import-file-command-service";
import {
  getWifiImportServerStartErrorMessage,
  getWifiStartTransferDecision,
  getWifiTransferSize,
  getWifiUploadDecision,
  getWifiUploadFailureResponse,
  wifiImportFinishResponse,
  wifiImportPrepareFailureResponse,
  wifiImportResetResponse,
} from "../../../apps/new/src/features/import/services/wifi-import-request-service";
import type { ImportSongDraft } from "../../../apps/new/src/features/import/types/import-session";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
  rowsToCollectionDetailSongs,
} from "../../../apps/new/src/features/library/services/library-collection-detail-service";
import {
  canDeleteLibraryCollection,
  getAddCollectionSongsMutationErrorMessage,
  getAddableSongRowState,
  getAddableSongSelectionState,
  getCollectionDetailActionState,
  getCollectionDetailMutationErrorMessage,
  getCollectionListHref,
  getCollectionPlaybackCommandPlan,
  getCollectionPlaybackPlan,
  getCollectionQueueCommandPlan,
  getCollectionQueuePlan,
  getCollectionSongListState,
  getCollectionSongOrderUpdate,
  getCollectionSongRowActionState,
  getDeleteCollectionConfirmationCopy,
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
import {
  getCollectionDetailHref,
  getCollectionFormActionState,
  getCollectionFormErrorMessage,
  getCreateCollectionFormCopy,
  getCreateCollectionFormSubtitle,
  getEditCollectionFormCopy,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
  parseAlbumYearInput,
} from "../../../apps/new/src/features/library/services/collection-form-service";
import {
  assertCollectionName,
  getCollectionDuplicateNameMessage,
  getCollectionRequiredNameMessage,
  normalizeCollectionName,
} from "../../../apps/new/src/features/library/services/collection-metadata-service";
import {
  getAddCollectionSongsBackHref,
  getAddCollectionSongsUpdatedLabel,
  rowsToAddableCollectionSongs,
} from "../../../apps/new/src/features/library/services/addable-collection-songs-service";
import { buildEditCollectionState } from "../../../apps/new/src/features/library/services/edit-collection-query-service";
import {
  filterCollectionPreviews,
  getLibraryCollectionListState,
} from "../../../apps/new/src/features/library/services/library-collection-list-service";
import {
  buildLibrarySongDetail,
  getLibrarySongDetailActionState,
  getLibrarySongDetailMutationErrorMessage,
  getLibrarySongRelationshipHref,
  toLibrarySongDetailPlaybackItem,
  toLibrarySongExportItem,
} from "../../../apps/new/src/features/library/services/library-song-detail-service";
import {
  buildLibrarySongEditFormState,
  getLibrarySongEditActionState,
  getLibrarySongEditErrorMessage,
} from "../../../apps/new/src/features/library/services/library-song-form-service";
import {
  getLibrarySongPreviewRowState,
  rowsToSongPreviews,
  toLibrarySongPlaybackItem,
} from "../../../apps/new/src/features/library/services/library-song-preview-service";
import {
  backupActionCards,
  getBackupActionState,
  getBackupConfirmationState,
  getBackupPhaseTransitionEffects,
  getBackupOperationLabel,
  getBackupStatusState,
} from "../../../apps/new/src/features/backup/services/backup-screen-service";
import {
  backupSessionReducer,
  getBackupSessionErrorMessage,
  initialBackupSessionState,
} from "../../../apps/new/src/features/backup/services/backup-session-state-service";
import type { BackupSessionState } from "../../../apps/new/src/features/backup/types/backup-session";
import {
  getPremiumActionState,
  getPremiumMutationErrorMessage,
  getPremiumStatusState,
  getSelectedPremiumTier,
  premiumFeatureCopy,
} from "../../../apps/new/src/features/premium/services/premium-screen-service";
import type {
  PremiumPurchaseState,
  PremiumTier,
} from "../../../apps/new/src/features/premium/types/premium-purchase";
import {
  getCustomizationSettingsErrorMessage,
  getCustomizationOptionState,
  getCustomizationScreenState,
  getPrivacyScreenState,
  getPrivacySettingsErrorMessage,
  shouldSendHapticForHapticsToggle,
} from "../../../apps/new/src/features/settings/services/settings-screen-service";

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
  assert.deepEqual(getPlaybackQueueActionState({ queueLength: 1 }), {
    canClearQueue: true,
  });
  assert.deepEqual(getPlaybackQueueActionState({ queueLength: 0 }), {
    canClearQueue: false,
  });

  state = playbackReducer(state, { song: second, type: "add-to-queue" });
  state = playbackReducer(state, { song: third, type: "add-to-queue" });
  assert.deepEqual(
    state.queue.map((item) => item.id),
    [1, 2, 3],
  );
  assert.equal(state.queueRevision, 3);

  state = playbackReducer(state, { type: "pause" });
  assert.equal(state.isPlaying, false);
  state = playbackReducer(state, { type: "resume" });
  assert.equal(state.isPlaying, true);
  state = playbackReducer(state, { position: 999_999, type: "seek-to" });
  assert.equal(state.position, first.duration);
  state = playbackReducer(state, { position: -10, type: "seek-to" });
  assert.equal(state.position, 0);
  state = playbackReducer(state, { targetIndex: 1, type: "skip-next" });
  assert.equal(state.activeTrackId, second.id);
  assert.equal(state.activeQueueIndex, 1);
  assert.equal(state.position, 0);
  state = playbackReducer(state, { type: "skip-previous" });
  assert.equal(state.activeTrackId, first.id);
  assert.equal(state.activeQueueIndex, 0);

  assert.deepEqual(
    getPlaybackQueueRowState({
      activeTrackId: first.id,
      adBreakActive: false,
      index: 0,
      queueLength: state.queue.length,
      songId: first.id,
    }),
    {
      canMoveDown: true,
      canMoveUp: false,
      canPlay: true,
      isActive: true,
    },
  );
  assert.deepEqual(
    getPlaybackQueueRowState({
      activeTrackId: first.id,
      adBreakActive: false,
      index: 1,
      queueLength: state.queue.length,
      songId: second.id,
    }),
    {
      canMoveDown: true,
      canMoveUp: true,
      canPlay: true,
      isActive: false,
    },
  );
  assert.deepEqual(
    getPlaybackQueueRowState({
      activeTrackId: first.id,
      adBreakActive: true,
      index: 2,
      queueLength: state.queue.length,
      songId: third.id,
    }),
    {
      canMoveDown: false,
      canMoveUp: true,
      canPlay: false,
      isActive: false,
    },
  );

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

function assertPlaybackNativeStatusSmoke() {
  assert.deepEqual(
    audioStatusToTrackPlayerSnapshot({
      loadedSongId: 4,
      source: "library",
      status: {
        isLoaded: false,
      },
    }),
    {
      didJustFinish: false,
      duration: null,
      isLoaded: false,
      isPlaying: false,
      position: 0,
      songId: 4,
      source: "library",
    },
  );
  assert.deepEqual(
    audioStatusToTrackPlayerSnapshot({
      loadedSongId: 5,
      source: "library",
      status: {
        currentTime: 12.5,
        didJustFinish: false,
        duration: 180,
        isLoaded: true,
        playing: true,
      },
    }),
    {
      didJustFinish: false,
      duration: 180_000,
      isLoaded: true,
      isPlaying: true,
      position: 12_500,
      songId: 5,
      source: "library",
    },
  );
  assert.deepEqual(
    audioStatusToTrackPlayerSnapshot({
      loadedSongId: null,
      source: "ad",
      status: {
        currentTime: 2,
        didJustFinish: true,
        duration: Number.NaN,
        isLoaded: true,
        playing: false,
      },
    }),
    {
      didJustFinish: true,
      duration: null,
      isLoaded: true,
      isPlaying: false,
      position: 2_000,
      songId: null,
      source: "ad",
    },
  );
}

function assertPlaybackNativeCommandPlanSmoke() {
  const first = song({ id: 10, title: "First" });
  const second = song({ id: 11, title: "Second" });
  const state = {
    ...initialPlaybackState,
    activeQueueIndex: 0,
    activeTrackId: first.id,
    duration: first.duration ?? 0,
    isPlaying: true,
    queue: [first, second],
  };

  assert.deepEqual(getResumeNativeCommandPlan(initialPlaybackState), {
    type: "noop",
  });
  assert.deepEqual(getResumeNativeCommandPlan(state), {
    type: "resume",
  });
  assert.equal(
    getPlaybackNativeCommandErrorMessage(new Error("Native smoke failure")),
    "Native smoke failure",
  );
  assert.equal(
    getPlaybackNativeCommandErrorMessage("unknown native failure"),
    "Playback command failed.",
  );
  assert.deepEqual(getSkipNextNativeCommandPlan(state), {
    command: { track: second, type: "play" },
    targetIndex: 1,
  });
  assert.deepEqual(
    getSkipNextNativeCommandPlan({
      ...state,
      activeQueueIndex: 1,
      activeTrackId: second.id,
      mode: { loop: false, shuffle: false },
    }),
    {
      command: { type: "stop" },
      targetIndex: null,
    },
  );
  assert.deepEqual(
    getSkipPreviousNativeCommandPlan({
      ...state,
      position: 3_000,
    }),
    { track: first, type: "play" },
  );
  assert.deepEqual(
    getSkipPreviousNativeCommandPlan({
      ...state,
      activeQueueIndex: null,
      activeTrackId: null,
      position: 0,
    }),
    { position: 0, type: "seek" },
  );
  assert.deepEqual(
    getRemoveFromQueueNativeCommandPlan({
      songId: second.id,
      state,
    }),
    { type: "noop" },
  );
  assert.deepEqual(
    getRemoveFromQueueNativeCommandPlan({
      songId: first.id,
      state,
    }),
    { track: second, type: "play" },
  );
  assert.deepEqual(
    getRemoveFromQueueNativeCommandPlan({
      songId: first.id,
      state: {
        ...state,
        isPlaying: false,
      },
    }),
    { type: "stop" },
  );

  const gatedEvents: string[] = [];
  assert.equal(
    runAdGatedPlaybackCommand({
      beginAdBreak: () => gatedEvents.push("ad"),
      canRunPlaybackCommand: () => true,
      command: () => gatedEvents.push("command"),
    }),
    "handled",
  );
  assert.deepEqual(gatedEvents, ["command"]);
  assert.equal(
    runAdGatedPlaybackCommand({
      beginAdBreak: () => gatedEvents.push("ad"),
      canRunPlaybackCommand: () => false,
      command: () => gatedEvents.push("blocked-command"),
    }),
    "started-ad",
  );
  assert.deepEqual(gatedEvents, ["command", "ad"]);
  assert.deepEqual(getPlaySongPlaybackCommandPlan(first), {
    action: {
      song: first,
      type: "play-song",
    },
    nativeCommand: { track: first, type: "play" },
  });
  assert.deepEqual(getPausePlaybackCommandPlan(), {
    action: { type: "pause" },
    nativeCommand: { type: "pause" },
  });
  assert.deepEqual(getResumePlaybackCommandPlan(state), {
    action: { type: "resume" },
    nativeCommand: { type: "resume" },
  });
  assert.deepEqual(getSeekToPlaybackCommandPlan(42_000), {
    action: { position: 42_000, type: "seek-to" },
    nativeCommand: { position: 42_000, type: "seek" },
  });
  assert.deepEqual(getSkipNextPlaybackCommandPlan(state), {
    action: { targetIndex: 1, type: "skip-next" },
    nativeCommand: { track: second, type: "play" },
  });
  assert.deepEqual(
    getSkipPreviousPlaybackCommandPlan({
      ...state,
      activeQueueIndex: null,
      activeTrackId: null,
      position: 0,
    }),
    {
      action: { type: "skip-previous" },
      nativeCommand: { position: 0, type: "seek" },
    },
  );
  assert.deepEqual(getClearQueuePlaybackCommandPlan(), {
    action: { type: "clear-queue" },
    nativeCommand: { type: "stop" },
  });
  assert.deepEqual(getResetPlaybackCommandPlan(), {
    action: { type: "reset" },
    nativeCommand: { type: "stop" },
  });
  assert.deepEqual(
    getRemoveFromQueuePlaybackCommandPlan({
      songId: first.id,
      state,
    }),
    {
      action: { songId: first.id, type: "remove-from-queue" },
      nativeCommand: { track: second, type: "play" },
    },
  );
  const plannedActions: unknown[] = [];
  const plannedNativeCommands: unknown[] = [];
  runPlaybackCommandPlan({
    dispatch: (action) => plannedActions.push(action),
    plan: getPausePlaybackCommandPlan(),
    runNativeCommandPlan: (plan) => plannedNativeCommands.push(plan),
  });
  assert.deepEqual(plannedActions, [{ type: "pause" }]);
  assert.deepEqual(plannedNativeCommands, [{ type: "pause" }]);
  assert.deepEqual(getRemoteFailurePlaybackCommandPlan("Remote smoke failure"), {
    action: {
      error: "Remote smoke failure",
      type: "remote-failure",
    },
    nativeCommand: { type: "stop" },
  });
}

function assertPlaybackPlayerStateSmoke() {
  const activeTrack = song({ duration: 180_000, id: 10, title: "Mini Track" });

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
  assert.deepEqual(
    getPlaybackPlayerActionState({
      activeTrack: null,
      state: initialPlaybackState,
    }),
    {
      adBreakActive: false,
      canFastForward: false,
      canPlayPause: false,
      canRewind: false,
      canSkipNext: false,
      canSkipPrevious: false,
      loopLabel: "Loop Off",
      playPauseLabel: "Play",
      shuffleLabel: "Shuffle Off",
    },
  );
  assert.deepEqual(
    getPlaybackPlayerActionState({
      activeTrack,
      state: {
        ...initialPlaybackState,
        duration: 180_000,
        isPlaying: true,
        mode: { loop: true, shuffle: true },
        position: 60_000,
      },
    }),
    {
      adBreakActive: false,
      canFastForward: true,
      canPlayPause: true,
      canRewind: true,
      canSkipNext: true,
      canSkipPrevious: true,
      loopLabel: "Loop On",
      playPauseLabel: "Pause",
      shuffleLabel: "Shuffle On",
    },
  );
  assert.deepEqual(
    getPlaybackPlayerActionState({
      activeTrack,
      state: {
        ...initialPlaybackState,
        duration: 180_000,
        position: 180_000,
      },
    }).canFastForward,
    false,
  );
  assert.deepEqual(
    getPlaybackPlayerActionState({
      activeTrack,
      state: {
        ...initialPlaybackState,
        adGate: {
          ...initialPlaybackState.adGate,
          active: true,
        },
        duration: 180_000,
        position: 60_000,
      },
    }),
    {
      adBreakActive: true,
      canFastForward: false,
      canPlayPause: false,
      canRewind: false,
      canSkipNext: false,
      canSkipPrevious: false,
      loopLabel: "Loop Off",
      playPauseLabel: "Play",
      shuffleLabel: "Shuffle Off",
    },
  );
  assert.deepEqual(
    getPlaybackPlayerViewState({
      activeTrack,
      state: {
        ...initialPlaybackState,
        adGate: {
          ...initialPlaybackState.adGate,
          accumulatedMs: 120_000,
          playbackDuration: 30_000,
          playbackPosition: 7_500,
          thresholdMs: 600_000,
        },
        duration: 180_000,
        isPlaying: true,
        position: 45_000,
      },
    }),
    {
      actionState: {
        adBreakActive: false,
        canFastForward: true,
        canPlayPause: true,
        canRewind: true,
        canSkipNext: true,
        canSkipPrevious: true,
        loopLabel: "Loop Off",
        playPauseLabel: "Pause",
        shuffleLabel: "Shuffle Off",
      },
      adProgressPercent: 25,
      freeListeningRemainingMs: 480_000,
      progressPercent: 25,
    },
  );
  assert.deepEqual(
    getPlaybackMiniPlayerState({
      activeTrack: null,
      pathname: "/(tabs)",
      state: initialPlaybackState,
    }),
    {
      blockedByAd: false,
      canTogglePlayback: false,
      isVisible: false,
      metaLabel: "",
      playLabel: "Play",
      title: "",
    },
  );
  assert.equal(
    getPlaybackMiniPlayerState({
      activeTrack,
      pathname: "/player",
      state: initialPlaybackState,
    }).isVisible,
    false,
  );
  assert.deepEqual(
    getPlaybackMiniPlayerState({
      activeTrack,
      pathname: "/(tabs)",
      state: {
        ...initialPlaybackState,
        duration: 180_000,
        isPlaying: false,
        position: 60_000,
      },
    }),
    {
      blockedByAd: false,
      canTogglePlayback: true,
      isVisible: true,
      metaLabel: "Smoke Artist - -2:00",
      playLabel: "Play",
      title: "Mini Track",
    },
  );
  assert.deepEqual(
    getPlaybackMiniPlayerState({
      activeTrack,
      pathname: "/(tabs)",
      state: {
        ...initialPlaybackState,
        adGate: {
          ...initialPlaybackState.adGate,
          due: true,
        },
        duration: 180_000,
        isPlaying: true,
        position: 60_000,
      },
    }),
    {
      blockedByAd: true,
      canTogglePlayback: false,
      isVisible: true,
      metaLabel: "Ad break ready",
      playLabel: "Pause",
      title: "Mini Track",
    },
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
  assert.equal(getImportFilesResultHref(true), "/(tabs)/import/save");
  assert.equal(getImportFilesResultHref(false), "/(tabs)/import/failure");
  assert.equal(getImportFinishResultHref(true), "/(tabs)/import/success");
  assert.equal(getImportFinishResultHref(false), "/(tabs)/import/failure");
  assert.equal(getImportDiscardResultHref(true), "/(tabs)/import");
  assert.equal(getImportDiscardResultHref(false), "/(tabs)/import/failure");
  assert.deepEqual(
    getImportPremiumGateState({
      active: false,
      error: null,
      phase: "checking",
    }),
    {
      canAccessImport: false,
      error: null,
      kicker: "Checking premium",
    },
  );
  assert.deepEqual(
    getImportPremiumGateState({
      active: false,
      error: "Premium check failed.",
      phase: "failure",
    }),
    {
      canAccessImport: false,
      error: "Premium check failed.",
      kicker: "Premium import",
    },
  );
  assert.deepEqual(
    getImportPremiumGateState({
      active: true,
      error: null,
      phase: "ready",
    }),
    {
      canAccessImport: true,
      error: null,
      kicker: "Premium import",
    },
  );
  assert.deepEqual(
    getImportSaveActionState({ isExporting: false, state }),
    {
      canDiscard: true,
      canExport: false,
      canFinish: false,
      discardLabel: "Discard",
      exportLabel: "Export",
      finishLabel: "Finish",
      hasSongs: false,
      isWorking: false,
    },
  );
  assert.deepEqual(
    getImportHomeState({ premiumActive: false, state }).routes.map((route) => ({
      href: route.href,
      label: route.label,
      metaLabel: route.metaLabel,
    })),
    [
      { href: "/premium", label: "Files", metaLabel: "Premium" },
      { href: "/premium", label: "Wi-Fi", metaLabel: "Premium" },
      { href: "/premium", label: "Save", metaLabel: "Premium" },
    ],
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
  assert.equal(
    getImportFileCommandErrorMessage({
      caughtError: new Error("Picker smoke failure"),
      mutation: "select-files",
    }),
    "Picker smoke failure",
  );
  assert.equal(
    getImportFileCommandErrorMessage({
      caughtError: null,
      mutation: "select-files",
    }),
    "Files could not be selected.",
  );
  assert.equal(
    getImportFileCommandErrorMessage({
      caughtError: undefined,
      mutation: "remove-staged-songs",
    }),
    "Selected staged songs could not be removed.",
  );
  assert.deepEqual(
    getImportSaveActionState({ isExporting: false, state }),
    {
      canDiscard: true,
      canExport: true,
      canFinish: true,
      discardLabel: "Discard",
      exportLabel: "Export",
      finishLabel: "Finish",
      hasSongs: true,
      isWorking: false,
    },
  );
  assert.deepEqual(
    getImportHomeState({ premiumActive: true, state }).routes.map((route) => ({
      href: route.href,
      label: route.label,
      metaLabel: route.metaLabel,
    })),
    [
      {
        href: "/(tabs)/import/files",
        label: "Files",
        metaLabel: "2 staged",
      },
      { href: "/(tabs)/import/wifi", label: "Wi-Fi", metaLabel: "Local" },
      {
        href: "/(tabs)/import/save",
        label: "Save",
        metaLabel: "reviewing",
      },
    ],
  );
  assert.deepEqual(
    getImportSaveActionState({ isExporting: true, state }),
    {
      canDiscard: false,
      canExport: false,
      canFinish: false,
      discardLabel: "Discard",
      exportLabel: "Exporting",
      finishLabel: "Finishing",
      hasSongs: true,
      isWorking: true,
    },
  );
  assert.equal(
    getImportSaveExportErrorMessage(new Error("Export smoke failure")),
    "Export smoke failure",
  );
  assert.equal(
    getImportSaveExportErrorMessage(undefined),
    "Staged songs could not be exported.",
  );
  assert.deepEqual(
    getImportSuccessState({
      ...state,
      phase: "success",
      progress: { current: 3, total: 4 },
      saveSummary: { discarded: 1, saved: 2, savedSongIds: [1, 2] },
      shouldSaveToLibrary: true,
    }),
    {
      librarySaveLabel: "2 saved to library",
      processedLabel: "3 of 4 songs processed.",
      showLibraryHint: true,
    },
  );
  assert.deepEqual(
    getImportSuccessState({
      ...state,
      phase: "success",
      progress: { current: 2, total: 2 },
      saveSummary: { discarded: 2, saved: 0, savedSongIds: [] },
      shouldSaveToLibrary: false,
    }),
    {
      librarySaveLabel: "2 discarded",
      processedLabel: "2 of 2 songs processed.",
      showLibraryHint: false,
    },
  );
  assert.deepEqual(
    getImportFailureState({
      ...state,
      error: "Import smoke failure",
      phase: "failure",
    }),
    {
      errorLabel: "Import smoke failure",
      phaseLabel: "failure",
    },
  );
  assert.deepEqual(
    getImportFailureState({
      ...state,
      error: null,
      phase: "failure",
    }).errorLabel,
    "The import session could not continue.",
  );
  assert.deepEqual(getFinishWifiTransferAction([]), {
    error: "No Wi-Fi songs were received.",
    type: "fail",
  });
  assert.deepEqual(getFinishWifiTransferAction([importDraft(77)]), {
    songs: [importDraft(77)],
    type: "review",
  });
  assert.equal(
    getImportSessionCommandErrorMessage({
      caughtError: new Error("Import command failed"),
      mutation: "save-session",
    }),
    "Import command failed",
  );
  assert.equal(
    getImportSessionCommandErrorMessage({
      caughtError: "unknown",
      mutation: "begin-wifi-transfer",
    }),
    "Wi-Fi import cache could not be prepared.",
  );
  assert.equal(
    getImportSessionCommandErrorMessage({
      caughtError: null,
      mutation: "save-session",
    }),
    "Import session could not be saved.",
  );
  assert.equal(
    getImportSessionCommandErrorMessage({
      caughtError: undefined,
      mutation: "discard-session",
    }),
    "Import session could not be discarded.",
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
      discardLabel: "Discard",
      exportLabel: "Export",
      finishLabel: "Finishing",
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
  assert.deepEqual(
    getImportHomeState({ premiumActive: true, state }).routes.map((route) => ({
      href: route.href,
      label: route.label,
      metaLabel: route.metaLabel,
    })),
    [
      {
        href: "/(tabs)/import/files",
        label: "Files",
        metaLabel: "0 staged",
      },
      { href: "/(tabs)/import/wifi", label: "Wi-Fi", metaLabel: "0" },
      {
        href: "/(tabs)/import/save",
        label: "Save",
        metaLabel: "processing",
      },
    ],
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
  assert.deepEqual(
    getImportHomeState({ premiumActive: true, state }).routes.map((route) => ({
      href: route.href,
      label: route.label,
      metaLabel: route.metaLabel,
    })),
    [
      {
        href: "/(tabs)/import/files",
        label: "Files",
        metaLabel: "1 staged",
      },
      { href: "/(tabs)/import/wifi", label: "Wi-Fi", metaLabel: "1" },
      {
        href: "/(tabs)/import/save",
        label: "Save",
        metaLabel: "processing",
      },
    ],
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

function assertWifiImportRequestSmoke() {
  assert.equal(getWifiTransferSize(null), 0);
  assert.equal(getWifiTransferSize({ size: "3" }), 3);
  assert.equal(getWifiTransferSize({ size: 2.5 }), 0);
  assert.equal(
    getWifiImportServerStartErrorMessage(new Error("Server smoke failure")),
    "Server smoke failure",
  );
  assert.equal(
    getWifiImportServerStartErrorMessage(null),
    "Wi-Fi transfer server could not start.",
  );
  assert.deepEqual(
    getWifiStartTransferDecision({
      isMidTransfer: true,
      postData: { size: 3 },
    }),
    {
      response: {
        message: "Transfer already in progress",
        status: 400,
      },
      shouldStart: false,
      transferSize: 0,
    },
  );
  assert.deepEqual(
    getWifiStartTransferDecision({
      isMidTransfer: false,
      postData: { size: 0 },
    }),
    {
      response: {
        message: "No data to transfer",
        status: 400,
      },
      shouldStart: false,
      transferSize: 0,
    },
  );
  assert.deepEqual(
    getWifiStartTransferDecision({
      isMidTransfer: false,
      postData: { size: "2" },
    }),
    {
      response: {
        message: "OK - READY TO TRANSFER",
        status: 200,
      },
      shouldStart: true,
      transferSize: 2,
    },
  );

  const receivedIds = new Set<number>();
  const accepted = getWifiUploadDecision({
    postData: {
      data: "YmFzZTY0",
      id: "7",
      name: "song.mp3",
      type: "audio/mpeg",
    },
    receivedIds,
  });
  assert.equal(accepted.shouldAccept, true);
  assert.equal(accepted.upload.id, 7);
  assert.deepEqual(accepted.response, {
    message: "OK - song.mp3 RECEIVED",
    status: 200,
  });
  receivedIds.add(7);
  assert.deepEqual(
    getWifiUploadDecision({
      postData: {
        data: "YmFzZTY0",
        id: 7,
        name: "song.mp3",
        type: "audio/mpeg",
      },
      receivedIds,
    }).response,
    {
      message: "ERROR - Bad data from song.mp3",
      status: 409,
    },
  );
  assert.deepEqual(
    getWifiUploadDecision({
      postData: {
        data: "YmFzZTY0",
        id: 8,
        name: "notes.txt",
        type: "text/plain",
      },
      receivedIds,
    }).response,
    {
      message: "ERROR - Bad data from notes.txt",
      status: 409,
    },
  );
  assert.deepEqual(wifiImportResetResponse, {
    message: "OK - RESET RESULTS",
    status: 200,
  });
  assert.deepEqual(wifiImportFinishResponse, {
    message: "OK - FINISHED TRANSFER",
    status: 200,
  });
  assert.deepEqual(wifiImportPrepareFailureResponse, {
    message: "Failed to prepare import cache",
    status: 500,
  });
  assert.deepEqual(getWifiUploadFailureResponse("Disk full"), {
    message: "ERROR - Failed to upload song: Disk full",
    status: 500,
  });
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
    getCollectionDetailActionState({
      id: 3,
      isDeleting: false,
      isExporting: false,
      isMissing: false,
      kind: "playlist",
      songs,
    }),
    {
      canDelete: true,
      canExport: true,
      canPlay: true,
      canQueue: true,
      deleteLabel: "Delete",
      exportLabel: "Export",
      playableSongs: [songs[0], songs[2]],
    },
  );
  assert.deepEqual(
    getCollectionDetailActionState({
      id: 3,
      isDeleting: true,
      isExporting: true,
      isMissing: false,
      kind: "playlist",
      songs,
    }),
    {
      canDelete: false,
      canExport: false,
      canPlay: true,
      canQueue: true,
      deleteLabel: "Deleting",
      exportLabel: "Exporting",
      playableSongs: [songs[0], songs[2]],
    },
  );
  assert.deepEqual(
    getCollectionDetailActionState({
      id: 1,
      isDeleting: false,
      isExporting: false,
      isMissing: false,
      kind: "playlist",
      songs,
    }),
    {
      canDelete: false,
      canExport: true,
      canPlay: true,
      canQueue: true,
      deleteLabel: "Delete",
      exportLabel: "Export",
      playableSongs: [songs[0], songs[2]],
    },
  );
  assert.deepEqual(
    getCollectionDetailActionState({
      id: 7,
      isDeleting: false,
      isExporting: false,
      isMissing: true,
      kind: "album",
      songs: [],
    }),
    {
      canDelete: false,
      canExport: false,
      canPlay: false,
      canQueue: false,
      deleteLabel: "Delete",
      exportLabel: "Export",
      playableSongs: [],
    },
  );
  assert.deepEqual(getCollectionPlaybackPlan({ playableSongs: [] }), {
    canStartPlayback: false,
    firstSong: null,
    queuedSongs: [],
  });
  assert.deepEqual(
    getCollectionPlaybackPlan({
      playableSongs: [songs[0]!, songs[2]!],
    }),
    {
      canStartPlayback: true,
      firstSong: songs[0],
      queuedSongs: [songs[2]],
    },
  );
  assert.deepEqual(
    getCollectionPlaybackCommandPlan({
      playableSongs: [],
    }),
    {
      firstSong: null,
      haptic: "error",
      playerHref: null,
      queuedSongs: [],
    },
  );
  assert.deepEqual(
    getCollectionPlaybackCommandPlan({
      playableSongs: [songs[0]!, songs[2]!],
    }),
    {
      firstSong: songs[0],
      haptic: "light",
      playerHref: "/player",
      queuedSongs: [songs[2]],
    },
  );
  assert.deepEqual(
    getCollectionQueuePlan({
      canQueue: false,
      playableSongs: [songs[0]!, songs[2]!],
    }),
    {
      canQueue: false,
      queuedSongs: [],
    },
  );
  assert.deepEqual(
    getCollectionQueuePlan({
      canQueue: true,
      playableSongs: [songs[0]!, songs[2]!],
    }),
    {
      canQueue: true,
      queuedSongs: [songs[0], songs[2]],
    },
  );
  assert.deepEqual(
    getCollectionQueueCommandPlan({
      canQueue: false,
      playableSongs: [songs[0]!, songs[2]!],
    }),
    {
      haptic: "error",
      queuedSongs: [],
    },
  );
  assert.deepEqual(
    getCollectionQueueCommandPlan({
      canQueue: true,
      playableSongs: [songs[0]!, songs[2]!],
    }),
    {
      haptic: "light",
      queuedSongs: [songs[0], songs[2]],
    },
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
  assert.deepEqual(
    getCollectionSongOrderUpdate({
      direction: "down",
      songId: 1,
      songs,
    }),
    { songIds: [2, 1, 3] },
  );
  assert.deepEqual(
    getCollectionSongOrderUpdate({
      direction: "up",
      songId: 1,
      songs,
    }),
    { songIds: [1, 2, 3] },
  );
  assert.deepEqual(
    getCollectionSongOrderUpdate({
      direction: "down",
      songId: 99,
      songs,
    }),
    { songIds: [1, 2, 3] },
  );
  assert.deepEqual(
    getCollectionSongListState({ movingSongId: null, removingSongId: null }),
    { isMutating: false },
  );
  assert.deepEqual(
    getCollectionSongListState({ movingSongId: 2, removingSongId: null }),
    { isMutating: true },
  );
  assert.deepEqual(
    getCollectionSongRowActionState({
      index: 0,
      movingSongId: null,
      removingSongId: null,
      songId: 1,
      totalSongs: songs.length,
    }),
    {
      canMoveDown: true,
      canMoveUp: false,
      canRemove: true,
      downLabel: "Down",
      isMoving: false,
      isRemoving: false,
      removeLabel: "Remove",
      upLabel: "Up",
    },
  );
  assert.deepEqual(
    getCollectionSongRowActionState({
      index: 1,
      movingSongId: 2,
      removingSongId: null,
      songId: 2,
      totalSongs: songs.length,
    }),
    {
      canMoveDown: false,
      canMoveUp: false,
      canRemove: false,
      downLabel: "Moving",
      isMoving: true,
      isRemoving: false,
      removeLabel: "Remove",
      upLabel: "Moving",
    },
  );
  assert.deepEqual(
    getCollectionSongRowActionState({
      index: 2,
      movingSongId: null,
      removingSongId: 3,
      songId: 3,
      totalSongs: songs.length,
    }),
    {
      canMoveDown: false,
      canMoveUp: false,
      canRemove: false,
      downLabel: "Down",
      isMoving: false,
      isRemoving: true,
      removeLabel: "Removing",
      upLabel: "Up",
    },
  );
  assert.equal(
    getCollectionSongRowActionState({
      index: 2,
      movingSongId: null,
      removingSongId: null,
      songId: 3,
      totalSongs: songs.length,
    }).canMoveDown,
    false,
  );
  assert.equal(getCollectionListHref("album"), "/(tabs)/library/albums");
  assert.equal(getCollectionListHref("artist"), "/(tabs)/library/artists");
  assert.equal(getCollectionListHref("playlist"), "/(tabs)/library/playlists");
  assert.deepEqual(
    getDeleteCollectionConfirmationCopy({
      eyebrow: "Playlist",
      title: "Smoke Mix",
    }),
    {
      message: "Delete Smoke Mix? Songs will stay in your library.",
      title: "Delete playlist",
    },
  );
  assert.equal(
    getCollectionDetailMutationErrorMessage({
      caughtError: new Error("No permission"),
      mutation: "delete-collection",
    }),
    "No permission",
  );
  assert.equal(
    getCollectionDetailMutationErrorMessage({
      caughtError: "unknown",
      mutation: "export-collection",
    }),
    "Songs could not be exported.",
  );
  assert.equal(
    getCollectionDetailMutationErrorMessage({
      caughtError: null,
      mutation: "move-song",
    }),
    "Song order could not be saved.",
  );
  assert.equal(
    getCollectionDetailMutationErrorMessage({
      caughtError: undefined,
      mutation: "remove-song",
    }),
    "Song could not be removed.",
  );
  assert.equal(
    getCollectionDetailMutationErrorMessage({
      caughtError: false,
      mutation: "delete-collection",
    }),
    "Collection could not be deleted.",
  );
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
  assert.deepEqual(
    getAddableSongSelectionState({
      isAddingSelection: false,
      savingSongId: null,
      selectedSongIds: new Set(),
      songs: addableSongs,
    }),
    {
      bulkAddLabel: "Add selected",
      canBulkAdd: false,
      isMutating: false,
      selectedAddableSongIds: [],
      selectedCount: 0,
      selectionLabel: "Select songs to add several at once.",
    },
  );
  assert.deepEqual(
    getAddableSongSelectionState({
      isAddingSelection: false,
      savingSongId: null,
      selectedSongIds: new Set([1, 2, 3, 99]),
      songs: addableSongs,
    }),
    {
      bulkAddLabel: "Add selected",
      canBulkAdd: true,
      isMutating: false,
      selectedAddableSongIds: [1, 3],
      selectedCount: 2,
      selectionLabel: "2 selected",
    },
  );
  assert.deepEqual(
    getAddableSongSelectionState({
      isAddingSelection: true,
      savingSongId: null,
      selectedSongIds: new Set([1]),
      songs: addableSongs,
    }),
    {
      bulkAddLabel: "Adding",
      canBulkAdd: false,
      isMutating: true,
      selectedAddableSongIds: [1],
      selectedCount: 1,
      selectionLabel: "1 selected",
    },
  );
  assert.deepEqual(
    getAddableSongSelectionState({
      isAddingSelection: false,
      savingSongId: 3,
      selectedSongIds: new Set([1]),
      songs: addableSongs,
    }).canBulkAdd,
    false,
  );
  assert.equal(
    getAddCollectionSongsMutationErrorMessage({
      caughtError: new Error("Add smoke failure"),
      mutation: "add-song",
    }),
    "Add smoke failure",
  );
  assert.equal(
    getAddCollectionSongsMutationErrorMessage({
      caughtError: null,
      mutation: "add-selection",
    }),
    "Selected songs could not be added.",
  );
  assert.equal(
    getAddCollectionSongsMutationErrorMessage({
      caughtError: undefined,
      mutation: "add-song",
    }),
    "Song could not be added.",
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
    { addLabel: "Add", isDisabled: false, isSaving: false, isSelected: true },
  );
  assert.deepEqual(
    getAddableSongRowState({
      savingSongId: 1,
      selectedSongIds: new Set([1]),
      song: addableSongs[0]!,
    }),
    {
      addLabel: "Adding",
      isDisabled: true,
      isSaving: true,
      isSelected: true,
    },
  );
  assert.deepEqual(
    getAddableSongRowState({
      savingSongId: null,
      selectedSongIds: new Set([2]),
      song: addableSongs[1]!,
    }),
    {
      addLabel: "Added",
      isDisabled: true,
      isSaving: false,
      isSelected: false,
    },
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
  assert.deepEqual(
    getLibrarySongPreviewRowState({
      activeTrackId: 1,
      song: previews[0]!,
    }),
    {
      canPlay: true,
      isActive: true,
    },
  );
  assert.deepEqual(toLibrarySongPlaybackItem(previews[0]!), {
    album: "Alpha Album",
    artist: "Alpha Artist, Featured Artist",
    duration: 10_000,
    id: 1,
    pathToFile: "/tmp/alpha.mp3",
    title: "Alpha",
  });

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
  assert.deepEqual(
    getLibrarySongPreviewRowState({
      activeTrackId: 1,
      song: recentAsc[0]!,
    }),
    {
      canPlay: false,
      isActive: true,
    },
  );
}

function assertAddableCollectionSongsSmoke() {
  assert.equal(
    getAddCollectionSongsUpdatedLabel({ updatedAt: 0 }),
    "Waiting for library data",
  );
  assert.equal(
    getAddCollectionSongsUpdatedLabel({
      formatTime: (updatedAt) => `smoke-${updatedAt}`,
      updatedAt: 123,
    }),
    "Updated smoke-123",
  );
  assert.equal(
    getAddCollectionSongsBackHref({
      collectionId: 7,
      kind: "playlist",
    }),
    "/(tabs)/library/playlist/7",
  );

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
    toLibrarySongDetailPlaybackItem({
      detail,
      songId: 42,
    }),
    {
      album: "Alpha Album, Beta Album",
      artist: "Alpha Artist, Beta Artist",
      duration: 125_000,
      id: 42,
      pathToFile: "/tmp/alpha.mp3",
      title: "Alpha",
    },
  );
  assert.deepEqual(
    toLibrarySongExportItem({
      detail,
      songId: 42,
    }),
    {
      id: 42,
      pathToFile: "/tmp/alpha.mp3",
      title: "Alpha",
    },
  );
  assert.equal(
    buildLibrarySongDetail({
      albumRows: [],
      artistRows: [],
      likedRows: [],
      playlistRows: [{ id: 2, name: "Liked Songs" }],
      songRow: {
        duration: null,
        fileType: null,
        originalFileName: null,
        pathToFile: null,
        title: "Liked through playlist membership",
      },
      updatedAt: 43,
    }).isLiked,
    true,
  );
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
      deleteLabel: "Delete",
      exportLabel: "Export",
      likedLabel: "Unlike",
    },
  );
  assert.deepEqual(buildLibrarySongEditFormState(detail), {
    albumNames: "Alpha Album, Beta Album",
    artistNames: "Alpha Artist, Beta Artist",
    title: "Alpha",
  });
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail,
      isSaving: false,
      title: " Alpha ",
    }),
    { canSave: true, saveLabel: "Save" },
  );
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail,
      isSaving: false,
      title: "   ",
    }),
    { canSave: false, saveLabel: "Save" },
  );
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail,
      isSaving: true,
      title: "Alpha",
    }),
    { canSave: false, saveLabel: "Saving" },
  );
  assert.equal(
    getLibrarySongEditErrorMessage(new Error("Song edit smoke failure")),
    "Song edit smoke failure",
  );
  assert.equal(
    getLibrarySongEditErrorMessage(null),
    "Song could not be saved.",
  );
  assert.deepEqual(
    getLibrarySongDetailActionState({
      detail,
      isDeleting: true,
      isExporting: true,
      isTogglingLiked: true,
    }),
    {
      canDelete: false,
      canExport: false,
      canPlay: true,
      canToggleLiked: false,
      deleteLabel: "Deleting",
      exportLabel: "Exporting",
      likedLabel: "Unlike",
    },
  );
  assert.equal(
    getLibrarySongDetailMutationErrorMessage({
      caughtError: new Error("Share failed"),
      mutation: "export-song",
    }),
    "Share failed",
  );
  assert.equal(
    getLibrarySongDetailMutationErrorMessage({
      caughtError: "unknown",
      mutation: "export-song",
    }),
    "Song could not be exported.",
  );
  assert.equal(
    getLibrarySongDetailMutationErrorMessage({
      caughtError: null,
      mutation: "toggle-liked",
    }),
    "Liked Songs could not be updated.",
  );
  assert.equal(
    getLibrarySongDetailMutationErrorMessage({
      caughtError: undefined,
      mutation: "delete-song",
    }),
    "Song could not be deleted.",
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
  assert.deepEqual(buildLibrarySongEditFormState(missing), {
    albumNames: "",
    artistNames: "",
    title: "",
  });
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail: missing,
      isSaving: false,
      title: "Recovered title",
    }),
    { canSave: false, saveLabel: "Save" },
  );
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
      deleteLabel: "Delete",
      exportLabel: "Export",
      likedLabel: "Like",
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
  assert.equal(normalizeCollectionName("  Smoke Album  "), "Smoke Album");
  assert.equal(
    getCollectionRequiredNameMessage("album"),
    "Album name is required.",
  );
  assert.equal(
    getCollectionRequiredNameMessage("artist"),
    "Artist name is required.",
  );
  assert.equal(
    getCollectionRequiredNameMessage("playlist"),
    "Playlist name is required.",
  );
  assert.equal(
    getCollectionDuplicateNameMessage("album"),
    "An album with this name already exists.",
  );
  assert.equal(
    getCollectionDuplicateNameMessage("artist"),
    "An artist with this name already exists.",
  );
  assert.equal(
    getCollectionDuplicateNameMessage("playlist"),
    "A playlist with this name already exists.",
  );
  assert.deepEqual(getCreateCollectionFormCopy("album"), {
    createLabel: "Create album",
    duplicateNoun: "album",
    kicker: "Album",
    namePlaceholder: "Album name",
    title: "Create album",
  });
  assert.deepEqual(getCreateCollectionFormCopy("artist"), {
    createLabel: "Create artist",
    duplicateNoun: "artist",
    kicker: "Artist",
    namePlaceholder: "Artist name",
    title: "Create artist",
  });
  assert.deepEqual(getCreateCollectionFormCopy("playlist"), {
    createLabel: "Create playlist",
    duplicateNoun: "playlist",
    kicker: "Playlist",
    namePlaceholder: "Playlist name",
    title: "Create playlist",
  });
  assert.equal(
    getCreateCollectionFormSubtitle({ duplicateNoun: "playlist" }),
    "Name the playlist, choose optional artwork, and start organizing your music.",
  );
  assert.deepEqual(getEditCollectionFormCopy("album"), {
    editLabel: "Save album",
    kicker: "Album",
    namePlaceholder: "Album name",
    title: "Edit album",
  });
  assert.deepEqual(getEditCollectionFormCopy("artist"), {
    editLabel: "Save artist",
    kicker: "Artist",
    namePlaceholder: "Artist name",
    title: "Edit artist",
  });
  assert.deepEqual(getEditCollectionFormCopy("playlist"), {
    editLabel: "Save playlist",
    kicker: "Playlist",
    namePlaceholder: "Playlist name",
    title: "Edit playlist",
  });
  assert.equal(
    assertCollectionName({ kind: "playlist", name: "  Road Trip  " }),
    "Road Trip",
  );
  assert.throws(
    () => assertCollectionName({ kind: "artist", name: "   " }),
    /Artist name is required/,
  );
  assert.equal(parseAlbumYearInput(""), undefined);
  assert.equal(parseAlbumYearInput("   "), undefined);
  assert.equal(parseAlbumYearInput("0"), 0);
  assert.equal(parseAlbumYearInput(" 2026 "), 2026);
  assert.deepEqual(
    getCollectionFormActionState({
      isSaving: false,
      name: "",
    }),
    {
      canEdit: true,
      canPickImage: true,
      canSave: false,
      hasName: false,
    },
  );
  assert.deepEqual(
    getCollectionFormActionState({
      isSaving: false,
      name: "  Smoke Album  ",
    }),
    {
      canEdit: true,
      canPickImage: true,
      canSave: true,
      hasName: true,
    },
  );
  assert.deepEqual(
    getCollectionFormActionState({
      isSaving: true,
      name: "Smoke Album",
    }),
    {
      canEdit: false,
      canPickImage: false,
      canSave: false,
      hasName: true,
    },
  );
  assert.deepEqual(
    getCollectionFormActionState({
      isMissing: true,
      isSaving: false,
      name: "Smoke Album",
    }),
    {
      canEdit: false,
      canPickImage: false,
      canSave: false,
      hasName: true,
    },
  );
  assert.equal(
    getCollectionFormPreviewInitial({
      fallback: "A",
      name: "",
    }),
    "A",
  );
  assert.equal(
    getCollectionFormPreviewInitial({
      fallback: "A",
      name: "  smoke album",
    }),
    "S",
  );
  assert.equal(
    getCollectionFormSaveLabel({
      defaultLabel: "Create album",
      isSaving: false,
      savingLabel: "Creating",
    }),
    "Create album",
  );
  assert.equal(
    getCollectionFormSaveLabel({
      defaultLabel: "Save album",
      isSaving: true,
      savingLabel: "Saving",
    }),
    "Saving",
  );
  assert.equal(
    getCollectionDetailHref({ id: 42, kind: "album" }),
    "/(tabs)/library/album/42",
  );
  assert.equal(
    getCollectionDetailHref({ id: 43, kind: "artist" }),
    "/(tabs)/library/artist/43",
  );
  assert.equal(
    getCollectionDetailHref({ id: 44, kind: "playlist" }),
    "/(tabs)/library/playlist/44",
  );
  assert.equal(
    getCollectionFormErrorMessage({
      caughtError: new Error("Image picker failed"),
      fallbackMessage: "Image could not be selected.",
    }),
    "Image picker failed",
  );
  assert.equal(
    getCollectionFormErrorMessage({
      caughtError: "unknown",
      fallbackMessage: "Album could not be created.",
    }),
    "Album could not be created.",
  );
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
  assert.deepEqual(
    getLibraryCollectionListState({
      collections,
      emptyLabel: "No albums in library",
      errors: [],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      query: "missing",
      updatedAt: 123,
    }),
    {
      emptyLabel: "No matching collections",
      hasErrors: false,
      statusLabel: "Updated time:123",
      visibleCollections: [],
    },
  );
  assert.deepEqual(
    getLibraryCollectionListState({
      collections,
      emptyLabel: "No albums in library",
      errors: [new Error("boom")],
      query: "",
      updatedAt: 0,
    }),
    {
      emptyLabel: "No albums in library",
      hasErrors: true,
      statusLabel: "One or more collection queries failed.",
      visibleCollections: collections,
    },
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

function assertHomeScreenSmoke() {
  const activeTrack = song({ duration: 125_000, id: 1, title: "Home Track" });

  assert.deepEqual(
    getHomeNowPlayingState({
      activeTrack: null,
      state: {
        ...initialPlaybackState,
        queue: [activeTrack],
      },
    }),
    {
      detailLabel: "1 songs in queue",
      playbackLabel: "Nothing playing",
      title: "Choose a song to start listening",
    },
  );
  assert.deepEqual(
    getHomeNowPlayingState({
      activeTrack,
      state: {
        ...initialPlaybackState,
        isPlaying: false,
      },
    }),
    {
      detailLabel: "Smoke Artist - 2:05",
      playbackLabel: "Paused",
      title: "Home Track",
    },
  );
  assert.equal(
    getHomeNowPlayingState({
      activeTrack,
      state: {
        ...initialPlaybackState,
        isPlaying: true,
      },
    }).playbackLabel,
    "Playing now",
  );
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
  assert.deepEqual(getImportSongEditActionState({ title: "  Edited " }), {
    canSave: true,
  });
  assert.deepEqual(getImportSongEditActionState({ title: "   " }), {
    canSave: false,
  });
  assert.equal(
    getImportSongEditErrorMessage(new Error("Edit import smoke failure")),
    "Edit import smoke failure",
  );
  assert.equal(
    getImportSongEditErrorMessage(null),
    "Song could not be updated.",
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

function assertImportLibrarySavePlanSmoke() {
  assert.equal(hasMeaningfulImportLibraryName("Unknown"), false);
  assert.equal(hasMeaningfulImportLibraryName("Unknown Artist"), false);
  assert.equal(hasMeaningfulImportLibraryName("  Album Name  "), true);
  assert.deepEqual(splitImportLibraryNames(" Alice, Unknown Artist, Bob "), [
    "Alice",
    "Bob",
  ]);
  assert.deepEqual(
    buildImportLibrarySongSavePlan({
      ...importDraft(10),
      album: " Unknown Album ",
      artist: " Alice, Bob, Unknown ",
    }),
    {
      albumName: null,
      artistNames: ["Alice", "Bob"],
    },
  );
  assert.deepEqual(
    buildImportLibrarySongSavePlan({
      ...importDraft(11),
      album: "  Smoke Album  ",
      artist: " Unknown Artist ",
    }),
    {
      albumName: "Smoke Album",
      artistNames: [],
    },
  );
}

function assertBackupScreenSmoke() {
  const idleState: BackupSessionState = {
    error: null,
    lastOperation: null,
    message: null,
    phase: "idle",
    requiresPremium: true,
  };
  const runningState: BackupSessionState = {
    ...idleState,
    lastOperation: "restore",
    phase: "running",
  };
  const failureState: BackupSessionState = {
    ...idleState,
    error: "Restore failed.",
    lastOperation: "restore",
    phase: "failure",
  };
  const successState: BackupSessionState = {
    ...idleState,
    lastOperation: "backup",
    message: "Backup complete.",
    phase: "success",
  };
  const startedBackupState = backupSessionReducer(
    initialBackupSessionState,
    {
      operation: "backup",
      type: "start",
    },
  );

  assert.deepEqual(
    backupActionCards.map((card) => card.operation),
    ["backup", "restore", "erase"],
  );
  assert.deepEqual(startedBackupState, {
    error: null,
    lastOperation: "backup",
    message: null,
    phase: "running",
    requiresPremium: true,
  });
  assert.deepEqual(
    backupSessionReducer(startedBackupState, {
      result: {
        message: "Backup complete.",
        operation: "backup",
      },
      type: "succeed",
    }),
    successState,
  );
  assert.deepEqual(
    backupSessionReducer(startedBackupState, {
      error: "Backup failed.",
      operation: "backup",
      type: "fail",
    }),
    {
      error: "Backup failed.",
      lastOperation: "backup",
      message: null,
      phase: "failure",
      requiresPremium: true,
    },
  );
  assert.deepEqual(
    backupSessionReducer(successState, { type: "reset" }),
    initialBackupSessionState,
  );
  assert.equal(
    getBackupSessionErrorMessage(new Error("Backup smoke failure")),
    "Backup smoke failure",
  );
  assert.equal(
    getBackupSessionErrorMessage(null),
    "Backup operation failed.",
  );
  assert.equal(getBackupOperationLabel("backup"), "Backup");
  assert.equal(getBackupOperationLabel("erase"), "Erase");
  assert.deepEqual(
    getBackupActionState({
      operation: "backup",
      premiumActive: false,
      state: idleState,
    }),
    {
      buttonLabel: "Backup",
      isDanger: false,
      isDisabled: false,
      showPremiumBadge: true,
    },
  );
  assert.deepEqual(
    getBackupActionState({
      operation: "erase",
      premiumActive: true,
      state: runningState,
    }),
    {
      buttonLabel: "Erase",
      isDanger: true,
      isDisabled: true,
      showPremiumBadge: false,
    },
  );
  assert.equal(getBackupConfirmationState("backup"), null);
  assert.deepEqual(getBackupConfirmationState("restore"), {
    body: "This replaces the current local library with the selected backup archive.",
    confirmLabel: "Restore",
    title: "Restore library",
  });
  assert.deepEqual(getBackupConfirmationState("erase"), {
    body: "This removes local songs, collections, metadata, and library files from this device.",
    confirmLabel: "Erase",
    title: "Erase library",
  });
  assert.deepEqual(getBackupStatusState(idleState), {
    canReset: false,
    isFailure: false,
    message: "No backup operation has run.",
  });
  assert.deepEqual(getBackupStatusState(runningState), {
    canReset: false,
    isFailure: false,
    message: "Restore running",
  });
  assert.deepEqual(getBackupStatusState(successState), {
    canReset: false,
    isFailure: false,
    message: "Backup complete.",
  });
  assert.deepEqual(getBackupStatusState(failureState), {
    canReset: true,
    isFailure: true,
    message: "Restore failed.",
  });
  assert.deepEqual(
    getBackupPhaseTransitionEffects({
      currentState: idleState,
      previousPhase: "idle",
    }),
    {
      haptic: null,
      shouldResetRuntimeSessions: false,
    },
  );
  assert.deepEqual(
    getBackupPhaseTransitionEffects({
      currentState: successState,
      previousPhase: "running",
    }),
    {
      haptic: "success",
      shouldResetRuntimeSessions: false,
    },
  );
  assert.deepEqual(
    getBackupPhaseTransitionEffects({
      currentState: { ...successState, lastOperation: "restore" },
      previousPhase: "running",
    }),
    {
      haptic: "success",
      shouldResetRuntimeSessions: true,
    },
  );
  assert.deepEqual(
    getBackupPhaseTransitionEffects({
      currentState: failureState,
      previousPhase: "running",
    }),
    {
      haptic: "error",
      shouldResetRuntimeSessions: false,
    },
  );
}

function assertPremiumScreenSmoke() {
  const tiers: PremiumTier[] = [
    {
      description: "Monthly access.",
      id: "monthly",
      label: "Monthly",
      price: "$1",
    },
    {
      description: "Yearly access.",
      id: "yearly",
      label: "Yearly",
      price: "$10",
    },
  ];
  const idleState: PremiumPurchaseState = {
    active: false,
    error: null,
    message: null,
    phase: "idle",
    selectedTierId: "yearly",
  };
  const loadingState: PremiumPurchaseState = {
    ...idleState,
    phase: "loading",
  };
  const activeState: PremiumPurchaseState = {
    ...idleState,
    active: true,
    selectedTierId: "monthly",
  };
  const failureState: PremiumPurchaseState = {
    ...idleState,
    error: "Premium purchase failed.",
    phase: "failure",
  };

  assert.deepEqual(premiumFeatureCopy, [
    "Unlimited library import",
    "Backup and restore",
    "Customization controls",
    "Support future SYNQ development",
  ]);
  assert.equal(
    getSelectedPremiumTier({ state: idleState, tiers })?.label,
    "Yearly",
  );
  assert.equal(
    getSelectedPremiumTier({
      state: { ...idleState, selectedTierId: "lifetime" },
      tiers,
    }),
    null,
  );
  assert.deepEqual(
    getPremiumActionState({
      selectedTier: getSelectedPremiumTier({ state: idleState, tiers }),
      state: idleState,
    }),
    {
      canPurchase: true,
      canRestore: true,
      purchaseLabel: "Choose Yearly",
    },
  );
  assert.deepEqual(
    getPremiumActionState({
      selectedTier: null,
      state: loadingState,
    }),
    {
      canPurchase: false,
      canRestore: false,
      purchaseLabel: "Choose plan",
    },
  );
  assert.deepEqual(getPremiumStatusState(idleState), {
    canReset: false,
    isFailure: false,
    message: "Choose a plan or restore a previous purchase.",
  });
  assert.deepEqual(getPremiumStatusState(activeState), {
    canReset: false,
    isFailure: false,
    message: "Premium is active.",
  });
  assert.deepEqual(getPremiumStatusState(failureState), {
    canReset: true,
    isFailure: true,
    message: "Premium purchase failed.",
  });
  assert.equal(
    getPremiumMutationErrorMessage({
      caughtError: new Error("Premium smoke failure"),
      mutation: "purchase-tier",
    }),
    "Premium smoke failure",
  );
  assert.equal(
    getPremiumMutationErrorMessage({
      caughtError: null,
      mutation: "purchase-tier",
    }),
    "Premium purchase failed.",
  );
  assert.equal(
    getPremiumMutationErrorMessage({
      caughtError: "unknown",
      mutation: "restore-purchase",
    }),
    "Premium restore failed.",
  );
  assert.equal(
    getPremiumMutationErrorMessage({
      caughtError: undefined,
      mutation: "check-entitlement",
    }),
    "Premium entitlement could not be checked.",
  );
}

function assertSettingsScreenSmoke() {
  assert.deepEqual(getPrivacyScreenState({ status: "loading" }), {
    isAnalyticsDisabled: true,
    statusLabel: "Loading",
  });
  assert.deepEqual(getPrivacyScreenState({ status: "saving" }), {
    isAnalyticsDisabled: false,
    statusLabel: "Saving",
  });
  assert.deepEqual(getPrivacyScreenState({ status: "idle" }), {
    isAnalyticsDisabled: false,
    statusLabel: "Saved locally",
  });
  assert.deepEqual(
    getCustomizationScreenState({ premiumActive: false, status: "idle" }),
    {
      hapticsDisabled: false,
      showPremiumPanel: true,
      statusLabel: "Preferences saved locally",
      themeControlsDisabled: true,
    },
  );
  assert.deepEqual(
    getCustomizationScreenState({ premiumActive: true, status: "loading" }),
    {
      hapticsDisabled: true,
      showPremiumPanel: false,
      statusLabel: "Preferences saved locally",
      themeControlsDisabled: true,
    },
  );
  assert.deepEqual(
    getCustomizationScreenState({ premiumActive: true, status: "saving" }),
    {
      hapticsDisabled: false,
      showPremiumPanel: false,
      statusLabel: "Saving",
      themeControlsDisabled: false,
    },
  );
  assert.deepEqual(
    getCustomizationOptionState({
      disabled: false,
      optionKey: "blue",
      selectedKey: "blue",
    }),
    {
      accessibilityState: { disabled: false, selected: true },
      isSelected: true,
    },
  );
  assert.deepEqual(
    getCustomizationOptionState({
      disabled: true,
      optionKey: "mint",
      selectedKey: "blue",
    }),
    {
      accessibilityState: { disabled: true, selected: false },
      isSelected: false,
    },
  );
  assert.equal(
    shouldSendHapticForHapticsToggle({ hapticsEnabled: true }),
    true,
  );
  assert.equal(
    shouldSendHapticForHapticsToggle({ hapticsEnabled: false }),
    false,
  );
  assert.equal(
    getCustomizationSettingsErrorMessage(
      new Error("Customization smoke failure"),
    ),
    "Customization smoke failure",
  );
  assert.equal(
    getCustomizationSettingsErrorMessage(null),
    "Customization settings failed.",
  );
  assert.equal(
    getPrivacySettingsErrorMessage(new Error("Privacy smoke failure")),
    "Privacy smoke failure",
  );
  assert.equal(getPrivacySettingsErrorMessage(undefined), "Privacy settings failed.");
}

assertDurationFormatSmoke();
assertRouteParamSmoke();
assertHomeScreenSmoke();
assertImportSongFormSmoke();
assertImportLibrarySavePlanSmoke();
assertWifiImportRequestSmoke();
assertBackupScreenSmoke();
assertPremiumScreenSmoke();
assertSettingsScreenSmoke();
assertPlaybackSessionSmoke();
assertPlaybackNativeStatusSmoke();
assertPlaybackNativeCommandPlanSmoke();
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
