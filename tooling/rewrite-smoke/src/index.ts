import assert from "node:assert/strict";
import {
  formatDurationMs,
  formatRemainingDurationMs,
} from "../../../apps/new/src/features/app-shell/services/duration-format-service";
import {
  getHomeGuideSections,
  getHomeQuickActions,
  getHomeScreenViewState,
} from "../../../apps/new/src/features/app-shell/services/home-screen-service";
import {
  getHomeNowPlayingActions,
  getHomeNowPlayingState,
} from "../../../apps/new/src/features/app-shell/services/home-now-playing-service";
import {
  getHomeLibraryHref,
  getHomeRecentSongHref,
  getHomeRecentSongsSectionState,
} from "../../../apps/new/src/features/app-shell/services/home-recent-songs-service";
import {
  rewriteFeatures,
  rewriteManualSmokeAreas,
  rewriteReleaseGates,
  rewriteReleaseReadiness,
  rewriteStatusTotals,
} from "../../../apps/new/src/features/rewrite-feature-map";
import { parseNumericRouteParam } from "../../../apps/new/src/features/app-shell/services/route-param-service";
import {
  getActiveTrack,
  getNextQueueIndex,
} from "../../../apps/new/src/features/playback/services/playback-queue-selection-service";
import {
  setPlaybackActiveQueueIndex,
} from "../../../apps/new/src/features/playback/services/playback-active-track-service";
import {
  getPlaybackQueueActionState,
} from "../../../apps/new/src/features/playback/services/playback-queue-action-state-service";
import {
  getPlaybackQueueClearCommand,
  getPlaybackQueueMoveCommand,
  getPlaybackQueuePlayCommand,
  getPlaybackQueueRemoveCommand,
} from "../../../apps/new/src/features/playback/services/playback-queue-command-state-service";
import {
  runPlaybackQueueClearCommand,
  runPlaybackQueueMoveCommand,
  runPlaybackQueuePlayCommand,
  runPlaybackQueueRemoveCommand,
} from "../../../apps/new/src/features/playback/services/playback-queue-command-flow-service";
import {
  createPlaybackQueueActions,
} from "../../../apps/new/src/features/playback/services/playback-queue-action-service";
import {
  runPlaybackQueueAddSongCommand,
  runPlaybackQueueClearSessionCommand,
  runPlaybackQueueMoveSongCommand,
  runPlaybackQueueRemoveSongCommand,
  runPlaybackQueueToggleLoopCommand,
  runPlaybackQueueToggleShuffleCommand,
} from "../../../apps/new/src/features/playback/services/playback-queue-session-command-flow-service";
import {
  createPlaybackQueueCommands,
} from "../../../apps/new/src/features/playback/services/playback-queue-command-service";
import {
  createPlaybackCommands,
} from "../../../apps/new/src/features/playback/services/playback-command-controller-service";
import { runPlaybackTrackAdvancementCommand } from "../../../apps/new/src/features/playback/services/playback-track-advancement-command-flow-service";
import {
  createPlaybackTrackAdvancementCommand,
} from "../../../apps/new/src/features/playback/services/playback-track-advancement-command-service";
import {
  getPlaybackQueueRowPresentation,
  getPlaybackQueueRowState,
} from "../../../apps/new/src/features/playback/services/playback-queue-row-service";
import {
  initialPlaybackState,
} from "../../../apps/new/src/features/playback/services/playback-initial-state-service";
import {
  getAddPlaybackQueueSongAction,
  getHydratePlaybackAction,
  getMovePlaybackQueueSongAction,
  getTogglePlaybackLoopAction,
  getTogglePlaybackShuffleAction,
  type PlaybackAction,
} from "../../../apps/new/src/features/playback/services/playback-session-action-service";
import {
  playbackReducer,
} from "../../../apps/new/src/features/playback/services/playback-session-service";
import {
  getPlaybackSessionValue,
  type PlaybackCommands,
} from "../../../apps/new/src/features/playback/services/playback-session-value-service";
import {
  getBeginPlaybackAdBreakAction,
  getCompletePlaybackAdBreakAction,
  getSyncPlaybackPremiumAction,
} from "../../../apps/new/src/features/playback/services/playback-ad-gate-service";
import {
  canRunPlaybackWithAdGate,
  getPlaybackAdGateControllerDecisions,
  shouldResumePlaybackAfterPremium,
  shouldStartPlaybackAdBreak,
} from "../../../apps/new/src/features/playback/services/playback-ad-gate-decision-service";
import {
  createPlaybackAdGateControls,
} from "../../../apps/new/src/features/playback/services/playback-ad-gate-controller-service";
import {
  failPlaybackSession,
  hydratePlaybackSession,
  togglePlaybackLoopMode,
  togglePlaybackShuffleMode,
} from "../../../apps/new/src/features/playback/services/playback-session-step-service";
import {
  addPlaybackQueueSong,
  clearPlaybackQueue,
  movePlaybackQueueSong,
  removePlaybackQueueSong,
} from "../../../apps/new/src/features/playback/services/playback-session-queue-service";
import {
  getPlaybackQueueMoveUpdate,
  getPlaybackQueueRemovalUpdate,
} from "../../../apps/new/src/features/playback/services/playback-session-queue-step-service";
import {
  normalizePlaybackState,
  toPersistedPlaybackState,
} from "../../../apps/new/src/features/playback/services/playback-persistence-codec-service";
import {
  finiteNumber,
  isRecord,
  normalizeQueueItem,
  numberOrNull,
} from "../../../apps/new/src/features/playback/services/playback-persistence-step-service";
import {
  normalizeAdGate,
  normalizeRestoredAdGate,
} from "../../../apps/new/src/features/playback/services/playback-persistence-ad-gate-service";
import {
  normalizeMode,
  normalizeQueueFilter,
  normalizeSource,
} from "../../../apps/new/src/features/playback/services/playback-persistence-domain-service";
import {
  clearPersistedPlaybackStateWithDependencies,
  getPlaybackStateDirectoryWithDependencies,
  getPlaybackStateFileWithDependencies,
  loadPersistedPlaybackStateWithDependencies,
  savePersistedPlaybackStateWithDependencies,
  type PlaybackPersistenceDependencies,
} from "../../../apps/new/src/features/playback/services/playback-persistence-executor-service";
import {
  runPlaybackHydrateCommand,
  runPlaybackPersistenceCommand,
} from "../../../apps/new/src/features/playback/services/playback-persistence-command-flow-service";
import {
  getFreeListeningRemainingMs,
  getPlaybackPlayerControllerViewState,
  getPlaybackPlayerViewState,
  getPlaybackProgressPercent,
  getSeekTargetPosition,
} from "../../../apps/new/src/features/playback/services/playback-player-state-service";
import {
  getPlaybackPlayerActionState,
} from "../../../apps/new/src/features/playback/services/playback-player-action-state-service";
import {
  getPlaybackPlayerButtonCommand,
  getPlaybackPlayerPlayPauseCommand,
  getPlaybackPlayerSeekCommand,
} from "../../../apps/new/src/features/playback/services/playback-player-command-state-service";
import {
  runPlaybackPlayerButtonCommand,
  runPlaybackPlayerPlayPauseCommand,
  runPlaybackPlayerSeekCommand,
} from "../../../apps/new/src/features/playback/services/playback-player-command-flow-service";
import {
  createPlaybackPlayerCommands,
} from "../../../apps/new/src/features/playback/services/playback-player-command-service";
import {
  getPlaybackAdBreakPanelState,
  getPlaybackPlayerHref,
  getPlaybackPlayerScreenState,
  getPlaybackPremiumHref,
  getPlaybackQueueHref,
} from "../../../apps/new/src/features/playback/services/playback-screen-state-service";
import {
  getPlaybackQueueEmptyState,
  getPlaybackQueueControllerViewState,
  getPlaybackQueueScreenState,
  getPlaybackQueueViewState,
} from "../../../apps/new/src/features/playback/services/playback-queue-screen-state-service";
import {
  getPlaybackMiniPlayerState,
  getPlaybackMiniPlayerViewState,
} from "../../../apps/new/src/features/playback/services/playback-mini-player-state-service";
import { audioStatusToTrackPlayerSnapshot } from "../../../apps/new/src/features/playback/services/playback-native-status-service";
import {
  getPlaybackAdStatusUpdate,
  getPlaybackLibraryStatusUpdate,
} from "../../../apps/new/src/features/playback/services/playback-native-transition-step-service";
import {
  getPlaybackNativeFailureAction,
  getPlaybackNativeFinishedAction,
  getPlaybackNativeStatusAction,
} from "../../../apps/new/src/features/playback/services/playback-native-transition-service";
import { runPlaybackNativeStatusCommand } from "../../../apps/new/src/features/playback/services/playback-native-status-command-flow-service";
import {
  getPlaybackNativeLibraryAudioSource,
} from "../../../apps/new/src/features/playback/services/playback-native-library-source-service";
import {
  getPlaybackNativePlayerPlayAdState,
  getPlaybackNativePlayerPlayLibraryPlan,
  getPlaybackNativePlayerPlayLibraryState,
  getPlaybackNativePlayerRemoveSourceState,
  getPlaybackNativePlayerResumeLibraryState,
  initialPlaybackNativePlayerRegistryState,
} from "../../../apps/new/src/features/playback/services/playback-native-player-state-service";
import {
  getPlaybackNativeLibraryPlaybackTarget,
  getPlaybackNativePlayerControlTarget,
} from "../../../apps/new/src/features/playback/services/playback-native-player-target-service";
import {
  getPlaybackNativeCommandErrorMessage,
  getRemoveFromQueueNativeCommandPlan,
  getResumeNativeCommandPlan,
  getSkipNextNativeCommandPlan,
  getSkipPreviousNativeCommandPlan,
} from "../../../apps/new/src/features/playback/services/playback-native-command-plan-service";
import {
  createPlaybackNativeCommandRunner,
} from "../../../apps/new/src/features/playback/services/playback-native-command-runner-service";
import {
  getPlaybackNativePreviousCommandPlan,
  getPlaybackNativeReplacementCommandPlan,
  getPlaybackNativeResumeCommandPlan,
  getPlaybackNativeTargetCommandPlan,
} from "../../../apps/new/src/features/playback/services/playback-native-command-step-service";
import { runAdGatedPlaybackCommand } from "../../../apps/new/src/features/playback/services/playback-command-gate-service";
import {
  handlePlaybackRemoteCommand,
  type PlaybackRemoteCommandHandlers,
} from "../../../apps/new/src/features/playback/services/playback-remote-command-service";
import {
  createPlaybackRemoteCommandHandler,
} from "../../../apps/new/src/features/playback/services/playback-remote-command-handler-service";
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
import {
  createPlaybackCommandRunners,
} from "../../../apps/new/src/features/playback/services/playback-command-runner-service";
import {
  runPlaybackTransportPauseCommand,
  runPlaybackTransportPlaySongCommand,
  runPlaybackTransportResumeCommand,
  runPlaybackTransportSeekCommand,
  runPlaybackTransportSkipNextCommand,
  runPlaybackTransportSkipPreviousCommand,
} from "../../../apps/new/src/features/playback/services/playback-transport-command-flow-service";
import {
  createPlaybackTransportCommands,
} from "../../../apps/new/src/features/playback/services/playback-transport-command-service";
import {
  getClearQueuePlaybackStepPlan,
  getPausePlaybackStepPlan,
  getPlaySongPlaybackStepPlan,
  getRemoteFailurePlaybackStepPlan,
  getResetPlaybackStepPlan,
  getSeekToPlaybackStepPlan,
} from "../../../apps/new/src/features/playback/services/playback-command-step-service";
import type { PlaybackQueueItem } from "../../../apps/new/src/features/playback/types/playback-state";
import {
  getImportDiscardResultHref,
  getImportExportHref,
  getImportFilesHref,
  getImportFilesResultHref,
  getImportFinishResultHref,
  getImportHomeHref,
  getImportLibraryHref,
  getImportPremiumHref,
  getImportSaveHref,
} from "../../../apps/new/src/features/import/services/import-navigation-service";
import {
  getImportSaveExportErrorMessage,
  getImportSaveExportBeginAction,
  getImportSaveExportFailureCommand,
  getImportSaveExportFinishAction,
  getImportSaveExportSuccessCommand,
  importSaveExportReducer,
  initialImportSaveExportState,
} from "../../../apps/new/src/features/import/services/import-save-export-state-service";
import {
  runImportSaveExportAction,
} from "../../../apps/new/src/features/import/services/import-save-export-action-flow-service";
import {
  createImportSaveControllerActions,
} from "../../../apps/new/src/features/import/services/import-save-controller-action-service";
import { runImportSaveRemoveSongAction } from "../../../apps/new/src/features/import/services/import-save-song-action-flow-service";
import {
  getImportDiscardResultCommand,
  getImportFinishResultCommand,
  getImportSaveSessionStartHaptic,
  getImportSaveToggleCommand,
} from "../../../apps/new/src/features/import/services/import-save-session-command-service";
import {
  runImportDiscardAction,
  runImportFinishAction,
  runImportSaveToggleAction,
} from "../../../apps/new/src/features/import/services/import-save-session-action-flow-service";
import {
  createImportSaveSessionActions,
} from "../../../apps/new/src/features/import/services/import-save-session-action-service";
import {
  getImportReviewRequestAttemptState,
  normalizeImportReviewRequestState,
  requestImportReviewIfEligibleWithDependencies,
  type ImportReviewRequestState,
} from "../../../apps/new/src/features/import/services/import-review-request-executor-service";
import {
  getImportSaveActionState,
} from "../../../apps/new/src/features/import/services/import-save-action-state-service";
import {
  getImportSaveBackLink,
  getImportSaveHeaderState,
  getImportSaveLibraryToggleState,
} from "../../../apps/new/src/features/import/services/import-save-header-state-service";
import { getImportSaveViewState } from "../../../apps/new/src/features/import/services/import-save-view-state-service";
import {
  getImportSongPreviewEmptyState,
  getImportSongPreviewListState,
} from "../../../apps/new/src/features/import/services/import-song-preview-state-service";
import {
  getImportFailureState,
  getImportSuccessState,
} from "../../../apps/new/src/features/import/services/import-result-state-service";
import {
  getImportFailureViewState,
  getImportSuccessViewState,
} from "../../../apps/new/src/features/import/services/import-result-view-state-service";
import {
  getImportFilesActionState,
} from "../../../apps/new/src/features/import/services/import-files-action-state-service";
import {
  getImportFilesActionLinks,
} from "../../../apps/new/src/features/import/services/import-files-navigation-state-service";
import {
  getImportFilesViewState,
} from "../../../apps/new/src/features/import/services/import-files-view-state-service";
import {
  getImportHomeRouteSelectCommand,
  getImportHomeState,
} from "../../../apps/new/src/features/import/services/import-home-screen-state-service";
import {
  getImportPremiumGateActionCommand,
  getImportPremiumGateState,
} from "../../../apps/new/src/features/import/services/import-premium-gate-state-service";
import {
  getPremiumScopedImportSongs,
} from "../../../apps/new/src/features/import/services/import-premium-access-service";
import {
  runImportHomeRouteSelectAction,
} from "../../../apps/new/src/features/import/services/import-home-route-select-action-flow-service";
import {
  runImportPremiumGateAction,
} from "../../../apps/new/src/features/import/services/import-premium-gate-action-flow-service";
import {
  getImportWifiActionState,
  getImportWifiReviewSaveHaptic,
} from "../../../apps/new/src/features/import/services/import-wifi-action-state-service";
import {
  getImportWifiState,
} from "../../../apps/new/src/features/import/services/import-wifi-status-state-service";
import {
  getImportWifiViewState,
} from "../../../apps/new/src/features/import/services/import-wifi-view-state-service";
import {
  createImportWifiControllerActions,
} from "../../../apps/new/src/features/import/services/import-wifi-controller-action-service";
import {
  getHydrateImportSessionAction,
  getSavingImportSessionAction,
  importSessionReducer,
  type ImportSessionAction,
} from "../../../apps/new/src/features/import/services/import-session-state-service";
import {
  beginImportFilePick,
  failImportSession,
} from "../../../apps/new/src/features/import/services/import-session-step-service";
import {
  beginImportWifiTransfer,
  receiveImportWifiSong,
} from "../../../apps/new/src/features/import/services/import-session-wifi-step-service";
import {
  removeImportSongs,
  reviewImportSongs,
  updateImportSong,
} from "../../../apps/new/src/features/import/services/import-session-song-step-service";
import {
  discardImportSession,
  finishImportSession,
  setImportSaveToLibrary,
  startImportSessionSave,
} from "../../../apps/new/src/features/import/services/import-session-save-step-service";
import {
  initialImportSessionState,
} from "../../../apps/new/src/features/import/services/import-session-initial-state-service";
import {
  getBeginFilePickAction,
  getBeginWifiTransferAction,
  getFailImportSessionAction,
  getFinishWifiTransferAction,
  getReceiveWifiSongAction,
  getRemoveImportSongsAction,
  getReviewImportSongsAction,
  getSetImportSaveToLibraryAction,
  getUpdateImportSongAction,
} from "../../../apps/new/src/features/import/services/import-session-action-service";
import {
  createImportSessionCommands,
} from "../../../apps/new/src/features/import/services/import-session-command-composer-service";
import {
  getImportSessionCommandErrorMessage,
} from "../../../apps/new/src/features/import/services/import-session-command-error-service";
import {
  runBeginImportFilePickCommand,
  runFailImportSessionCommand,
  runReviewImportSongsCommand,
  runSetImportSaveToLibraryCommand,
  runUpdateImportSongCommand,
} from "../../../apps/new/src/features/import/services/import-session-command-flow-service";
import {
  createImportSessionBasicCommands,
} from "../../../apps/new/src/features/import/services/import-session-basic-command-service";
import {
  runBeginWifiTransferCommand,
  runFinishWifiTransferCommand,
  runReceiveWifiSongCommand,
} from "../../../apps/new/src/features/import/services/import-session-wifi-command-flow-service";
import {
  createImportSessionWifiCommands,
} from "../../../apps/new/src/features/import/services/import-session-wifi-command-service";
import {
  discardImportSessionLifecycle,
  getFinishImportSessionAction,
  resetImportSessionLifecycle,
  saveImportSessionLifecycle,
} from "../../../apps/new/src/features/import/services/import-session-lifecycle-service";
import {
  runDiscardImportSessionCommand,
  runFinishImportSessionCommand,
  runResetImportSessionCommand,
  runSaveImportSessionCommand,
} from "../../../apps/new/src/features/import/services/import-session-lifecycle-command-flow-service";
import {
  createImportSessionLifecycleCommands,
} from "../../../apps/new/src/features/import/services/import-session-lifecycle-command-service";
import {
  normalizePersistedImportSession,
  toPersistedImportSession,
} from "../../../apps/new/src/features/import/services/import-session-persistence-normalizer-service";
import {
  clearPersistedImportSessionStateWithDependencies,
  getImportSessionDirectoryWithDependencies,
  getImportSessionFileWithDependencies,
  loadPersistedImportSessionStateWithDependencies,
  savePersistedImportSessionStateWithDependencies,
  type ImportSessionPersistenceDependencies,
} from "../../../apps/new/src/features/import/services/import-session-persistence-executor-service";
import { filterExistingImportDraftsWithDependencies } from "../../../apps/new/src/features/import/services/import-session-persistence-filter-service";
import {
  runImportSessionHydrateCommand,
  runImportSessionPersistenceCommand,
} from "../../../apps/new/src/features/import/services/import-session-persistence-command-flow-service";
import {
  getImportSessionDirectory,
  getImportSessionFile,
  getRestoredImportSessionState,
} from "../../../apps/new/src/features/import/services/import-session-persistence-step-service";
import {
  getImportSongEditActionState,
} from "../../../apps/new/src/features/import/services/import-song-edit-action-state-service";
import {
  getImportSongEditControllerResultState,
} from "../../../apps/new/src/features/import/services/import-song-edit-controller-result-state-service";
import {
  getImportSongEditErrorMessage,
  getImportSongEditRequiredTitleMessage,
} from "../../../apps/new/src/features/import/services/import-song-edit-error-copy-service";
import {
  getImportSongEditFieldState,
} from "../../../apps/new/src/features/import/services/import-song-edit-field-state-service";
import {
  getImportSongEditChangeFieldAction,
  getImportSongEditInitialState,
  type ImportSongEditFormAction,
  importSongEditFormReducer,
} from "../../../apps/new/src/features/import/services/import-song-edit-form-reducer-service";
import {
  buildEditedImportSongDraft,
  parseImportTrackInput,
} from "../../../apps/new/src/features/import/services/import-song-edit-draft-service";
import {
  getImportSongDraftForEdit,
  getImportSongEditScreenState,
} from "../../../apps/new/src/features/import/services/import-song-edit-screen-state-service";
import {
  getImportSongEditInvalidSaveCommand,
  getImportSongEditSaveFailureCommand,
  getImportSongEditSaveSuccessCommand,
} from "../../../apps/new/src/features/import/services/import-song-edit-command-service";
import { runImportSongEditSaveCommand } from "../../../apps/new/src/features/import/services/import-song-edit-command-flow-service";
import {
  getImportSongEditBackLinks,
  getImportSongEditFilesHref,
  getImportSongEditHref,
  getImportSongEditInvalidState,
  getImportSongEditSaveHref,
} from "../../../apps/new/src/features/import/services/import-song-edit-navigation-service";
import {
  buildImportLibrarySongSavePlan,
  hasMeaningfulImportLibraryName,
  splitImportLibraryNames,
} from "../../../apps/new/src/features/import/services/import-library-save-plan-service";
import {
  ensureImportLibraryAlbum,
  ensureImportLibraryArtist,
} from "../../../apps/new/src/features/import/services/import-library-entity-link-service";
import {
  linkImportSongToLibraryWithDependencies,
  type ImportLibraryLinkDependencies,
} from "../../../apps/new/src/features/import/services/import-library-link-executor-service";
import {
  linkImportLibrarySongAlbum,
  linkImportLibrarySongArtists,
  updateImportLibraryAlbumCover,
} from "../../../apps/new/src/features/import/services/import-library-link-operation-service";
import {
  getImportAlbumCoverUpdateParams,
  getImportArtistAlbumLinkParams,
  getImportSongAlbumLinkParams,
  getImportSongArtistLinkParams,
} from "../../../apps/new/src/features/import/services/import-library-link-step-service";
import {
  deleteLibrarySongFilesWithDependencies,
  getImportLibraryDirectoryWithDependencies,
  getImportLibrarySongDirectory,
  getImportLibrarySongFile,
  moveImportAudioToLibraryWithDependencies,
  type ImportLibraryFileDependencies,
} from "../../../apps/new/src/features/import/services/import-library-file-executor-service";
import {
  saveImportSongToLibrary,
  type ImportLibrarySongSaveDependencies,
} from "../../../apps/new/src/features/import/services/import-library-song-save-executor-service";
import {
  deleteFailedImportLibrarySong,
  getImportLibrarySongSaveErrorMessage,
  updateImportLibrarySongCoverFromArtwork,
} from "../../../apps/new/src/features/import/services/import-library-song-save-step-service";
import {
  deleteImportLibrarySongRowsWithDependencies,
  getImportSongDraftInsertValues,
  insertImportSongDraftWithDependencies,
  updateImportLibrarySongCoverWithDependencies,
  updateImportLibrarySongPathWithDependencies,
  type ImportLibrarySongRowDependencies,
} from "../../../apps/new/src/features/import/repository/import-library-song-executor-repository";
import {
  discardImportSongs,
  saveImportSongsToLibrary,
} from "../../../apps/new/src/features/import/services/import-library-session-save-executor-service";
import {
  clearImportCacheWithDependencies,
  copyAssetToImportCacheWithDependencies,
  createImportCacheDirectoryWithDependencies,
  deleteImportDraftCacheFilesWithDependencies,
  writeBase64AssetToImportCacheWithDependencies,
  type ImportFileCacheDependencies,
} from "../../../apps/new/src/features/import/services/import-file-cache-executor-service";
import {
  getBase64ImportCacheDestination,
  getCopyImportCacheDestination,
  getImportCacheDirectory,
  sanitizeImportCacheFileName,
} from "../../../apps/new/src/features/import/services/import-file-cache-step-service";
import {
  selectImportFilesWithDependencies,
  stageWifiImportFileWithDependencies,
  type ImportFileSelectionDependencies,
} from "../../../apps/new/src/features/import/services/import-file-selection-executor-service";
import {
  getCachedImportFileProcessParams,
  getWifiImportFileProcessParams,
} from "../../../apps/new/src/features/import/services/import-file-selection-step-service";
import {
  processImportAssetWithDependencies,
  processImportAssetsWithDependencies,
} from "../../../apps/new/src/features/import/services/import-file-selection-operation-service";
import {
  getImportFileCommandErrorMessage,
  getImportFileRemovalResultCommand,
  getImportFileRemovalStartHaptic,
  getImportFileSelectionResultCommand,
  getImportFileSelectionStartHaptic,
} from "../../../apps/new/src/features/import/services/import-file-command-service";
import {
  runImportFileRemovalCommand,
  runImportFileSelectionCommand,
} from "../../../apps/new/src/features/import/services/import-file-command-flow-service";
import {
  createImportFileCommands,
} from "../../../apps/new/src/features/import/services/import-file-command-controller-service";
import {
  runImportFilesChooseAction,
  runImportFilesRemoveAction,
} from "../../../apps/new/src/features/import/services/import-files-action-flow-service";
import {
  createImportFilesControllerActions,
} from "../../../apps/new/src/features/import/services/import-files-controller-action-service";
import {
  runImportWifiRemoveSongAction,
  runImportWifiReviewSaveAction,
} from "../../../apps/new/src/features/import/services/import-wifi-action-flow-service";
import {
  getWifiImportServerStartErrorMessage,
  getWifiUploadFailureResponse,
  wifiImportFinishResponse,
  wifiImportPrepareFailureResponse,
  wifiImportResetResponse,
} from "../../../apps/new/src/features/import/services/wifi-import-response-service";
import {
  getWifiStartTransferDecision,
  getWifiTransferSize,
  isWifiImportTransferPathname,
} from "../../../apps/new/src/features/import/services/wifi-import-transfer-decision-service";
import {
  getWifiUploadDecision,
} from "../../../apps/new/src/features/import/services/wifi-import-upload-decision-service";
import {
  getWifiImportServerAddress,
  getWifiImportServerStopAction,
  initialWifiImportServerState,
  wifiImportServerReducer,
} from "../../../apps/new/src/features/import/services/wifi-import-server-state-service";
import {
  resolveWifiImportServerAddressAction,
  startWifiImportServerWithDependencies,
} from "../../../apps/new/src/features/import/services/wifi-import-server-command-service";
import {
  runWifiImportServerAddressLoadCommand,
  runWifiImportServerStartupCommand,
} from "../../../apps/new/src/features/import/services/wifi-import-server-command-flow-service";
import {
  createWifiImportRouteHandlers,
  type WifiImportRouteHandlerDependencies,
} from "../../../apps/new/src/features/import/services/wifi-import-route-handler-service";
import type {
  WifiBridgeRequest,
  WifiBridgeResponse,
} from "../../../apps/new/src/features/import/services/wifi-import-bridge-types";
import {
  createWifiImportRouteRuntimeState,
} from "../../../apps/new/src/features/import/services/wifi-import-route-runtime-state-service";
import { getWifiTransferPage } from "../../../apps/new/src/features/import/services/wifi-transfer-page";
import type { ImportSongDraft } from "../../../apps/new/src/features/import/types/import-session";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
} from "../../../apps/new/src/features/library/services/library-collection-detail-service";
import {
  buildAlbumDetailResult,
  buildArtistDetailResult,
  buildPlaylistDetailResult,
  getCollectionDetailResultErrors,
  getCollectionDetailResultUpdatedAt,
} from "../../../apps/new/src/features/library/services/library-collection-detail-result-service";
import { rowsToCollectionDetailSongs } from "../../../apps/new/src/features/library/services/library-collection-detail-song-service";
import {
  getAddCollectionSongsControllerResultState,
  getAddableSongRows,
  getAddableSongRowState,
  getAddableSongSelectionState,
  getSelectedAddableSongIds,
  removeSongIdSelection,
  toggleSongIdSelection,
} from "../../../apps/new/src/features/library/services/add-collection-songs-selection-service";
import {
  addCollectionSongsControllerReducer,
  getAddCollectionSongsFinishSelectionAction,
  getAddCollectionSongsFinishSongAction,
  initialAddCollectionSongsControllerState,
} from "../../../apps/new/src/features/library/services/add-collection-songs-state-service";
import {
  addCollectionSongsSearchReducer,
  getAddCollectionSongsSearchSetQueryAction,
  initialAddCollectionSongsSearchState,
} from "../../../apps/new/src/features/library/services/add-collection-songs-search-state-service";
import {
  getAddCollectionSongsBlockedCommand,
  getAddCollectionSongsFailureCommand,
  getAddCollectionSongsMutationErrorMessage,
  getAddCollectionSongsSelectionStartCommand,
  getAddCollectionSongsSelectionSuccessCommand,
  getAddCollectionSongsSongStartCommand,
  getAddCollectionSongsSongSuccessCommand,
  getAddCollectionSongsToggleSelectionCommand,
} from "../../../apps/new/src/features/library/services/add-collection-songs-command-state-service";
import {
  runAddCollectionSongCommand,
  runAddCollectionSongsSelectionCommand,
  runAddCollectionSongsToggleSelectionCommand,
} from "../../../apps/new/src/features/library/services/add-collection-songs-command-flow-service";
import {
  createAddCollectionSongsCommands,
} from "../../../apps/new/src/features/library/services/add-collection-songs-controller-command-service";
import { runAddCollectionSongsMutationAttempt } from "../../../apps/new/src/features/library/services/add-collection-songs-mutation-runtime-service";
import {
  canEditLibraryCollection,
  canDeleteLibraryCollection,
  canMutateLibraryCollectionMembership,
  getCollectionDetailActionState,
  getPlayableCollectionSongs,
} from "../../../apps/new/src/features/library/services/library-collection-detail-action-state-service";
import {
  getCollectionDetailMutationActionState,
  getCollectionDetailMutationControllerState,
} from "../../../apps/new/src/features/library/services/library-collection-detail-mutation-controller-state-service";
import {
  getCollectionDetailScreenViewState,
} from "../../../apps/new/src/features/library/services/library-collection-detail-screen-view-state-service";
import {
  getCollectionDetailStatusState,
} from "../../../apps/new/src/features/library/services/library-collection-detail-status-state-service";
import {
  getCollectionDetailViewState,
  getLibraryCollectionSongEmptyState,
} from "../../../apps/new/src/features/library/services/library-collection-detail-view-state-service";
import {
  getDeleteCollectionConfirmationCopy,
} from "../../../apps/new/src/features/library/services/library-collection-delete-confirmation-service";
import {
  getCollectionAddSongsHref,
  getCollectionEditHref,
  getCollectionListHref,
  getLibraryCollectionBackHref,
  getLibraryInvalidCollectionState,
} from "../../../apps/new/src/features/library/services/library-collection-navigation-service";
import {
  getCollectionDeleteFinishCommand,
  getCollectionDeleteStartCommand,
  getCollectionDeleteSuccessCommand,
  getCollectionDetailMutationBlockedCommand,
  getCollectionDetailMutationFailureCommand,
  getCollectionExportFinishCommand,
  getCollectionExportStartCommand,
  getCollectionExportSuccessCommand,
  getCollectionSongMoveFinishCommand,
  getCollectionSongMoveStartCommand,
  getCollectionSongMoveSuccessCommand,
  getCollectionSongRemovalFinishCommand,
  getCollectionSongRemovalStartCommand,
  getCollectionSongRemovalSuccessCommand,
} from "../../../apps/new/src/features/library/services/library-collection-mutation-service";
import { runCollectionDetailMutationAttempt } from "../../../apps/new/src/features/library/services/library-collection-detail-mutation-runtime-service";
import {
  runLibraryCollectionDeleteCommand,
  runLibraryCollectionExportCommand,
} from "../../../apps/new/src/features/library/services/library-collection-detail-collection-command-flow-service";
import {
  runLibraryCollectionSongMoveCommand,
  runLibraryCollectionSongRemoveCommand,
} from "../../../apps/new/src/features/library/services/library-collection-detail-song-command-flow-service";
import {
  collectionDetailMutationReducer,
  initialCollectionDetailMutationState,
  type CollectionDetailMutationAction,
} from "../../../apps/new/src/features/library/services/library-collection-mutation-state-service";
import { getCollectionDetailMutationErrorMessage } from "../../../apps/new/src/features/library/services/library-collection-mutation-error-copy-service";
import {
  type LibraryCollectionCommandDependencies,
  addLibraryCollectionSongCommandWithDependencies,
  addLibraryCollectionSongsCommandWithDependencies,
  deleteLibraryCollectionCommandWithDependencies,
  exportLibraryCollectionCommandWithDependencies,
  moveLibraryCollectionSongCommandWithDependencies,
  removeLibraryCollectionSongCommandWithDependencies,
} from "../../../apps/new/src/features/library/services/library-collection-command-executor-service";
import {
  assertCanDeletePlaylist,
  deleteCollectionWithDependencies,
  type CollectionDeleteDependencies,
} from "../../../apps/new/src/features/library/repository/collection-delete-executor-repository";
import {
  addOrderedSongRelationshipWithDependencies,
  addSongToPlaylistWithDependencies,
  assertCanMutatePlaylistMembership,
  getNextSongRelationshipOrder,
  setLikedSongMembershipWithDependencies,
  type LikedSongMembershipDependencies,
} from "../../../apps/new/src/features/library/repository/collection-song-membership-executor-repository";
import {
  getLikedSongRelationshipDelete,
  getOrderedSongRelationshipInsert,
} from "../../../apps/new/src/features/library/repository/collection-song-membership-step-repository";
import {
  addSongsToCollectionWithDependencies,
  addSongToCollectionWithDependencies,
  type CollectionSongAddDependencies,
} from "../../../apps/new/src/features/library/repository/collection-song-add-executor-repository";
import {
  getCollectionSongAddOperation,
  getCollectionSongAddOperations,
} from "../../../apps/new/src/features/library/repository/collection-song-add-step-repository";
import {
  removeSongFromCollectionWithDependencies,
  updateCollectionSongOrderWithDependencies,
  type CollectionSongRelationshipDependencies,
} from "../../../apps/new/src/features/library/repository/collection-song-relationship-executor-repository";
import {
  getCollectionSongOrderOperations,
  getCollectionSongRemoveOperation,
} from "../../../apps/new/src/features/library/repository/collection-song-relationship-step-repository";
import {
  getCollectionSongListState,
  getCollectionSongRowActionState,
  getCollectionSongRowsViewState,
  getCollectionSongRowViewState,
} from "../../../apps/new/src/features/library/services/library-collection-song-mutation-service";
import {
  getCollectionSongOrderUpdate,
  reorderCollectionSongs,
} from "../../../apps/new/src/features/library/services/library-collection-song-order-service";
import {
  getCollectionPlaybackCommandPlan,
  getCollectionPlaybackPlan,
  getCollectionQueueCommandPlan,
  getCollectionQueuePlan,
} from "../../../apps/new/src/features/library/services/library-collection-playback-service";
import {
  runLibraryCollectionPlayAction,
  runLibraryCollectionQueueAction,
} from "../../../apps/new/src/features/library/services/library-collection-playback-action-flow-service";
import {
  albumRowsToPreview,
  artistRowsToPreview,
  playlistRowsToPreview,
} from "../../../apps/new/src/features/library/services/library-collection-preview-row-service";
import {
  getLibraryCollectionPreviewEmptyState,
  getLibraryCollectionPreviewHref,
  getLibraryCollectionPreviewRows,
  getLibraryCollectionPreviewSectionState,
} from "../../../apps/new/src/features/library/services/library-collection-preview-service";
import {
  buildLibraryCollectionPreviewQueryResult,
  getLibraryCollectionPreviewErrors,
  getLibraryCollectionPreviewUpdatedAt,
  isLibraryCollectionPreviewGroupEmpty,
} from "../../../apps/new/src/features/library/services/library-collection-preview-query-result-service";
import {
  getCollectionFormErrorMessage,
  getCollectionFormFallbackMessage,
} from "../../../apps/new/src/features/library/services/collection-form-service";
import { parseAlbumYearInput } from "../../../apps/new/src/features/library/services/collection-form-domain-service";
import {
  collectionFormReducer,
  getInitialCollectionFormState,
} from "../../../apps/new/src/features/library/services/collection-form-state-service";
import {
  getCollectionFormChangeFieldAction,
  getCollectionFormFinishSaveAction,
  getCollectionFormHydrateAction,
} from "../../../apps/new/src/features/library/services/collection-form-action-service";
import {
  getCollectionFormBeginSaveCommand,
  getCollectionFormBlockedSaveCommand,
  getCollectionFormFailureCommand,
  getCollectionFormImagePickedCommand,
  getCollectionFormImagePickFailureCommand,
  getCollectionFormImagePickStartCommand,
  getCollectionFormSuccessCommand,
} from "../../../apps/new/src/features/library/services/collection-form-command-state-service";
import { runCollectionFormImagePickCommand } from "../../../apps/new/src/features/library/services/collection-form-image-command-flow-service";
import {
  runCreateCollectionFormSaveCommand,
  runEditCollectionFormSaveCommand,
} from "../../../apps/new/src/features/library/services/collection-form-mutation-command-flow-service";
import { runCollectionFormSaveAttempt } from "../../../apps/new/src/features/library/services/collection-form-mutation-runtime-service";
import {
  getCollectionFormActionState,
} from "../../../apps/new/src/features/library/services/collection-form-action-state-service";
import {
  getCreateCollectionFormControllerViewState,
  getEditCollectionFormControllerViewState,
} from "../../../apps/new/src/features/library/services/collection-form-controller-view-state-service";
import {
  getCollectionFormFieldState,
  getCollectionFormImageLabel,
  getSavedCollectionFormImageLabel,
} from "../../../apps/new/src/features/library/services/collection-form-field-state-service";
import {
  getCollectionFormControllerResultState,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
} from "../../../apps/new/src/features/library/services/collection-form-result-state-service";
import {
  getCreateCollectionFormCopy,
  getCreateCollectionFormSubtitle,
  getEditCollectionFormCopy,
  getEditCollectionFormSubtitle,
} from "../../../apps/new/src/features/library/services/collection-form-copy-service";
import {
  getCollectionDetailHref,
  getCollectionFormBackHref,
  getCollectionFormBackLink,
} from "../../../apps/new/src/features/library/services/collection-form-navigation-service";
import {
  createCollectionFromForm,
  updateCollectionFromForm,
  type CollectionFormCreateRepository,
  type CollectionFormUpdateRepository,
} from "../../../apps/new/src/features/library/services/collection-form-mutation-service";
import {
  createCollectionFormCommandFactory,
  updateCollectionFormCommandFactory,
} from "../../../apps/new/src/features/library/services/collection-form-command-factory-service";
import {
  assertUniqueCollectionNameWithDependencies,
  type CollectionUniquenessDependencies,
} from "../../../apps/new/src/features/library/repository/collection-uniqueness-executor-repository";
import {
  createAlbumWithDependencies,
  createArtistWithDependencies,
  createPlaylistWithDependencies,
  type CollectionCreateDependencies,
} from "../../../apps/new/src/features/library/repository/collection-create-executor-repository";
import {
  assertCreatedCollectionId,
  getOptionalCollectionProfileImageCreate,
  getRequiredCollectionCoverCreate,
  getUniqueCollectionCreateName,
} from "../../../apps/new/src/features/library/repository/collection-create-step-repository";
import {
  updateAlbumWithDependencies,
  updateArtistWithDependencies,
  updatePlaylistWithDependencies,
  type AlbumUpdateDependencies,
  type ArtistUpdateDependencies,
  type PlaylistUpdateDependencies,
} from "../../../apps/new/src/features/library/repository/collection-update-executor-repository";
import {
  assertCanUpdatePlaylist,
  getOptionalCollectionCoverUpdate,
  getOptionalCollectionProfileImageUpdate,
  getUniqueCollectionUpdateName,
} from "../../../apps/new/src/features/library/repository/collection-update-step-repository";
import {
  normalizeAlbumArtistName,
  replaceAlbumArtistsWithDependencies,
  splitAlbumArtistNames,
  type AlbumArtistUpdateDependencies,
} from "../../../apps/new/src/features/library/repository/album-artist-update-executor-repository";
import {
  normalizeSongMetadataRelationshipName,
  replaceLibrarySongMetadataRelationshipsWithDependencies,
  splitSongMetadataRelationshipNames,
  type SongMetadataRelationshipDependencies,
} from "../../../apps/new/src/features/library/repository/song-metadata-relationship-executor-repository";
import {
  ensureSongMetadataAlbum,
  ensureSongMetadataAlbumArtistLinks,
  ensureSongMetadataArtist,
} from "../../../apps/new/src/features/library/repository/song-metadata-relationship-step-repository";
import {
  assertLibrarySongTitle,
  normalizeLibrarySongTitle,
  updateLibrarySongMetadataWithDependencies,
  type SongMetadataUpdateDependencies,
} from "../../../apps/new/src/features/library/repository/song-metadata-update-executor-repository";
import {
  getLibrarySongCoverUpdateTarget,
} from "../../../apps/new/src/features/library/repository/song-metadata-update-step-repository";
import {
  assertSupportedCollectionImageType,
  getCollectionImageMimeType,
  pickCollectionImageWithDependencies,
  supportedCollectionImageTypes,
  type CollectionImagePickerDependencies,
  type CollectionImagePickerResult,
} from "../../../apps/new/src/features/library/services/collection-image-picker-executor-service";
import {
  assertCollectionName,
  getCollectionDuplicateNameMessage,
  getCollectionRequiredNameMessage,
  normalizeCollectionName,
} from "../../../apps/new/src/features/library/services/collection-metadata-service";
import {
  rowsToLinkedSongIds,
  rowsToAddableCollectionSongs,
} from "../../../apps/new/src/features/library/services/addable-collection-songs-service";
import {
  buildAddableCollectionSongsResult,
  getAddableCollectionSongsUpdatedAt,
} from "../../../apps/new/src/features/library/services/addable-collection-songs-result-service";
import {
  getAddCollectionSongsBackHref,
  getAddCollectionSongsBackLink,
  getAddCollectionSongsFormViewState,
  getAddCollectionSongsFormState,
  getAddCollectionSongsHeaderState,
} from "../../../apps/new/src/features/library/services/addable-collection-songs-screen-state-service";
import {
  getAddCollectionSongsStatusState,
  getAddCollectionSongsUpdatedLabel,
} from "../../../apps/new/src/features/library/services/add-collection-songs-status-state-service";
import {
  buildEditAlbumCollectionQueryResult,
  buildEditAlbumRowQueryResult,
  buildEditArtistCollectionQueryResult,
  buildEditCollectionRowQueryResult,
  buildEditPlaylistCollectionQueryResult,
  getEditAlbumRowQueryUpdatedAt,
} from "../../../apps/new/src/features/library/services/edit-collection-query-service";
import { buildEditCollectionState } from "../../../apps/new/src/features/library/services/edit-collection-state-service";
import {
  getLibraryCollectionCreateHref,
  getLibraryCollectionListBackHref,
  getLibraryCollectionListControllerViewState,
  getLibraryCollectionListCopy,
} from "../../../apps/new/src/features/library/services/library-collection-list-service";
import {
  filterCollectionPreviews,
  getLibraryCollectionListErrors,
  getLibraryCollectionListState,
  getLibraryCollectionListStatusLabel,
} from "../../../apps/new/src/features/library/services/library-collection-list-state-service";
import {
  getLibraryCollectionListSetQueryAction,
  initialLibraryCollectionListControlState,
  libraryCollectionListControlReducer,
} from "../../../apps/new/src/features/library/services/library-collection-list-control-state-service";
import {
  rowsToCollectionListPreviews,
} from "../../../apps/new/src/features/library/services/library-collection-list-query-service";
import {
  buildLibraryCollectionListQueryResult,
  getLibraryCollectionListQueryUpdatedAt,
} from "../../../apps/new/src/features/library/services/library-collection-list-query-result-service";
import {
  getLibraryHomeSetOrderAction,
  getLibraryHomeSetQueryAction,
  getLibraryHomeSetSortAction,
  initialLibraryHomeControlState,
  libraryHomeControlReducer,
} from "../../../apps/new/src/features/library/services/library-home-control-service";
import {
  getLibraryHomeHeaderActions,
  getLibraryHomeHeaderState,
  getLibraryHomeImportHref,
} from "../../../apps/new/src/features/library/services/library-home-header-service";
import {
  getLibraryHomeQueryErrors,
  getLibraryHomeStatusState,
} from "../../../apps/new/src/features/library/services/library-home-status-service";
import {
  getLibrarySmallImagePathWithResolver,
} from "../../../apps/new/src/features/library/services/library-image-path-state-service";
import {
  buildLibrarySummaryQueryResult,
  getLibrarySummaryQueryUpdatedAt,
} from "../../../apps/new/src/features/library/services/library-summary-query-result-service";
import {
  buildLibrarySongDetail,
} from "../../../apps/new/src/features/library/services/library-song-detail-service";
import {
  buildLibrarySongDetailQueryResult,
  getLibrarySongDetailQueryUpdatedAt,
} from "../../../apps/new/src/features/library/services/library-song-detail-query-result-service";
import {
  getLibrarySongDetailActionState,
} from "../../../apps/new/src/features/library/services/library-song-detail-action-state-service";
import {
  getLibrarySongDetailMutationActionState,
  getLibrarySongDetailMutationControllerState,
} from "../../../apps/new/src/features/library/services/library-song-detail-mutation-controller-state-service";
import {
  getLibrarySongDetailScreenViewState,
} from "../../../apps/new/src/features/library/services/library-song-detail-screen-view-state-service";
import {
  getLibrarySongDetailStatusState,
  getLibrarySongDetailUpdatedLabel,
} from "../../../apps/new/src/features/library/services/library-song-detail-status-state-service";
import {
  getLibrarySongDetailViewState,
} from "../../../apps/new/src/features/library/services/library-song-detail-view-state-service";
import { getLibrarySongDeleteConfirmationCopy } from "../../../apps/new/src/features/library/services/library-song-delete-confirmation-service";
import { getLibraryInvalidSongState } from "../../../apps/new/src/features/library/services/library-song-invalid-state-service";
import {
  getLibrarySongAddToPlaylistHref,
  getLibrarySongDeleteSuccessHref,
  getLibrarySongDetailBackHref,
  getLibrarySongDetailHref,
  getLibrarySongDetailPlayerHref,
  getLibrarySongEditHref,
  getLibrarySongRelationshipHref,
} from "../../../apps/new/src/features/library/services/library-song-navigation-service";
import {
  getSongAddToPlaylistControllerViewState,
} from "../../../apps/new/src/features/library/services/song-add-to-playlist-service";
import {
  getSelectableSongPlaylists,
  getSongAddToPlaylistRowState,
} from "../../../apps/new/src/features/library/services/song-add-to-playlist-row-state-service";
import {
  getSongAddToPlaylistBackLink,
  getSongAddToPlaylistHeaderState,
} from "../../../apps/new/src/features/library/services/song-add-to-playlist-header-state-service";
import { getSongAddToPlaylistStatusState } from "../../../apps/new/src/features/library/services/song-add-to-playlist-status-state-service";
import {
  getSongAddToPlaylistStatusLabel,
  initialSongAddToPlaylistMutationState,
} from "../../../apps/new/src/features/library/services/song-add-to-playlist-mutation-state-service";
import { runSongAddToPlaylistCommand } from "../../../apps/new/src/features/library/services/song-add-to-playlist-command-flow-service";
import {
  createSongAddToPlaylistControllerCommands,
  getSongAddToPlaylistController,
} from "../../../apps/new/src/features/library/services/song-add-to-playlist-controller-service";
import {
  getLibrarySongPlaybackBlockedCommand,
  getLibrarySongPlayCommand,
  getLibrarySongQueueCommand,
  toLibrarySongDetailPlaybackItem,
  toLibrarySongExportItem,
} from "../../../apps/new/src/features/library/services/library-song-playback-state-service";
import {
  runLibrarySongPlayAction,
  runLibrarySongQueueAction,
} from "../../../apps/new/src/features/library/services/library-song-playback-action-flow-service";
import {
  getLibrarySongDeleteSuccessCommand,
  getLibrarySongDetailMutationBlockedCommand,
  getLibrarySongDetailMutationErrorMessage,
  getLibrarySongDetailMutationFailureCommand,
  getLibrarySongDetailMutationFinishCommand,
  getLibrarySongDetailMutationStartCommand,
  getLibrarySongExportSuccessCommand,
  getLibrarySongLikedSuccessCommand,
} from "../../../apps/new/src/features/library/services/library-song-detail-mutation-command-state-service";
import {
  runLibrarySongDeleteCommand,
  runLibrarySongExportCommand,
  runLibrarySongLikedCommand,
} from "../../../apps/new/src/features/library/services/library-song-detail-mutation-command-flow-service";
import { runLibrarySongDetailMutationAttempt } from "../../../apps/new/src/features/library/services/library-song-detail-mutation-runtime-service";
import {
  initialLibrarySongDetailMutationState,
  type LibrarySongDetailMutationAction,
  librarySongDetailMutationReducer,
} from "../../../apps/new/src/features/library/services/library-song-detail-mutation-service";
import {
  getLibrarySongEditBeginSaveAction,
  getLibrarySongEditChangeFieldAction,
  getLibrarySongEditFinishSaveAction,
  getLibrarySongEditHydrateAction,
  getInitialLibrarySongEditControllerState,
  type LibrarySongEditControllerAction,
  librarySongEditControllerReducer,
} from "../../../apps/new/src/features/library/services/library-song-edit-controller-reducer-service";
import { buildLibrarySongEditFormState } from "../../../apps/new/src/features/library/services/library-song-edit-form-state-service";
import {
  getLibrarySongEditBlockedCommand,
  getLibrarySongEditCoverPickedCommand,
  getLibrarySongEditErrorMessage,
  getLibrarySongEditFailureCommand,
  getLibrarySongEditSaveSuccessCommand,
} from "../../../apps/new/src/features/library/services/library-song-form-command-state-service";
import {
  runLibrarySongEditCoverPickCommand,
  runLibrarySongEditSaveCommand,
} from "../../../apps/new/src/features/library/services/library-song-form-command-flow-service";
import {
  getLibrarySongEditActionState,
} from "../../../apps/new/src/features/library/services/library-song-edit-action-state-service";
import {
  getLibrarySongEditControllerResultState,
} from "../../../apps/new/src/features/library/services/library-song-edit-controller-result-state-service";
import {
  getLibrarySongEditFieldState,
} from "../../../apps/new/src/features/library/services/library-song-edit-field-state-service";
import {
  getLibrarySongEditStatusState,
} from "../../../apps/new/src/features/library/services/library-song-edit-status-state-service";
import {
  getLibrarySongEditScreenViewState,
} from "../../../apps/new/src/features/library/services/library-song-edit-screen-state-service";
import {
  type LibrarySongCommandDependencies,
  deleteLibrarySongCommandWithDependencies,
  exportLibrarySongCommandWithDependencies,
  toggleLibrarySongLikedCommandWithDependencies,
  updateLibrarySongMetadataCommandWithDependencies,
} from "../../../apps/new/src/features/library/services/library-song-command-executor-service";
import {
  deleteLibrarySongRowsWithDependencies,
  type LibrarySongDeleteRowDependencies,
} from "../../../apps/new/src/features/library/repository/library-song-delete-executor-repository";
import {
  deleteLibrarySongWithDependencies,
  type LibrarySongDeleteDependencies,
} from "../../../apps/new/src/features/library/services/library-song-delete-executor-service";
import {
  deleteLibrarySongFilesWithDependencies as deleteLibrarySongFilesForLibraryWithDependencies,
  getLibrarySongDirectoryPath,
  type LibrarySongFileDependencies,
} from "../../../apps/new/src/features/library/services/library-song-file-executor-service";
import {
  getLibrarySongExportSnapshotInput,
  getLibrarySongSnapshotHashWithDependencies,
  isLibrarySongSnapshotStaleWithDependencies,
  markLibrarySongAsExportedWithDependencies,
  type LibrarySongExportSnapshotSongRow,
  type LibrarySongExportSnapshotDependencies,
} from "../../../apps/new/src/features/library/repository/library-song-export-snapshot-executor-repository";
import {
  rowsToSongPreviews,
} from "../../../apps/new/src/features/library/services/library-song-preview-service";
import {
  buildLibrarySongPreviewQueryResult,
  getLibrarySongPreviewQueryUpdatedAt,
} from "../../../apps/new/src/features/library/services/library-song-preview-query-result-service";
import {
  getLibrarySongListControlsState,
} from "../../../apps/new/src/features/library/services/library-song-list-controls-state-service";
import {
  getLibrarySongPreviewPlayCommand,
  getLibrarySongPreviewQueueCommand,
} from "../../../apps/new/src/features/library/services/library-song-preview-command-state-service";
import {
  getLibrarySongPreviewEmptyState,
} from "../../../apps/new/src/features/library/services/library-song-preview-empty-state-service";
import {
  getLibrarySongPreviewListState,
} from "../../../apps/new/src/features/library/services/library-song-preview-list-state-service";
import {
  getLibrarySongPreviewDetailHref,
  getLibrarySongPreviewPlayerHref,
} from "../../../apps/new/src/features/library/services/library-song-preview-navigation-service";
import {
  toLibrarySongPlaybackItem,
} from "../../../apps/new/src/features/library/services/library-song-preview-playback-item-service";
import {
  getLibrarySongPreviewRowState,
} from "../../../apps/new/src/features/library/services/library-song-preview-row-state-service";
import {
  runLibrarySongPreviewPlayAction,
  runLibrarySongPreviewQueueAction,
} from "../../../apps/new/src/features/library/services/library-song-preview-action-flow-service";
import {
  runLibrarySongListOrderToggleAction,
  runLibrarySongListSortSelectAction,
} from "../../../apps/new/src/features/library/services/library-song-list-controls-action-flow-service";
import {
  backupActionCards,
  getBackupActionState,
  getBackupOperationLabel,
} from "../../../apps/new/src/features/backup/services/backup-action-state-service";
import { getBackupConfirmationState } from "../../../apps/new/src/features/backup/services/backup-confirmation-state-service";
import {
  getBackupOperationConfirmCommand,
  getBackupOperationStartCommand,
  getBackupResetStatusCommand,
} from "../../../apps/new/src/features/backup/services/backup-interaction-command-service";
import { getBackupScreenState } from "../../../apps/new/src/features/backup/services/backup-screen-state-service";
import { getBackupStatusState } from "../../../apps/new/src/features/backup/services/backup-status-state-service";
import { getBackupViewState } from "../../../apps/new/src/features/backup/services/backup-view-state-service";
import {
  runBackupOperationAction,
  runBackupResetStatusAction,
} from "../../../apps/new/src/features/backup/services/backup-screen-action-flow-service";
import {
  getBackupPhaseTransitionEffects,
  runBackupPhaseTransitionEffects,
} from "../../../apps/new/src/features/backup/services/backup-phase-effect-service";
import {
  backupSessionReducer,
  getBackupSessionErrorMessage,
  getBackupSessionFailAction,
  getBackupSessionResetAction,
  getBackupSessionStartAction,
  getBackupSessionSucceedAction,
  initialBackupSessionState,
  type BackupSessionAction,
} from "../../../apps/new/src/features/backup/services/backup-session-state-service";
import {
  runBackupSessionOperationCommand,
  runBackupSessionResetCommand,
} from "../../../apps/new/src/features/backup/services/backup-session-command-flow-service";
import {
  getBackupCommandResult,
  getCancelledBackupRestoreResult,
  getPickedBackupArchiveUri,
} from "../../../apps/new/src/features/backup/services/backup-command-result-service";
import {
  type BackupCommandExecutorDependencies,
  runBackupCommandWithDependencies,
} from "../../../apps/new/src/features/backup/services/backup-command-executor-service";
import {
  assertBackupRestoreStagedItems,
  getBackupDocumentDirectoryDeletePaths,
  getBackupRestoreStagedItemMoves,
} from "../../../apps/new/src/features/backup/services/backup-file-system-plan-service";
import {
  assertBackupRestoreStagingDirectoryHasFilesWithDependencies,
  cleanupBackupRestoreStagingDirectoryWithDependencies,
  clearBackupDocumentDirectoryWithDependencies,
  getBackupArchivePathWithDependencies,
  getBackupDocumentDirectoryWithDependencies,
  getBackupRestoreStagingDirectoryWithDependencies,
  prepareBackupRestoreStagingDirectoryWithDependencies,
  replaceBackupDocumentDirectoryWithStagedItemsWithDependencies,
  type BackupFileSystemDependencies,
} from "../../../apps/new/src/features/backup/services/backup-file-system-executor-service";
import type { BackupSessionState } from "../../../apps/new/src/features/backup/types/backup-session";
import {
  getPremiumActionState,
  getSelectedPremiumTier,
} from "../../../apps/new/src/features/premium/services/premium-action-state-service";
import { premiumFeatureCopy } from "../../../apps/new/src/features/premium/services/premium-feature-copy-service";
import { getPremiumMutationErrorMessage } from "../../../apps/new/src/features/premium/services/premium-mutation-error-service";
import {
  getPremiumScreenState,
  getPremiumViewState,
} from "../../../apps/new/src/features/premium/services/premium-screen-service";
import { getPremiumStatusState } from "../../../apps/new/src/features/premium/services/premium-status-state-service";
import {
  getInitialPremiumPurchaseState,
  getPremiumPurchaseFailAction,
  getPremiumPurchaseResetAction,
  getPremiumPurchaseSelectAction,
  getPremiumPurchaseStartAction,
  getPremiumPurchaseSucceedAction,
  getPremiumPurchaseSyncEntitlementAction,
  type PremiumPurchaseAction,
  premiumPurchaseReducer,
} from "../../../apps/new/src/features/premium/services/premium-purchase-state-service";
import {
  getInitialPremiumTierLoadState,
  getPremiumTierLoadResolveAction,
  type PremiumTierLoadAction,
  premiumTierLoadReducer,
} from "../../../apps/new/src/features/premium/services/premium-tier-load-state-service";
import {
  runPremiumPurchaseCommand,
  runPremiumPurchaseResetCommand,
  runPremiumRestoreCommand,
  runPremiumTierSelectionCommand,
} from "../../../apps/new/src/features/premium/services/premium-purchase-command-flow-service";
import {
  runPremiumEntitlementApplyCommand,
  runPremiumEntitlementRefreshCommand,
} from "../../../apps/new/src/features/premium/services/premium-entitlement-command-flow-service";
import {
  getPremiumEntitlementCheckingAction,
  getPremiumEntitlementFailAction,
  getPremiumEntitlementSucceedAction,
  initialPremiumEntitlementState,
  type PremiumEntitlementAction,
  premiumEntitlementReducer,
} from "../../../apps/new/src/features/premium/services/premium-entitlement-state-service";
import { runPremiumTierLoadCommand } from "../../../apps/new/src/features/premium/services/premium-tier-load-command-flow-service";
import {
  getTierIdFromProduct,
  hydratePremiumTierPrices,
  premiumOfferingNames,
  premiumTiers,
} from "../../../apps/new/src/features/premium/services/premium-catalog-service";
import {
  checkPremiumEntitlementWithDependencies,
  loadPremiumTiersWithDependencies,
  purchasePremiumTierWithDependencies,
  restorePremiumPurchaseWithDependencies,
  type PremiumPurchaseExecutorDependencies,
  type PremiumPurchasePackage,
} from "../../../apps/new/src/features/premium/services/premium-purchase-executor-service";
import {
  getPremiumEntitlementStatusResult,
  getPremiumPurchaseActivationResult,
  getPremiumRestoreResult,
  type PremiumCustomerInfo,
} from "../../../apps/new/src/features/premium/services/premium-entitlement-result-service";
import type {
  PremiumEntitlementStatus,
  PremiumPurchaseState,
  PremiumTier,
} from "../../../apps/new/src/features/premium/types/premium-purchase";
import {
  getCustomizationColorControlsState,
  getCustomizationScreenControllerViewState,
  getCustomizationOptionState,
  getCustomizationScreenState,
} from "../../../apps/new/src/features/settings/services/customization-screen-state-service";
import {
  getSettingsDeveloperPremiumToggleState,
  getSettingsHomeControllerViewState,
  isSettingsDeveloperPremiumToggleVisible,
} from "../../../apps/new/src/features/settings/services/settings-screen-service";
import {
  getPrivacyScreenControllerViewState,
  getPrivacyScreenViewState,
  getPrivacyScreenState,
} from "../../../apps/new/src/features/settings/services/settings-privacy-screen-service";
import {
  getSupportScreenControllerViewState,
  getSupportScreenViewState,
} from "../../../apps/new/src/features/settings/services/settings-support-screen-service";
import {
  getCustomizationSettingsErrorMessage,
  getPrivacySettingsErrorMessage,
} from "../../../apps/new/src/features/settings/services/settings-error-service";
import {
  getCustomizationHapticsToggleCommand,
  getSettingsHapticCommand,
  shouldSendHapticForHapticsToggle,
} from "../../../apps/new/src/features/settings/services/settings-haptic-command-service";
import {
  runCustomizationHapticsToggleAction,
  runSettingsInteractionAction,
} from "../../../apps/new/src/features/settings/services/settings-interaction-action-flow-service";
import {
  getSettingsBackLink,
  getSettingsHomeHref,
  getSettingsPremiumHref,
  getSupportActionKey,
  settingsRoutes,
  supportActions,
} from "../../../apps/new/src/features/settings/services/settings-navigation-service";
import {
  runSettingsSupportActionWithDependencies,
  type SettingsSupportActionDependencies,
} from "../../../apps/new/src/features/settings/services/settings-support-action-executor-service";
import {
  createInitialSettingsPersistenceState,
  getSettingsPersistenceLoadAction,
  getSettingsPersistenceLoadFailureAction,
  getSettingsPersistenceLoadSuccessAction,
  getSettingsPersistenceSaveAction,
  getSettingsPersistenceSaveFailureAction,
  getSettingsPersistenceSaveSuccessAction,
  type SettingsPersistenceAction,
  settingsPersistenceReducer,
} from "../../../apps/new/src/features/settings/services/settings-persistence-state-service";
import {
  runSettingsLoadCommand,
  runSettingsSaveCommand,
} from "../../../apps/new/src/features/settings/services/settings-persistence-command-flow-service";
import {
  customizationOptions,
  defaultCustomizationSettings,
  getCustomizationOption,
  normalizeCustomizationSettings,
} from "../../../apps/new/src/features/settings/services/customization-settings-domain-service";
import {
  defaultPrivacySettings,
  normalizePrivacySettings,
} from "../../../apps/new/src/features/settings/services/privacy-settings-domain-service";
import {
  loadSettingsFromJsonFileWithDependencies,
  saveSettingsToJsonFileWithDependencies,
  type SettingsJsonFileStoreDependencies,
} from "../../../apps/new/src/features/settings/services/settings-json-file-store-service";
import {
  checkStoredImageExistsWithDependencies,
  getImagePathFromHashWithDependencies,
  saveCoverImageWithDependencies,
  writeImageToFileSystemWithDependencies,
  type ImageStorageDependencies,
} from "../../../apps/new/src/features/images/services/image-storage-executor-service";
import {
  getImagePathFromDirectory,
  getImageStorageVariants,
  splitImageData,
} from "../../../apps/new/src/features/images/services/image-storage-step-service";
import {
  getExportFileNameFromPath,
  sanitizeExportFileName,
} from "../../../apps/new/src/features/export/services/export-file-name-service";
import {
  getShareExportFileName,
  shareExportFilesWithDependencies,
  type ShareExportFilesDependencies,
} from "../../../apps/new/src/features/export/services/share-export-files-executor-service";
import {
  getImportDraftExportFiles,
  shareImportDraftSongsWithDependencies,
  type ImportDraftExportDependencies,
} from "../../../apps/new/src/features/export/services/import-draft-export-executor-service";
import {
  getPlayableLibraryExportSongs,
  shareLibrarySongsWithDependencies,
  type LibraryExportShareDependencies,
} from "../../../apps/new/src/features/export/services/library-export-share-executor-service";
import {
  buildLibraryExportAudioTags,
  buildLibrarySongExportMetadata,
  formatLibraryExportNames,
  loadArtworkTagWithDependencies,
  prepareLibrarySongForExportWithDependencies,
  type LibraryExportMetadataDependencies,
} from "../../../apps/new/src/features/export/services/library-export-metadata-executor-service";
import type {
  LibraryExportSongMetadataRow,
} from "../../../apps/new/src/features/export/repository/library-export-metadata-repository";

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

async function assertPlaybackSessionSmoke() {
  const first = song({ id: 1, title: "First" });
  const second = song({ id: 2, title: "Second" });
  const third = song({ id: 3, title: "Third" });

  assert.equal(isRecord({ id: 1 }), true);
  assert.equal(isRecord(["nope"]), false);
  assert.equal(numberOrNull(42), 42);
  assert.equal(numberOrNull(Number.NaN), null);
  assert.equal(finiteNumber("bad", 7), 7);
  assert.deepEqual(
    normalizeQueueItem({
      duration: null,
      id: 20,
      title: "Persisted Smoke",
    }),
    {
      album: "Unknown",
      artist: "Unknown",
      duration: null,
      id: 20,
      pathToFile: null,
      title: "Persisted Smoke",
    },
  );
  assert.equal(normalizeQueueItem({ title: "Missing id" }), null);

  assert.deepEqual(
    hydratePlaybackSession({
      ...initialPlaybackState,
      error: "Needs reset",
    }),
    {
      ...initialPlaybackState,
      error: null,
      initialized: true,
    },
  );
  assert.deepEqual(
    failPlaybackSession({
      error: "Native failure",
      state: {
        ...initialPlaybackState,
        isPlaying: true,
      },
    }),
    {
      ...initialPlaybackState,
      error: "Native failure",
      isPlaying: false,
    },
  );
  assert.equal(togglePlaybackLoopMode(initialPlaybackState).mode.loop, true);
  assert.equal(togglePlaybackShuffleMode(initialPlaybackState).mode.shuffle, true);
  const playbackPersistenceEvents: unknown[] = [];
  const dispatchPlaybackPersistenceCommand = (action: PlaybackAction) => {
    playbackPersistenceEvents.push(["dispatch", action]);
  };
  const noopPlaybackCommand = () => undefined;
  const playbackCommands: PlaybackCommands = {
    addToQueue: noopPlaybackCommand,
    clearQueue: noopPlaybackCommand,
    handleRemoteCommand: () => "handled",
    moveQueueSong: noopPlaybackCommand,
    pause: noopPlaybackCommand,
    playSong: noopPlaybackCommand,
    removeFromQueue: noopPlaybackCommand,
    resetPlaybackSession: noopPlaybackCommand,
    resume: noopPlaybackCommand,
    seekTo: noopPlaybackCommand,
    skipNext: noopPlaybackCommand,
    skipPrevious: noopPlaybackCommand,
    toggleLoop: noopPlaybackCommand,
    toggleShuffle: noopPlaybackCommand,
  };
  assert.deepEqual(
    getPlaybackSessionValue({
      activeTrack: first,
      commands: playbackCommands,
      state: {
        ...initialPlaybackState,
        activeQueueIndex: 0,
        activeTrackId: first.id,
        queue: [first],
      },
    }),
    {
      activeTrack: first,
      ...playbackCommands,
      state: {
        ...initialPlaybackState,
        activeQueueIndex: 0,
        activeTrackId: first.id,
        queue: [first],
      },
    },
  );
  assert.deepEqual(getHydratePlaybackAction(initialPlaybackState), {
    state: initialPlaybackState,
    type: "hydrate",
  });
  assert.equal(
    await runPlaybackHydrateCommand({
      dispatch: dispatchPlaybackPersistenceCommand,
      isCurrent: () => true,
      loadPersistedPlaybackState: async () => ({
        ...initialPlaybackState,
        activeTrackId: first.id,
        isPlaying: true,
        queue: [first],
      }),
      onRestorePlayingState: (restoredState) => {
        playbackPersistenceEvents.push([
          "restore-playing",
          restoredState.activeTrackId,
        ]);
      },
    }),
    true,
  );
  assert.equal(
    await runPlaybackHydrateCommand({
      dispatch: dispatchPlaybackPersistenceCommand,
      isCurrent: () => false,
      loadPersistedPlaybackState: async () => ({
        ...initialPlaybackState,
        activeTrackId: second.id,
        isPlaying: true,
        queue: [second],
      }),
      onRestorePlayingState: (restoredState) => {
        playbackPersistenceEvents.push([
          "stale-restore-playing",
          restoredState.activeTrackId,
        ]);
      },
    }),
    false,
  );
  assert.equal(
    await runPlaybackPersistenceCommand({
      hasHydrated: false,
      lastPersistedAt: 100,
      now: 1000,
      savePersistedPlaybackState: async (persistedState) => {
        playbackPersistenceEvents.push([
          "unexpected-save-before-hydrate",
          persistedState.activeTrackId,
        ]);
      },
      state: initialPlaybackState,
    }),
    100,
  );
  assert.equal(
    await runPlaybackPersistenceCommand({
      hasHydrated: true,
      lastPersistedAt: 100,
      now: 1000,
      savePersistedPlaybackState: async (persistedState) => {
        playbackPersistenceEvents.push(["save", persistedState.isPlaying]);
      },
      state: {
        ...initialPlaybackState,
        isPlaying: true,
      },
    }),
    100,
  );
  assert.equal(
    await runPlaybackPersistenceCommand({
      hasHydrated: true,
      lastPersistedAt: 100,
      now: 6001,
      savePersistedPlaybackState: async (persistedState) => {
        playbackPersistenceEvents.push(["save", persistedState.isPlaying]);
      },
      state: {
        ...initialPlaybackState,
        isPlaying: true,
      },
    }),
    6001,
  );
  assert.equal(
    await runPlaybackPersistenceCommand({
      hasHydrated: true,
      lastPersistedAt: 6001,
      now: 6200,
      savePersistedPlaybackState: async (persistedState) => {
        playbackPersistenceEvents.push(["save", persistedState.isPlaying]);
      },
      state: {
        ...initialPlaybackState,
        isPlaying: false,
      },
    }),
    6200,
  );
  assert.deepEqual(playbackPersistenceEvents, [
    [
      "dispatch",
      {
        state: {
          ...initialPlaybackState,
          activeTrackId: first.id,
          isPlaying: true,
          queue: [first],
        },
        type: "hydrate",
      },
    ],
    ["restore-playing", first.id],
    ["save", true],
    ["save", false],
  ]);

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
  assert.deepEqual(getPlaybackQueuePlayCommand(), {
    haptic: "light",
  });
  assert.deepEqual(getPlaybackQueueMoveCommand(), {
    haptic: "light",
  });
  assert.deepEqual(getPlaybackQueueRemoveCommand(), {
    haptic: "medium",
  });
  assert.deepEqual(getPlaybackQueueClearCommand(), {
    haptic: "medium",
  });
  const queueCommandEvents: unknown[] = [];
  const sendQueueCommandHaptic = (haptic: string) => {
    queueCommandEvents.push(["haptic", haptic]);
  };
  runPlaybackQueuePlayCommand({
    playSong: (song) => {
      queueCommandEvents.push(["play", song.id]);
    },
    sendHaptic: sendQueueCommandHaptic,
    song: first,
  });
  runPlaybackQueueMoveCommand({
    direction: "down",
    moveQueueSong: (songId, direction) => {
      queueCommandEvents.push(["move", songId, direction]);
    },
    sendHaptic: sendQueueCommandHaptic,
    songId: second.id,
  });
  runPlaybackQueueRemoveCommand({
    removeFromQueue: (songId) => {
      queueCommandEvents.push(["remove", songId]);
    },
    sendHaptic: sendQueueCommandHaptic,
    songId: third.id,
  });
  runPlaybackQueueClearCommand({
    clearQueue: () => {
      queueCommandEvents.push(["clear"]);
    },
    sendHaptic: sendQueueCommandHaptic,
  });
  assert.deepEqual(queueCommandEvents, [
    ["haptic", "light"],
    ["play", first.id],
    ["haptic", "light"],
    ["move", second.id, "down"],
    ["haptic", "medium"],
    ["remove", third.id],
    ["haptic", "medium"],
    ["clear"],
  ]);
  const queueActionEvents: unknown[] = [];
  const queueActions = createPlaybackQueueActions({
    clearQueue: () => {
      queueActionEvents.push(["clear"]);
    },
    moveQueueSong: (songId, direction) => {
      queueActionEvents.push(["move", songId, direction]);
    },
    playSong: (song) => {
      queueActionEvents.push(["play", song.id]);
    },
    removeFromQueue: (songId) => {
      queueActionEvents.push(["remove", songId]);
    },
    sendHaptic: (haptic) => {
      queueActionEvents.push(["haptic", haptic]);
    },
  });
  queueActions.playQueuedSong(first);
  queueActions.moveQueuedSong(second.id, "up");
  queueActions.removeQueuedSong(third.id);
  queueActions.clearQueuedSongs();
  assert.deepEqual(queueActionEvents, [
    ["haptic", "light"],
    ["play", first.id],
    ["haptic", "light"],
    ["move", second.id, "up"],
    ["haptic", "medium"],
    ["remove", third.id],
    ["haptic", "medium"],
    ["clear"],
  ]);

  assert.deepEqual(getAddPlaybackQueueSongAction(second), {
    song: second,
    type: "add-to-queue",
  });
  assert.deepEqual(
    getMovePlaybackQueueSongAction({
      direction: "up",
      songId: third.id,
    }),
    {
      direction: "up",
      songId: third.id,
      type: "move-queue-song",
    },
  );
  assert.deepEqual(getTogglePlaybackLoopAction(), { type: "toggle-loop" });
  assert.deepEqual(getTogglePlaybackShuffleAction(), {
    type: "toggle-shuffle",
  });

  state = playbackReducer(state, getAddPlaybackQueueSongAction(second));
  state = playbackReducer(state, getAddPlaybackQueueSongAction(third));
  assert.deepEqual(
    state.queue.map((item) => item.id),
    [1, 2, 3],
  );
  assert.equal(state.queueRevision, 3);

  const directQueuedState = addPlaybackQueueSong({
    song: third,
    state: addPlaybackQueueSong({
      song: second,
      state: playbackReducer(initialPlaybackState, {
        song: first,
        type: "play-song",
      }),
    }),
  });
  assert.deepEqual(
    directQueuedState.queue.map((item) => item.id),
    [1, 2, 3],
  );
  assert.equal(
    movePlaybackQueueSong({
      direction: "up",
      songId: third.id,
      state: directQueuedState,
    }).queue[1]?.id,
    third.id,
  );
  assert.deepEqual(
    getPlaybackQueueMoveUpdate({
      direction: "up",
      songId: third.id,
      state: directQueuedState,
    }).queue.map((item) => item.id),
    [1, 3, 2],
  );
  assert.equal(
    getPlaybackQueueMoveUpdate({
      direction: "up",
      songId: third.id,
      state: directQueuedState,
    }).activeQueueIndex,
    0,
  );
  const removalUpdate = getPlaybackQueueRemovalUpdate({
    songId: first.id,
    state: directQueuedState,
  });
  assert.deepEqual(
    removalUpdate.queue.map((item) => item.id),
    [2, 3],
  );
  assert.equal(removalUpdate.activeTrackId, second.id);
  assert.equal(removalUpdate.activeQueueIndex, 0);
  const directActivatedState = setPlaybackActiveQueueIndex({
    index: 1,
    state: directQueuedState,
  });
  assert.equal(directActivatedState.activeTrackId, second.id);
  assert.equal(directActivatedState.activeQueueIndex, 1);
  assert.equal(directActivatedState.position, 0);
  assert.equal(directActivatedState.isPlaying, true);
  const directMissingActivationState = setPlaybackActiveQueueIndex({
    index: null,
    state: directQueuedState,
  });
  assert.equal(directMissingActivationState.activeTrackId, first.id);
  assert.equal(directMissingActivationState.position, directQueuedState.duration);
  assert.equal(directMissingActivationState.isPlaying, false);
  const directRemovedState = removePlaybackQueueSong({
    songId: first.id,
    state: directQueuedState,
  });
  assert.equal(directRemovedState.activeTrackId, second.id);
  assert.equal(clearPlaybackQueue(directQueuedState).queue.length, 0);

  const persistedState = toPersistedPlaybackState({
    ...directQueuedState,
    error: "Native failure should not persist",
  });
  assert.equal("error" in persistedState, false);
  assert.deepEqual(
    persistedState.queue.map((item) => item.id),
    [1, 2, 3],
  );

  assert.deepEqual(
    normalizeAdGate({
      accumulatedMs: 999_999,
      lastTrackedPosition: -10,
      playbackDuration: 120_000,
      playbackPosition: 999_999,
      thresholdMs: 300_000,
    }),
    {
      accumulatedMs: 300_000,
      active: false,
      due: true,
      lastTrackedPosition: null,
      playbackDuration: 120_000,
      playbackPosition: 120_000,
      thresholdMs: 300_000,
    },
  );
  assert.equal(
    normalizeRestoredAdGate({
      active: true,
      accumulatedMs: 10_000,
      playbackDuration: 30_000,
      playbackPosition: 12_000,
      thresholdMs: 300_000,
    }).active,
    false,
  );
  assert.deepEqual(normalizeMode({ loop: true, shuffle: "bad" }), {
    loop: true,
    shuffle: false,
  });
  assert.deepEqual(
    normalizeQueueFilter({ order: "bad", query: 12, sort: "title" }),
    {
      order: "desc",
      query: "",
      sort: "title",
    },
  );
  assert.deepEqual(normalizeSource({ id: second.id, type: "playlist" }), {
    id: second.id,
    type: "playlist",
  });
  assert.equal(normalizeSource({ id: "bad", type: "playlist" }), null);

  const normalizedState = normalizePlaybackState({
    activeQueueIndex: 5,
    activeTrackId: second.id,
    adGate: {
      active: true,
      accumulatedMs: 999_999,
      lastTrackedPosition: -10,
      playbackDuration: 120_000,
      playbackPosition: 999_999,
      thresholdMs: 300_000,
    },
    isPlaying: true,
    mode: { loop: true, shuffle: "bad" },
    queue: [
      {
        album: "Smoke Album",
        artist: "Smoke Artist",
        duration: 120_000,
        id: second.id,
        pathToFile: "/tmp/second.mp3",
        title: "Second",
      },
      { id: "invalid" },
    ],
    queueFilter: { order: "bad", query: 12, sort: "title" },
    source: { id: second.id, type: "playlist" },
  });
  assert.equal(normalizedState.activeQueueIndex, null);
  assert.equal(normalizedState.adGate.active, false);
  assert.equal(normalizedState.mode.loop, true);
  assert.equal(normalizedState.mode.shuffle, false);
  assert.equal(normalizedState.queue.length, 1);
  assert.deepEqual(normalizedState.queueFilter, {
    order: "desc",
    query: "",
    sort: "title",
  });
  assert.deepEqual(normalizedState.source, { id: second.id, type: "playlist" });

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
  assert.deepEqual(
    getPlaybackQueueRowPresentation({
      activeTrackId: first.id,
      adBreakActive: false,
      index: 0,
      queueLength: state.queue.length,
      song: first,
    }),
    {
      canMoveDown: true,
      canMoveUp: false,
      canPlay: true,
      durationLabel: "3:00",
      indexLabel: "1",
      isActive: true,
      metadataLabel: "Smoke Artist / Smoke Album",
      moveDownAccessibilityLabel: "Move First down",
      moveDownLabel: "Down",
      moveUpAccessibilityLabel: "Move First up",
      moveUpLabel: "Up",
      removeLabel: "Remove",
    },
  );
  const advancementEvents: unknown[] = [];
  assert.deepEqual(
    runPlaybackTrackAdvancementCommand({
      beginAdBreak: () => advancementEvents.push(["ad"]),
      canRunPlaybackCommand: () => false,
      dispatch: (action) => advancementEvents.push(["dispatch", action]),
      playNativeTrack: async (track) => {
        advancementEvents.push(["play", track.id]);
      },
      runNativeCommand: (command) => {
        advancementEvents.push(["native"]);
        void command();
      },
      state,
    }),
    { result: "started-ad", targetIndex: null },
  );
  assert.deepEqual(
    runPlaybackTrackAdvancementCommand({
      beginAdBreak: () => advancementEvents.push(["ad"]),
      canRunPlaybackCommand: () => true,
      dispatch: (action) => advancementEvents.push(["dispatch", action]),
      playNativeTrack: async (track) => {
        advancementEvents.push(["play", track.id]);
      },
      runNativeCommand: (command) => {
        advancementEvents.push(["native"]);
        void command();
      },
      state,
    }),
    { result: "advanced", targetIndex: 1 },
  );
  assert.deepEqual(advancementEvents, [
    ["ad"],
    ["dispatch", { targetIndex: 1, type: "native-finished" }],
    ["native"],
    ["play", second.id],
  ]);
  const assembledAdvancementEvents: unknown[] = [];
  const finishTrack = createPlaybackTrackAdvancementCommand({
    adapter: {
      play: async (track) => {
        assembledAdvancementEvents.push(["play", track.id]);
      },
    },
    beginAdBreak: () => assembledAdvancementEvents.push(["ad"]),
    canRunPlaybackCommand: () => true,
    dispatch: (action) => assembledAdvancementEvents.push(["dispatch", action]),
    runNativeCommand: (command) => {
      assembledAdvancementEvents.push(["native"]);
      void command();
    },
    stateRef: { current: state },
  });
  finishTrack();
  assert.deepEqual(assembledAdvancementEvents, [
    ["dispatch", { targetIndex: 1, type: "native-finished" }],
    ["native"],
    ["play", second.id],
  ]);

  state = playbackReducer(
    state,
    getMovePlaybackQueueSongAction({
      direction: "up",
      songId: third.id,
    }),
  );
  assert.deepEqual(
    state.queue.map((item) => item.id),
    [1, 3, 2],
  );
  assert.equal(state.activeQueueIndex, 0);

  state = playbackReducer(state, { songId: first.id, type: "remove-from-queue" });
  assert.equal(state.activeTrackId, third.id);
  assert.equal(state.activeQueueIndex, 0);
  assert.equal(state.isPlaying, true);

  state = playbackReducer(state, getTogglePlaybackShuffleAction());
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

  const directLibraryStatusUpdate = getPlaybackLibraryStatusUpdate({
    premiumActive: false,
    state,
    status: {
      didJustFinish: false,
      duration: 600_000,
      isLoaded: true,
      isPlaying: true,
      position: -100,
      songId: third.id,
      source: "library",
    },
  });
  assert.equal(directLibraryStatusUpdate.duration, 600_000);
  assert.equal(directLibraryStatusUpdate.position, 0);
  assert.equal(directLibraryStatusUpdate.isPlaying, true);

  const libraryNativeStatus = {
    didJustFinish: false,
    duration: 600_000,
    isLoaded: true,
    isPlaying: true,
    position: 0,
    songId: third.id,
    source: "library" as const,
  };
  assert.deepEqual(
    getPlaybackNativeStatusAction({
      premiumActive: false,
      status: libraryNativeStatus,
    }),
    {
      premiumActive: false,
      status: libraryNativeStatus,
      type: "native-status",
    },
  );
  assert.deepEqual(getPlaybackNativeFailureAction("Ad failure"), {
    error: "Ad failure",
    type: "native-failure",
  });
  assert.deepEqual(getPlaybackNativeFinishedAction(1), {
    targetIndex: 1,
    type: "native-finished",
  });

  state = playbackReducer(
    state,
    getPlaybackNativeStatusAction({
      premiumActive: false,
      status: libraryNativeStatus,
    }),
  );
  assert.equal(state.adGate.lastTrackedPosition, 0);

  state = playbackReducer(
    state,
    getPlaybackNativeStatusAction({
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
    }),
  );
  assert.equal(state.adGate.due, true);

  assert.deepEqual(getBeginPlaybackAdBreakAction(), {
    type: "begin-ad-break",
  });
  assert.deepEqual(getCompletePlaybackAdBreakAction(), {
    type: "complete-ad-break",
  });
  assert.deepEqual(getSyncPlaybackPremiumAction(true), {
    premiumActive: true,
    type: "sync-premium",
  });
  assert.equal(
    canRunPlaybackWithAdGate({
      gate: { active: false, due: false },
      premiumActive: false,
    }),
    true,
  );
  assert.equal(
    canRunPlaybackWithAdGate({
      gate: { active: false, due: true },
      premiumActive: false,
    }),
    false,
  );
  assert.equal(
    canRunPlaybackWithAdGate({
      gate: { active: true, due: true },
      premiumActive: true,
    }),
    true,
  );
  assert.equal(
    shouldStartPlaybackAdBreak({
      gate: { active: false, due: true },
      premiumActive: false,
    }),
    true,
  );
  assert.equal(
    shouldStartPlaybackAdBreak({
      gate: { active: true, due: true },
      premiumActive: false,
    }),
    false,
  );
  assert.equal(
    shouldResumePlaybackAfterPremium({
      gate: { active: true },
      hasActiveTrack: true,
      premiumActive: true,
    }),
    true,
  );
  assert.equal(
    shouldResumePlaybackAfterPremium({
      gate: { active: true },
      hasActiveTrack: false,
      premiumActive: true,
    }),
    false,
  );
  assert.deepEqual(
    getPlaybackAdGateControllerDecisions({
      hasActiveTrack: true,
      premiumActive: false,
      state: {
        adGate: {
          active: false,
          due: true,
        },
      },
    }),
    {
      shouldBeginAdBreak: true,
      shouldResumeAfterPremium: false,
    },
  );
  assert.deepEqual(
    getPlaybackAdGateControllerDecisions({
      hasActiveTrack: true,
      premiumActive: true,
      state: {
        adGate: {
          active: true,
          due: true,
        },
      },
    }),
    {
      shouldBeginAdBreak: false,
      shouldResumeAfterPremium: true,
    },
  );
  const adGateControlEvents: unknown[] = [];
  const adGateControls = createPlaybackAdGateControls({
    dispatch: (action) => {
      adGateControlEvents.push(["dispatch", action.type]);
    },
    onBeginAdBreak: () => {
      adGateControlEvents.push(["native-ad"]);
    },
    premiumActiveRef: { current: false },
    stateRef: {
      current: {
        ...state,
        adGate: {
          ...state.adGate,
          active: false,
          due: true,
        },
      },
    },
  });
  assert.equal(adGateControls.canRunPlaybackCommand(), false);
  adGateControls.beginAdBreak();
  assert.deepEqual(adGateControlEvents, [
    ["dispatch", "begin-ad-break"],
    ["native-ad"],
  ]);

  state = playbackReducer(state, getBeginPlaybackAdBreakAction());
  assert.equal(state.adGate.active, true);
  assert.equal(state.isPlaying, false);

  const adNativeStatus = {
    didJustFinish: false,
    duration: 30_000,
    isLoaded: true,
    isPlaying: true,
    position: 12_000,
    songId: null,
    source: "ad" as const,
  };
  const directAdStatusUpdate = getPlaybackAdStatusUpdate({
    state,
    status: adNativeStatus,
  });
  assert.equal(directAdStatusUpdate.adGate.playbackDuration, 30_000);
  assert.equal(directAdStatusUpdate.adGate.playbackPosition, 12_000);
  assert.equal(directAdStatusUpdate.isPlaying, false);

  state = playbackReducer(
    state,
    getPlaybackNativeStatusAction({
      premiumActive: false,
      status: adNativeStatus,
    }),
  );
  assert.equal(state.adGate.playbackDuration, 30_000);
  assert.equal(state.adGate.playbackPosition, 12_000);
  assert.equal(state.isPlaying, false);

  state = playbackReducer(state, getPlaybackNativeFailureAction("Ad failure"));
  state = playbackReducer(state, getCompletePlaybackAdBreakAction());
  assert.equal(state.adGate.active, false);
  assert.equal(state.adGate.due, false);
  assert.equal(state.error, null);
  assert.equal(state.isPlaying, true);

  state = playbackReducer(state, getPlaybackNativeFinishedAction(1));
  assert.equal(state.activeTrackId, second.id);
  assert.equal(state.activeQueueIndex, 1);
  assert.equal(state.position, 0);
  assert.equal(state.isPlaying, true);

  state = playbackReducer(state, getPlaybackNativeFinishedAction(null));
  assert.equal(state.activeTrackId, second.id);
  assert.equal(state.position, state.duration);
  assert.equal(state.isPlaying, false);

  state = playbackReducer(state, getBeginPlaybackAdBreakAction());
  state = playbackReducer(state, getSyncPlaybackPremiumAction(true));
  assert.equal(state.adGate.active, false);
  assert.equal(state.adGate.due, false);
  assert.equal(state.isPlaying, true);
}

async function assertPlaybackPersistenceExecutorSmoke() {
  const calls: string[] = [];
  const files = new Map<string, string>();
  let documentDirectory: string | null = "file:///documents/";
  const playbackFile = "file:///documents/playback/session.json";
  const first = song({ id: 501, title: "Persisted First" });
  const second = song({ id: 502, title: "Persisted Second" });
  const dependencies: PlaybackPersistenceDependencies = {
    deletePath: async (path, options) => {
      calls.push(`delete:${path}:${String(options.idempotent)}`);
      files.delete(path);
    },
    get documentDirectory() {
      return documentDirectory;
    },
    getInfo: async (path) => {
      calls.push(`info:${path}`);
      return { exists: files.has(path) };
    },
    makeDirectory: async (path, options) => {
      calls.push(`mkdir:${path}:${String(options.intermediates)}`);
    },
    readAsString: async (path) => {
      calls.push(`read:${path}`);
      const contents = files.get(path);
      if (contents === undefined) {
        throw new Error("Missing playback state.");
      }

      return contents;
    },
    writeAsString: async (path, contents) => {
      calls.push(`write:${path}:${contents}`);
      files.set(path, contents);
    },
  };

  assert.equal(
    getPlaybackStateDirectoryWithDependencies(dependencies),
    "file:///documents/playback",
  );
  assert.equal(
    getPlaybackStateFileWithDependencies(dependencies),
    playbackFile,
  );
  assert.deepEqual(
    await loadPersistedPlaybackStateWithDependencies(dependencies),
    initialPlaybackState,
  );
  assert.deepEqual(calls, [`info:${playbackFile}`]);

  calls.length = 0;
  files.set(playbackFile, "{not-json");
  assert.deepEqual(
    await loadPersistedPlaybackStateWithDependencies(dependencies),
    initialPlaybackState,
  );
  assert.deepEqual(calls, [`info:${playbackFile}`, `read:${playbackFile}`]);

  calls.length = 0;
  files.set(
    playbackFile,
    JSON.stringify({
      activeQueueIndex: 1,
      activeTrackId: second.id,
      isPlaying: true,
      queue: [first, second],
      source: { id: 42, type: "playlist" },
    }),
  );
  const loadedState =
    await loadPersistedPlaybackStateWithDependencies(dependencies);
  assert.equal(loadedState.activeQueueIndex, 1);
  assert.equal(loadedState.activeTrackId, second.id);
  assert.equal(loadedState.isPlaying, true);
  assert.deepEqual(
    loadedState.queue.map((item) => item.id),
    [first.id, second.id],
  );
  assert.deepEqual(loadedState.source, { id: 42, type: "playlist" });
  assert.deepEqual(calls, [`info:${playbackFile}`, `read:${playbackFile}`]);

  calls.length = 0;
  const stateToSave = {
    ...initialPlaybackState,
    activeQueueIndex: 0,
    activeTrackId: first.id,
    error: "Do not persist this error.",
    isPlaying: true,
    queue: [first],
  };
  await savePersistedPlaybackStateWithDependencies({
    dependencies,
    state: stateToSave,
  });
  assert.deepEqual(calls, [
    "mkdir:file:///documents/playback:true",
    `write:${playbackFile}:${JSON.stringify(
      toPersistedPlaybackState(stateToSave),
    )}`,
  ]);
  assert.equal(JSON.parse(files.get(playbackFile) ?? "{}").error, undefined);

  calls.length = 0;
  await clearPersistedPlaybackStateWithDependencies(dependencies);
  assert.deepEqual(calls, [`delete:${playbackFile}:true`]);
  assert.equal(files.has(playbackFile), false);

  documentDirectory = null;
  assert.throws(
    () => getPlaybackStateDirectoryWithDependencies(dependencies),
    /document directory/i,
  );
  assert.deepEqual(
    await loadPersistedPlaybackStateWithDependencies(dependencies),
    initialPlaybackState,
  );
  await assert.rejects(
    () =>
      savePersistedPlaybackStateWithDependencies({
        dependencies,
        state: initialPlaybackState,
      }),
    /document directory/i,
  );
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
  const nativeStatusEvents: unknown[] = [];
  const dispatchNativeStatus = (action: PlaybackAction) => {
    nativeStatusEvents.push(["dispatch", action]);
  };
  const runNativeStatusCommand = (command: () => Promise<void>) => {
    nativeStatusEvents.push(["native"]);
    void command();
  };
  assert.equal(
    runPlaybackNativeStatusCommand({
      dispatch: dispatchNativeStatus,
      finishActiveTrack: () => nativeStatusEvents.push(["finish"]),
      premiumActive: false,
      resumeLibrary: async () => {
        nativeStatusEvents.push(["resume-library"]);
      },
      runNativeCommand: runNativeStatusCommand,
      status: {
        didJustFinish: false,
        duration: 180_000,
        isLoaded: true,
        isPlaying: true,
        position: 12_500,
        songId: 5,
        source: "library",
      },
    }),
    "updated-status",
  );
  assert.equal(
    runPlaybackNativeStatusCommand({
      dispatch: dispatchNativeStatus,
      finishActiveTrack: () => nativeStatusEvents.push(["finish"]),
      premiumActive: false,
      resumeLibrary: async () => {
        nativeStatusEvents.push(["resume-library"]);
      },
      runNativeCommand: runNativeStatusCommand,
      status: {
        didJustFinish: true,
        duration: null,
        isLoaded: true,
        isPlaying: false,
        position: 2_000,
        songId: null,
        source: "ad",
      },
    }),
    "completed-ad",
  );
  assert.equal(
    runPlaybackNativeStatusCommand({
      dispatch: dispatchNativeStatus,
      finishActiveTrack: () => nativeStatusEvents.push(["finish"]),
      premiumActive: false,
      resumeLibrary: async () => {
        nativeStatusEvents.push(["resume-library"]);
      },
      runNativeCommand: runNativeStatusCommand,
      status: {
        didJustFinish: true,
        duration: 180_000,
        isLoaded: true,
        isPlaying: false,
        position: 180_000,
        songId: 5,
        source: "library",
      },
    }),
    "finished-track",
  );
  assert.deepEqual(nativeStatusEvents, [
    [
      "dispatch",
      {
        premiumActive: false,
        status: {
          didJustFinish: false,
          duration: 180_000,
          isLoaded: true,
          isPlaying: true,
          position: 12_500,
          songId: 5,
          source: "library",
        },
        type: "native-status",
      },
    ],
    ["dispatch", { type: "complete-ad-break" }],
    ["native"],
    ["resume-library"],
    ["finish"],
  ]);
}

function assertPlaybackNativePlayerStateSmoke() {
  const emptyState = initialPlaybackNativePlayerRegistryState();
  assert.deepEqual(emptyState, {
    activeSource: null,
    loadedSongId: null,
  });

  const firstLibraryState = getPlaybackNativePlayerPlayLibraryState({
    songId: 10,
    state: emptyState,
  });
  assert.deepEqual(firstLibraryState, {
    activeSource: "library",
    loadedSongId: 10,
  });
  assert.deepEqual(
    getPlaybackNativePlayerPlayLibraryPlan({
      songId: 10,
      state: firstLibraryState,
    }),
    { type: "replay-loaded-song" },
  );
  assert.deepEqual(
    getPlaybackNativePlayerPlayLibraryPlan({
      songId: 11,
      state: firstLibraryState,
    }),
    { type: "replace-library-player" },
  );
  assert.deepEqual(
    getPlaybackNativeLibraryPlaybackTarget({
      hasLibraryPlayer: true,
      songId: 10,
      state: firstLibraryState,
    }),
    { type: "replay-loaded-song" },
  );
  assert.deepEqual(
    getPlaybackNativeLibraryPlaybackTarget({
      hasLibraryPlayer: false,
      songId: 10,
      state: firstLibraryState,
    }),
    { type: "replace-library-player" },
  );
  assert.deepEqual(
    getPlaybackNativeLibraryAudioSource({
      id: 10,
      pathToFile: "/tmp/playable.mp3",
    }),
    { uri: "/tmp/playable.mp3" },
  );
  assert.throws(
    () => getPlaybackNativeLibraryAudioSource({ id: 10, pathToFile: null }),
    /playable file path/,
  );

  const adState = getPlaybackNativePlayerPlayAdState(firstLibraryState);
  assert.deepEqual(adState, {
    activeSource: "ad",
    loadedSongId: 10,
  });
  assert.equal(getPlaybackNativePlayerControlTarget(adState), "ad");
  assert.equal(
    getPlaybackNativePlayerControlTarget(firstLibraryState),
    "library",
  );
  assert.deepEqual(getPlaybackNativePlayerResumeLibraryState(adState), {
    activeSource: "library",
    loadedSongId: 10,
  });
  assert.deepEqual(
    getPlaybackNativePlayerRemoveSourceState({
      source: "ad",
      state: adState,
    }),
    {
      activeSource: null,
      loadedSongId: 10,
    },
  );
  assert.deepEqual(
    getPlaybackNativePlayerRemoveSourceState({
      source: "library",
      state: firstLibraryState,
    }),
    {
      activeSource: null,
      loadedSongId: null,
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
  const nativeRunnerEvents: unknown[] = [];
  const nativeRunner = createPlaybackNativeCommandRunner({
    adapter: {
      destroy: () => Promise.resolve(),
      pause: () => {
        nativeRunnerEvents.push(["adapter", "pause"]);
        return Promise.resolve();
      },
      play: (song) => {
        nativeRunnerEvents.push(["adapter", "play", song.id]);
        return Promise.resolve();
      },
      playAd: () => {
        nativeRunnerEvents.push(["adapter", "play-ad"]);
        return Promise.resolve();
      },
      restore: (restoredState) => {
        nativeRunnerEvents.push([
          "adapter",
          "restore",
          restoredState.activeTrackId,
        ]);
        return Promise.resolve();
      },
      resume: () => {
        nativeRunnerEvents.push(["adapter", "resume"]);
        return Promise.resolve();
      },
      resumeLibrary: () => {
        nativeRunnerEvents.push(["adapter", "resume-library"]);
        return Promise.resolve();
      },
      seekTo: (position) => {
        nativeRunnerEvents.push(["adapter", "seek", position]);
        return Promise.resolve();
      },
      setStatusListener: () => {},
      stop: () => {
        nativeRunnerEvents.push(["adapter", "stop"]);
        return Promise.resolve();
      },
    },
    dispatch: (action) => {
      nativeRunnerEvents.push(["dispatch", action.type]);
    },
  });
  nativeRunner.runNativeCommandPlan({ type: "pause" });
  nativeRunner.runNativeCommandPlan({ track: first, type: "play" });
  nativeRunner.runNativeCommandPlan({ type: "resume" });
  nativeRunner.runNativeCommandPlan({ position: 1234, type: "seek" });
  nativeRunner.runNativeCommandPlan({ type: "stop" });
  nativeRunner.restorePersistedPlaybackState(state);
  nativeRunner.playNativeAdBreak();
  nativeRunner.resumeNativeLibraryAfterPremium();
  assert.deepEqual(nativeRunnerEvents, [
    ["adapter", "pause"],
    ["adapter", "play", first.id],
    ["adapter", "resume"],
    ["adapter", "seek", 1234],
    ["adapter", "stop"],
    ["adapter", "restore", first.id],
    ["adapter", "play-ad"],
    ["adapter", "resume-library"],
  ]);
  assert.deepEqual(
    getPlaybackNativeTargetCommandPlan({
      queue: [first, second],
      targetIndex: 1,
    }),
    {
      command: { track: second, type: "play" },
      targetIndex: 1,
    },
  );
  assert.deepEqual(
    getPlaybackNativeTargetCommandPlan({
      queue: [first, second],
      targetIndex: null,
    }),
    {
      command: { type: "stop" },
      targetIndex: null,
    },
  );
  assert.deepEqual(
    getPlaybackNativeResumeCommandPlan({ activeTrack: first }),
    { type: "resume" },
  );
  assert.deepEqual(getPlaybackNativeResumeCommandPlan({ activeTrack: null }), {
    type: "noop",
  });
  assert.deepEqual(
    getPlaybackNativePreviousCommandPlan({ previousTrack: first }),
    { track: first, type: "play" },
  );
  assert.deepEqual(
    getPlaybackNativePreviousCommandPlan({ previousTrack: null }),
    { position: 0, type: "seek" },
  );
  assert.deepEqual(
    getPlaybackNativeReplacementCommandPlan({
      isPlaying: true,
      replacementTrack: second,
    }),
    { track: second, type: "play" },
  );
  assert.deepEqual(
    getPlaybackNativeReplacementCommandPlan({
      isPlaying: false,
      replacementTrack: second,
    }),
    { type: "stop" },
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

  const transportEvents: unknown[] = [];
  const runAdGatedTransportCommand = (command: () => void) => {
    transportEvents.push(["gate"]);
    command();
  };
  const runTransportCommandPlan = (
    plan: ReturnType<typeof getPausePlaybackCommandPlan>,
  ) => {
    transportEvents.push(["plan", plan.action.type, plan.nativeCommand.type]);
  };
  runPlaybackTransportPlaySongCommand({
    runAdGatedCommand: runAdGatedTransportCommand,
    runCommandPlan: runTransportCommandPlan,
    song: first,
  });
  runPlaybackTransportPauseCommand({
    runCommandPlan: runTransportCommandPlan,
  });
  runPlaybackTransportResumeCommand({
    runAdGatedCommand: runAdGatedTransportCommand,
    runCommandPlan: runTransportCommandPlan,
    state,
  });
  runPlaybackTransportSeekCommand({
    position: 42_000,
    runAdGatedCommand: runAdGatedTransportCommand,
    runCommandPlan: runTransportCommandPlan,
  });
  runPlaybackTransportSkipNextCommand({
    runAdGatedCommand: runAdGatedTransportCommand,
    runCommandPlan: runTransportCommandPlan,
    state,
  });
  runPlaybackTransportSkipPreviousCommand({
    runAdGatedCommand: runAdGatedTransportCommand,
    runCommandPlan: runTransportCommandPlan,
    state,
  });
  assert.deepEqual(transportEvents, [
    ["gate"],
    ["plan", "play-song", "play"],
    ["plan", "pause", "pause"],
    ["gate"],
    ["plan", "resume", "resume"],
    ["gate"],
    ["plan", "seek-to", "seek"],
    ["gate"],
    ["plan", "skip-next", "play"],
    ["gate"],
    ["plan", "skip-previous", "play"],
  ]);
  const assembledTransportEvents: unknown[] = [];
  const transportCommands = createPlaybackTransportCommands({
    getState: () => state,
    runAdGatedCommand: (command) => {
      assembledTransportEvents.push(["gate"]);
      command();
    },
    runCommandPlan: (plan) => {
      assembledTransportEvents.push([
        "plan",
        plan.action.type,
        plan.nativeCommand.type,
      ]);
    },
  });
  transportCommands.playSong(first);
  transportCommands.pause();
  transportCommands.resume();
  transportCommands.seekTo(42_000);
  transportCommands.skipNext();
  transportCommands.skipPrevious();
  assert.deepEqual(assembledTransportEvents, [
    ["gate"],
    ["plan", "play-song", "play"],
    ["plan", "pause", "pause"],
    ["gate"],
    ["plan", "resume", "resume"],
    ["gate"],
    ["plan", "seek-to", "seek"],
    ["gate"],
    ["plan", "skip-next", "play"],
    ["gate"],
    ["plan", "skip-previous", "play"],
  ]);

  const queueSessionEvents: unknown[] = [];
  const dispatchQueueSessionCommand = (action: PlaybackAction) => {
    queueSessionEvents.push(["dispatch", action.type]);
  };
  const runQueueSessionCommandPlan = (
    plan: ReturnType<typeof getPausePlaybackCommandPlan>,
  ) => {
    queueSessionEvents.push([
      "plan",
      plan.action.type,
      plan.nativeCommand.type,
    ]);
  };
  runPlaybackQueueAddSongCommand({
    dispatch: dispatchQueueSessionCommand,
    song: second,
  });
  runPlaybackQueueMoveSongCommand({
    direction: "up",
    dispatch: dispatchQueueSessionCommand,
    songId: second.id,
  });
  runPlaybackQueueToggleLoopCommand({
    dispatch: dispatchQueueSessionCommand,
  });
  runPlaybackQueueToggleShuffleCommand({
    dispatch: dispatchQueueSessionCommand,
  });
  runPlaybackQueueClearSessionCommand({
    runCommandPlan: runQueueSessionCommandPlan,
  });
  runPlaybackQueueRemoveSongCommand({
    runCommandPlan: runQueueSessionCommandPlan,
    songId: first.id,
    state,
  });
  assert.deepEqual(queueSessionEvents, [
    ["dispatch", "add-to-queue"],
    ["dispatch", "move-queue-song"],
    ["dispatch", "toggle-loop"],
    ["dispatch", "toggle-shuffle"],
    ["plan", "clear-queue", "stop"],
    ["plan", "remove-from-queue", "play"],
  ]);

  const assembledQueueCommandEvents: unknown[] = [];
  const queueCommands = createPlaybackQueueCommands({
    dispatch: (action) => {
      assembledQueueCommandEvents.push(["dispatch", action.type]);
    },
    getState: () => state,
    runCommandPlan: (plan) => {
      assembledQueueCommandEvents.push([
        "plan",
        plan.action.type,
        plan.nativeCommand.type,
      ]);
    },
  });
  queueCommands.addToQueue(second);
  queueCommands.moveQueueSong(second.id, "down");
  queueCommands.toggleLoop();
  queueCommands.toggleShuffle();
  queueCommands.clearQueue();
  queueCommands.removeFromQueue(first.id);
  assert.deepEqual(assembledQueueCommandEvents, [
    ["dispatch", "add-to-queue"],
    ["dispatch", "move-queue-song"],
    ["dispatch", "toggle-loop"],
    ["dispatch", "toggle-shuffle"],
    ["plan", "clear-queue", "stop"],
    ["plan", "remove-from-queue", "play"],
  ]);

  const remoteEvents: string[] = [];
  let remoteAllowed = true;
  const remoteHandlers: PlaybackRemoteCommandHandlers = {
    beginAdBreak: () => remoteEvents.push("ad"),
    canRunPlaybackCommand: () => remoteAllowed,
    fail: (message) => remoteEvents.push(`fail:${message}`),
    pause: () => remoteEvents.push("pause"),
    queueEnded: () => remoteEvents.push("queue-ended"),
    resume: () => remoteEvents.push("resume"),
    seekTo: (position) => remoteEvents.push(`seek:${position}`),
    skipNext: () => remoteEvents.push("next"),
    skipPrevious: () => remoteEvents.push("previous"),
  };
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "play" },
      handlers: remoteHandlers,
    }),
    "handled",
  );
  assert.deepEqual(remoteEvents, ["resume"]);
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "next" },
      handlers: remoteHandlers,
    }),
    "handled",
  );
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "previous" },
      handlers: remoteHandlers,
    }),
    "handled",
  );
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "queue-ended" },
      handlers: remoteHandlers,
    }),
    "handled",
  );
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { position: 64_000, type: "seek" },
      handlers: remoteHandlers,
    }),
    "handled",
  );
  assert.deepEqual(remoteEvents, [
    "resume",
    "next",
    "previous",
    "queue-ended",
    "seek:64000",
  ]);

  remoteAllowed = false;
  remoteEvents.length = 0;
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "play" },
      handlers: remoteHandlers,
    }),
    "started-ad",
  );
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "next" },
      handlers: remoteHandlers,
    }),
    "started-ad",
  );
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "previous" },
      handlers: remoteHandlers,
    }),
    "started-ad",
  );
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "queue-ended" },
      handlers: remoteHandlers,
    }),
    "started-ad",
  );
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { position: 12_000, type: "seek" },
      handlers: remoteHandlers,
    }),
    "blocked-by-ad",
  );
  assert.deepEqual(remoteEvents, ["ad", "ad", "ad", "ad"]);

  remoteEvents.length = 0;
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { type: "pause" },
      handlers: remoteHandlers,
    }),
    "handled",
  );
  assert.equal(
    handlePlaybackRemoteCommand({
      command: { message: "Remote smoke failure", type: "error" },
      handlers: remoteHandlers,
    }),
    "handled",
  );
  assert.deepEqual(remoteEvents, ["pause", "fail:Remote smoke failure"]);
  const assembledRemoteEvents: string[] = [];
  const assembledRemoteHandler = createPlaybackRemoteCommandHandler({
    beginAdBreak: () => assembledRemoteEvents.push("ad"),
    canRunPlaybackCommand: () => true,
    finishActiveTrack: () => assembledRemoteEvents.push("queue-ended"),
    pause: () => assembledRemoteEvents.push("pause"),
    resume: () => assembledRemoteEvents.push("resume"),
    runCommandPlan: (plan) =>
      assembledRemoteEvents.push(`plan:${plan.action.type}`),
    seekTo: (position) => assembledRemoteEvents.push(`seek:${position}`),
    skipNext: () => assembledRemoteEvents.push("next"),
    skipPrevious: () => assembledRemoteEvents.push("previous"),
  });
  assert.equal(assembledRemoteHandler({ type: "play" }), "handled");
  assert.equal(
    assembledRemoteHandler({
      message: "Assembled remote failure",
      type: "error",
    }),
    "handled",
  );
  assert.deepEqual(assembledRemoteEvents, [
    "resume",
    "plan:remote-failure",
  ]);
  const assembledCommandEvents: unknown[] = [];
  const assembledCommands = createPlaybackCommands({
    handleRemoteCommand: (command) => {
      assembledCommandEvents.push(["remote", command.type]);
      return "handled";
    },
    queueCommands: {
      addToQueue: (song) => assembledCommandEvents.push(["add", song.id]),
      clearQueue: () => assembledCommandEvents.push(["clear"]),
      moveQueueSong: (songId, direction) =>
        assembledCommandEvents.push(["move", songId, direction]),
      removeFromQueue: (songId) =>
        assembledCommandEvents.push(["remove", songId]),
      toggleLoop: () => assembledCommandEvents.push(["loop"]),
      toggleShuffle: () => assembledCommandEvents.push(["shuffle"]),
    },
    transportCommands: {
      pause: () => assembledCommandEvents.push(["pause"]),
      playSong: (song) => assembledCommandEvents.push(["play", song.id]),
      resetPlaybackSession: () => assembledCommandEvents.push(["reset"]),
      resume: () => assembledCommandEvents.push(["resume"]),
      seekTo: (position) => assembledCommandEvents.push(["seek", position]),
      skipNext: () => assembledCommandEvents.push(["next"]),
      skipPrevious: () => assembledCommandEvents.push(["previous"]),
    },
  });
  assembledCommands.addToQueue(first);
  assembledCommands.playSong(second);
  assembledCommands.resetPlaybackSession();
  assert.equal(assembledCommands.handleRemoteCommand({ type: "pause" }), "handled");
  assert.deepEqual(assembledCommandEvents, [
    ["add", first.id],
    ["play", second.id],
    ["reset"],
    ["remote", "pause"],
  ]);

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
  assert.deepEqual(getPlaySongPlaybackStepPlan(first), {
    action: {
      song: first,
      type: "play-song",
    },
    nativeCommand: { track: first, type: "play" },
  });
  assert.deepEqual(getPausePlaybackStepPlan(), {
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
  assert.deepEqual(getSeekToPlaybackStepPlan(42_000), {
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
  assert.deepEqual(getClearQueuePlaybackStepPlan(), {
    action: { type: "clear-queue" },
    nativeCommand: { type: "stop" },
  });
  assert.deepEqual(getResetPlaybackCommandPlan(), {
    action: { type: "reset" },
    nativeCommand: { type: "stop" },
  });
  assert.deepEqual(getResetPlaybackStepPlan(), {
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
  const runnerEvents: unknown[] = [];
  const commandRunners = createPlaybackCommandRunners({
    beginAdBreak: () => runnerEvents.push(["ad"]),
    canRunPlaybackCommand: () => true,
    dispatch: (action) => runnerEvents.push(["dispatch", action.type]),
    runNativeCommandPlan: (plan) => runnerEvents.push(["native", plan.type]),
  });
  commandRunners.runCommandPlan(getPausePlaybackCommandPlan());
  commandRunners.runAdGatedCommand(() => runnerEvents.push(["command"]));
  assert.deepEqual(runnerEvents, [
    ["dispatch", "pause"],
    ["native", "pause"],
    ["command"],
  ]);
  assert.deepEqual(getRemoteFailurePlaybackCommandPlan("Remote smoke failure"), {
    action: {
      error: "Remote smoke failure",
      type: "remote-failure",
    },
    nativeCommand: { type: "stop" },
  });
  assert.deepEqual(getRemoteFailurePlaybackStepPlan("Remote smoke failure"), {
    action: {
      error: "Remote smoke failure",
      type: "remote-failure",
    },
    nativeCommand: { type: "stop" },
  });
}

function assertPlaybackPlayerStateSmoke() {
  const activeTrack = song({ duration: 180_000, id: 10, title: "Mini Track" });

  assert.equal(getPlaybackPlayerHref(), "/player");
  assert.equal(getPlaybackQueueHref(), "/queue");
  assert.equal(getPlaybackPremiumHref(), "/premium");
  assert.deepEqual(getPlaybackPlayerScreenState(), {
    header: {
      kicker: "Now Playing",
      subtitle:
        "Control playback, queue movement, shuffle, repeat, and free-listening ad breaks.",
      title: "Player",
    },
    queueLink: {
      href: "/queue",
      label: "Open queue",
    },
  });
  assert.deepEqual(getPlaybackQueueEmptyState(), {
    body: "Open a song from Library to start listening.",
    title: "Queue is empty",
  });
  assert.deepEqual(getPlaybackQueueScreenState(), {
    adBreakPanel: {
      action: {
        href: "/premium",
        label: "Open Premium",
      },
      body:
        "Queue playback commands are paused while the bundled ad plays. Your song resumes automatically when the ad finishes.",
      kicker: "Premium gate",
      title: "Ad break required",
    },
    backLink: {
      href: "/player",
      label: "Back to player",
    },
    clearQueueLabel: "Clear queue",
    emptyState: {
      body: "Open a song from Library to start listening.",
      title: "Queue is empty",
    },
    header: {
      kicker: "Playback queue",
      subtitle:
        "Reorder upcoming songs, remove tracks, or jump to a different song.",
      title: "Now Playing",
    },
  });
  assert.deepEqual(
    getPlaybackQueueViewState({
      activeTrackId: null,
      adBreakActive: false,
      queue: [],
    }),
    {
      actionState: {
        canClearQueue: false,
      },
      rows: [],
      screenState: getPlaybackQueueScreenState(),
    },
  );
  assert.deepEqual(
    getPlaybackQueueViewState({
      activeTrackId: activeTrack.id,
      adBreakActive: true,
      queue: [activeTrack],
    }),
    {
      actionState: {
        canClearQueue: true,
      },
      rows: [
        {
          rowState: {
            canMoveDown: false,
            canMoveUp: false,
            canPlay: false,
            durationLabel: "3:00",
            indexLabel: "1",
            isActive: true,
            metadataLabel: "Smoke Artist / Smoke Album",
            moveDownAccessibilityLabel: "Move Mini Track down",
            moveDownLabel: "Down",
            moveUpAccessibilityLabel: "Move Mini Track up",
            moveUpLabel: "Up",
            removeLabel: "Remove",
          },
          song: activeTrack,
        },
      ],
      screenState: getPlaybackQueueScreenState(),
    },
  );
  const playbackQueueControllerViewState = getPlaybackQueueControllerViewState({
    activeTrack,
    state: {
      ...initialPlaybackState,
      activeQueueIndex: 0,
      activeTrackId: activeTrack.id,
      adGate: {
        ...initialPlaybackState.adGate,
        due: true,
      },
      queue: [activeTrack],
    },
  });
  assert.equal(playbackQueueControllerViewState.adBreakActive, true);
  assert.equal(playbackQueueControllerViewState.rows[0]?.rowState.canPlay, false);
  assert.equal(playbackQueueControllerViewState.actionState.canClearQueue, true);
  const playbackPlayerControllerViewState =
    getPlaybackPlayerControllerViewState({
      activeTrack,
      state: {
        ...initialPlaybackState,
        activeQueueIndex: 0,
        activeTrackId: activeTrack.id,
        adGate: {
          ...initialPlaybackState.adGate,
          accumulatedMs: 7_000,
          playbackDuration: 30_000,
          playbackPosition: 15_000,
          thresholdMs: 10_000,
        },
        duration: 200_000,
        position: 50_000,
        queue: [activeTrack],
      },
    });
  assert.equal(playbackPlayerControllerViewState.progressPercent, 25);
  assert.equal(playbackPlayerControllerViewState.adProgressPercent, 50);
  assert.equal(playbackPlayerControllerViewState.freeListeningRemainingMs, 3_000);
  assert.deepEqual(playbackPlayerControllerViewState.activeTrackDetailLink, {
    href: "/(tabs)/library/song/10",
    label: "Song details",
  });
  assert.deepEqual(playbackPlayerControllerViewState.activeTrackEditLink, {
    href: "/(tabs)/library/song/edit/10",
    label: "Edit song",
  });
  assert.deepEqual(
    getPlaybackAdBreakPanelState({
      state: {
        ...initialPlaybackState,
        adGate: {
          ...initialPlaybackState.adGate,
          playbackDuration: 30_000,
          playbackPosition: 15_000,
        },
      },
    }),
    {
      action: {
        href: "/premium",
        label: "Open Premium",
      },
      body:
        "Free playback pauses after 10 minutes of listening. The ad will resume your song when it finishes, or you can open Premium for ad-free listening.",
      kicker: "Premium gate",
      progressLabel: "0:15 / 0:30",
      title: "Ad break required",
    },
  );
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
  assert.deepEqual(getPlaybackPlayerButtonCommand(), {
    haptic: "light",
  });
  assert.deepEqual(
    getPlaybackPlayerSeekCommand({
      direction: "backward",
      state: { duration: 120_000, position: 5_000 },
    }),
    {
      haptic: "light",
      targetPosition: 0,
    },
  );
  assert.deepEqual(
    getPlaybackPlayerSeekCommand({
      direction: "forward",
      state: { duration: 120_000, position: 110_000 },
    }),
    {
      haptic: "light",
      targetPosition: 120_000,
    },
  );
  assert.deepEqual(getPlaybackPlayerPlayPauseCommand({ isPlaying: true }), {
    action: "pause",
    haptic: "soft",
  });
  assert.deepEqual(getPlaybackPlayerPlayPauseCommand({ isPlaying: false }), {
    action: "resume",
    haptic: "light",
  });
  const playerCommandEvents: unknown[] = [];
  const sendPlayerCommandHaptic = (haptic: string) => {
    playerCommandEvents.push(["haptic", haptic]);
  };
  runPlaybackPlayerSeekCommand({
    direction: "forward",
    seekTo: (position) => {
      playerCommandEvents.push(["seek", position]);
    },
    sendHaptic: sendPlayerCommandHaptic,
    state: {
      duration: 120_000,
      position: 110_000,
    },
  });
  runPlaybackPlayerButtonCommand({
    action: () => {
      playerCommandEvents.push(["button-action"]);
    },
    sendHaptic: sendPlayerCommandHaptic,
  });
  runPlaybackPlayerPlayPauseCommand({
    isPlaying: true,
    pause: () => {
      playerCommandEvents.push(["pause"]);
    },
    resume: () => {
      playerCommandEvents.push(["resume"]);
    },
    sendHaptic: sendPlayerCommandHaptic,
  });
  runPlaybackPlayerPlayPauseCommand({
    isPlaying: false,
    pause: () => {
      playerCommandEvents.push(["pause"]);
    },
    resume: () => {
      playerCommandEvents.push(["resume"]);
    },
    sendHaptic: sendPlayerCommandHaptic,
  });
  assert.deepEqual(playerCommandEvents, [
    ["haptic", "light"],
    ["seek", 120_000],
    ["haptic", "light"],
    ["button-action"],
    ["haptic", "soft"],
    ["pause"],
    ["haptic", "light"],
    ["resume"],
  ]);
  const assembledPlayerCommandEvents: unknown[] = [];
  const assembledPlayerCommands = createPlaybackPlayerCommands({
    getState: () => ({
      duration: 120_000,
      isPlaying: true,
      position: 60_000,
    }),
    pause: () => assembledPlayerCommandEvents.push(["pause"]),
    resume: () => assembledPlayerCommandEvents.push(["resume"]),
    seekTo: (position) => assembledPlayerCommandEvents.push(["seek", position]),
    sendHaptic: (haptic) => {
      assembledPlayerCommandEvents.push(["haptic", haptic]);
    },
    skipNext: () => assembledPlayerCommandEvents.push(["skip-next"]),
    skipPrevious: () => assembledPlayerCommandEvents.push(["skip-previous"]),
    toggleLoop: () => assembledPlayerCommandEvents.push(["toggle-loop"]),
    toggleShuffle: () => assembledPlayerCommandEvents.push(["toggle-shuffle"]),
  });
  assembledPlayerCommands.rewind();
  assembledPlayerCommands.fastForward();
  assembledPlayerCommands.skipBack();
  assembledPlayerCommands.skipForward();
  assembledPlayerCommands.togglePlayPause();
  assembledPlayerCommands.toggleLoopMode();
  assembledPlayerCommands.toggleShuffleMode();
  assert.deepEqual(assembledPlayerCommandEvents, [
    ["haptic", "light"],
    ["seek", 45_000],
    ["haptic", "light"],
    ["seek", 75_000],
    ["haptic", "light"],
    ["skip-previous"],
    ["haptic", "light"],
    ["skip-next"],
    ["haptic", "soft"],
    ["pause"],
    ["haptic", "light"],
    ["toggle-loop"],
    ["haptic", "light"],
    ["toggle-shuffle"],
  ]);
  assert.deepEqual(
    getPlaybackPlayerActionState({
      activeTrack: null,
      state: initialPlaybackState,
    }),
    {
      adBreakActive: false,
      canEditActiveTrack: false,
      canFastForward: false,
      canOpenActiveTrackDetails: false,
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
      canEditActiveTrack: true,
      canFastForward: true,
      canOpenActiveTrackDetails: true,
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
      canEditActiveTrack: false,
      canFastForward: false,
      canOpenActiveTrackDetails: false,
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
        canEditActiveTrack: true,
        canFastForward: true,
        canOpenActiveTrackDetails: true,
        canPlayPause: true,
        canRewind: true,
        canSkipNext: true,
        canSkipPrevious: true,
        loopLabel: "Loop Off",
        playPauseLabel: "Pause",
        shuffleLabel: "Shuffle Off",
      },
      activeTrackDetailLink: {
        href: "/(tabs)/library/song/10",
        label: "Song details",
      },
      activeTrackEditLink: {
        href: "/(tabs)/library/song/edit/10",
        label: "Edit song",
      },
      adProgressPercent: 25,
      adBreakPanel: {
        action: {
          href: "/premium",
          label: "Open Premium",
        },
        body:
          "Free playback pauses after 10 minutes of listening. The ad will resume your song when it finishes, or you can open Premium for ad-free listening.",
        kicker: "Premium gate",
        progressLabel: "0:08 / 0:30",
        title: "Ad break required",
      },
      freeListeningRemainingMs: 480_000,
      progressPercent: 25,
      screenState: {
        header: {
          kicker: "Now Playing",
          subtitle:
            "Control playback, queue movement, shuffle, repeat, and free-listening ad breaks.",
          title: "Player",
        },
        queueLink: {
          href: "/queue",
          label: "Open queue",
        },
      },
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
    getPlaybackMiniPlayerViewState({
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
      miniPlayer: {
        blockedByAd: false,
        canTogglePlayback: true,
        isVisible: true,
        metaLabel: "Smoke Artist - -2:00",
        playLabel: "Play",
        title: "Mini Track",
      },
      playerHref: "/player",
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

async function assertImportSessionSmoke() {
  const first = importDraft(1);
  const second = importDraft(2);

  assert.deepEqual(
    beginImportFilePick({
      ...initialImportSessionState,
      error: "Old import failure",
    }),
    {
      ...initialImportSessionState,
      error: null,
      phase: "picking",
      source: "files",
    },
  );
  assert.deepEqual(
    beginImportWifiTransfer({
      state: {
        ...initialImportSessionState,
        selectedSongId: first.id,
        songs: [first],
      },
      total: 3,
    }),
    {
      ...initialImportSessionState,
      error: null,
      phase: "processing",
      progress: { current: 0, total: 3 },
      saveSummary: null,
      selectedSongId: null,
      songs: [],
      source: "wifi",
    },
  );
  assert.deepEqual(
    failImportSession({
      error: "Import step failure",
      state: initialImportSessionState,
    }),
    {
      ...initialImportSessionState,
      error: "Import step failure",
      phase: "failure",
    },
  );
  assert.deepEqual(
    reviewImportSongs({
      songs: [first, second],
      state: initialImportSessionState,
    }).progress,
    { current: 2, total: 2 },
  );
  assert.deepEqual(
    receiveImportWifiSong({
      song: first,
      state: receiveImportWifiSong({
        song: first,
        state: {
          ...initialImportSessionState,
          progress: { current: 0, total: 2 },
        },
      }),
    }).songs.map((song) => song.id),
    [first.id],
  );
  assert.deepEqual(
    removeImportSongs({
      songIds: [first.id],
      state: reviewImportSongs({
        songs: [first, second],
        state: initialImportSessionState,
      }),
    }).songs.map((song) => song.id),
    [second.id],
  );
  assert.equal(
    setImportSaveToLibrary({
      shouldSaveToLibrary: false,
      state: initialImportSessionState,
    }).shouldSaveToLibrary,
    false,
  );
  assert.equal(
    updateImportSong({
      song: { ...second, title: "Step Edited" },
      state: reviewImportSongs({
        songs: [first, second],
        state: initialImportSessionState,
      }),
    }).songs[1]?.title,
    "Step Edited",
  );
  assert.equal(
    startImportSessionSave({
      ...initialImportSessionState,
      shouldSaveToLibrary: false,
      songs: [first],
    }).phase,
    "discarding",
  );
  assert.deepEqual(
    finishImportSession({
      state: initialImportSessionState,
      summary: { discarded: 1, saved: 2, savedSongIds: [1, 2] },
    }).progress,
    { current: 3, total: 3 },
  );
  assert.equal(discardImportSession().phase, "idle");

  assert.equal(normalizePersistedImportSession(null), null);
  assert.equal(normalizePersistedImportSession({ songs: [] }), null);
  assert.deepEqual(
    normalizePersistedImportSession({
      selectedSongId: "missing",
      shouldSaveToLibrary: "yes",
      songs: [
        first,
        {
          id: "broken",
          title: "Broken",
        },
      ],
      source: "unknown",
    }),
    {
      selectedSongId: first.id,
      shouldSaveToLibrary: true,
      songs: [first],
      source: "files",
    },
  );

  let state = importSessionReducer(initialImportSessionState, {
    type: "begin-file-pick",
  });
  assert.equal(state.phase, "picking");
  assert.equal(state.source, "files");
  assert.equal(getImportHomeHref(), "/(tabs)/import");
  assert.equal(getImportFilesHref(), "/(tabs)/import/files");
  assert.equal(getImportSaveHref(), "/(tabs)/import/save");
  assert.equal(getImportExportHref(), "/(tabs)/import/export");
  assert.equal(getImportLibraryHref(), "/(tabs)/library");
  assert.equal(getImportPremiumHref(), "/premium");
  assert.deepEqual(getImportFilesActionState(state), {
    canChooseFiles: false,
    chooseLabel: "Choosing",
    isWorking: true,
  });
  assert.deepEqual(getImportFilesActionLinks(), [
    {
      href: "/(tabs)/import/save",
      label: "Review save",
    },
    {
      href: "/(tabs)/import",
      label: "Back to import",
    },
  ]);
  assert.deepEqual(getImportFilesViewState(state), {
    actionLinks: getImportFilesActionLinks(),
    actionState: getImportFilesActionState(state),
    songPreviewEmptyState: getImportSongPreviewEmptyState(),
    songPreviewListState: getImportSongPreviewListState({
      songs: state.songs,
    }),
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
      action: {
        href: "/premium",
        label: "Open Premium",
      },
      body: "Premium unlocks full batch import. Free imports save or export the first staged song.",
      canAccessImport: true,
      error: null,
      kicker: "Checking premium",
      title: "Free import available",
    },
  );
  assert.deepEqual(
    getImportPremiumGateState({
      active: false,
      error: "Premium check failed.",
      phase: "failure",
    }),
    {
      action: {
        href: "/premium",
        label: "Open Premium",
      },
      body: "Premium unlocks full batch import. Free imports save or export the first staged song.",
      canAccessImport: true,
      error: "Premium check failed.",
      kicker: "Premium import",
      title: "Free import available",
    },
  );
  assert.deepEqual(
    getImportPremiumGateState({
      active: true,
      error: null,
      phase: "ready",
    }),
    {
      action: {
        href: "/premium",
        label: "Open Premium",
      },
      body: "Premium unlocks full batch import. Free imports save or export the first staged song.",
      canAccessImport: true,
      error: null,
      kicker: "Premium import",
      title: "Premium import active",
    },
  );
  assert.deepEqual(getImportPremiumGateActionCommand(), {
    haptic: "light",
  });
  const importInteractionEvents: unknown[] = [];
  runImportPremiumGateAction({
    sendHaptic: (haptic) => {
      importInteractionEvents.push(["premium-gate", haptic]);
    },
  });
  runImportHomeRouteSelectAction({
    sendHaptic: (haptic) => {
      importInteractionEvents.push(["home-route", haptic]);
    },
  });
  assert.deepEqual(importInteractionEvents, [
    ["premium-gate", "light"],
    ["home-route", "light"],
  ]);
  assert.deepEqual(
    getImportSaveActionState({ isExporting: false, state }),
    {
      canDiscard: true,
      canExport: false,
      canFinish: false,
      canRemoveSongs: false,
      discardLabel: "Discard",
      exportLabel: "Export",
      finishLabel: "Finish",
      hasSongs: false,
      isWorking: false,
    },
  );
  assert.deepEqual(getImportSaveHeaderState(), {
    kicker: "Import review",
    subtitle: "Review staged songs before writing them to the library.",
    title: "Save",
  });
  assert.deepEqual(getImportSaveLibraryToggleState(), {
    label: "Save to library",
  });
  assert.deepEqual(getImportSaveBackLink(), {
    href: "/(tabs)/import/files",
    label: "Back to files",
  });
  assert.deepEqual(getImportSaveViewState({ isExporting: false, state }), {
    actionState: getImportSaveActionState({ isExporting: false, state }),
    backLink: getImportSaveBackLink(),
    headerState: getImportSaveHeaderState(),
    libraryToggleState: getImportSaveLibraryToggleState(),
    songPreviewEmptyState: getImportSongPreviewEmptyState(),
    songPreviewListState: getImportSongPreviewListState({
      songs: state.songs,
    }),
  });
  assert.deepEqual(
    getImportSaveToggleCommand({ shouldSaveToLibrary: false }),
    {
      haptic: "light",
      shouldSaveToLibrary: true,
    },
  );
  assert.deepEqual(
    getImportSaveToggleCommand({ shouldSaveToLibrary: true }),
    {
      haptic: "light",
      shouldSaveToLibrary: false,
    },
  );
  assert.equal(getImportSaveSessionStartHaptic(), "medium");
  assert.deepEqual(getImportFinishResultCommand(true), {
    haptic: "success",
    href: "/(tabs)/import/success",
  });
  assert.deepEqual(getImportFinishResultCommand(false), {
    haptic: "error",
    href: "/(tabs)/import/failure",
  });
  assert.deepEqual(getImportDiscardResultCommand(true), {
    haptic: "success",
    href: "/(tabs)/import",
  });
  assert.deepEqual(getImportDiscardResultCommand(false), {
    haptic: "error",
    href: "/(tabs)/import/failure",
  });
  const saveSessionActionEvents: unknown[] = [];
  const sendSaveSessionActionHaptic = (haptic: string) => {
    saveSessionActionEvents.push(["haptic", haptic]);
  };
  const navigateSaveSessionAction = (href: string) => {
    saveSessionActionEvents.push(["navigate", href]);
  };
  runImportSaveToggleAction({
    sendHaptic: sendSaveSessionActionHaptic,
    setShouldSaveToLibrary: (shouldSaveToLibrary) => {
      saveSessionActionEvents.push(["set-save", shouldSaveToLibrary]);
    },
    state: { shouldSaveToLibrary: false },
  });
  await runImportFinishAction({
    navigate: navigateSaveSessionAction,
    requestReviewIfEligible: async () => {
      saveSessionActionEvents.push(["review"]);
      return true;
    },
    saveImportSession: async () => true,
    sendHaptic: sendSaveSessionActionHaptic,
  });
  await runImportFinishAction({
    navigate: navigateSaveSessionAction,
    saveImportSession: async () => false,
    sendHaptic: sendSaveSessionActionHaptic,
  });
  await runImportDiscardAction({
    discardSession: async () => true,
    navigate: navigateSaveSessionAction,
    sendHaptic: sendSaveSessionActionHaptic,
  });
  await runImportDiscardAction({
    discardSession: async () => false,
    navigate: navigateSaveSessionAction,
    sendHaptic: sendSaveSessionActionHaptic,
  });
  assert.deepEqual(saveSessionActionEvents, [
    ["haptic", "light"],
    ["set-save", true],
    ["haptic", "medium"],
    ["review"],
    ["haptic", "success"],
    ["navigate", "/(tabs)/import/success"],
    ["haptic", "medium"],
    ["haptic", "error"],
    ["navigate", "/(tabs)/import/failure"],
    ["haptic", "medium"],
    ["haptic", "success"],
    ["navigate", "/(tabs)/import"],
    ["haptic", "medium"],
    ["haptic", "error"],
    ["navigate", "/(tabs)/import/failure"],
  ]);
  const saveSessionActionsEvents: unknown[] = [];
  const saveSessionActions = createImportSaveSessionActions({
    discardSession: async () => true,
    navigate: (href) => {
      saveSessionActionsEvents.push(["navigate", href]);
    },
    requestReviewIfEligible: async () => {
      saveSessionActionsEvents.push(["review"]);
      return true;
    },
    saveImportSession: async () => true,
    sendHaptic: (haptic) => {
      saveSessionActionsEvents.push(["haptic", haptic]);
    },
    setShouldSaveToLibrary: (shouldSaveToLibrary) => {
      saveSessionActionsEvents.push(["set-save", shouldSaveToLibrary]);
    },
    state: { shouldSaveToLibrary: true },
  });
  saveSessionActions.toggleShouldSaveToLibrary();
  await saveSessionActions.finishImport();
  await saveSessionActions.discardImport();
  assert.deepEqual(saveSessionActionsEvents, [
    ["haptic", "light"],
    ["set-save", false],
    ["haptic", "medium"],
    ["review"],
    ["haptic", "success"],
    ["navigate", "/(tabs)/import/success"],
    ["haptic", "medium"],
    ["haptic", "success"],
    ["navigate", "/(tabs)/import"],
  ]);
  assert.deepEqual(normalizeImportReviewRequestState(null), {
    importCount: 0,
    reviewAlreadyRequested: false,
  });
  assert.deepEqual(
    normalizeImportReviewRequestState({
      importCount: 1.8,
      reviewAlreadyRequested: true,
    }),
    {
      importCount: 1,
      reviewAlreadyRequested: true,
    },
  );
  assert.deepEqual(
    getImportReviewRequestAttemptState({
      options: { premiumActive: true, showReviewAfter: 3 },
      state: { importCount: 0, reviewAlreadyRequested: false },
    }),
    {
      nextState: { importCount: 0, reviewAlreadyRequested: false },
      shouldRequest: true,
    },
  );
  assert.deepEqual(
    getImportReviewRequestAttemptState({
      options: { premiumActive: false, showReviewAfter: 3 },
      state: { importCount: 1, reviewAlreadyRequested: false },
    }),
    {
      nextState: { importCount: 2, reviewAlreadyRequested: false },
      shouldRequest: false,
    },
  );
  const importReviewCalls: unknown[] = [];
  let importReviewState: ImportReviewRequestState = {
    importCount: 2,
    reviewAlreadyRequested: false,
  };
  await requestImportReviewIfEligibleWithDependencies({
    dependencies: {
      isReviewAvailable: async () => {
        importReviewCalls.push("available");
        return true;
      },
      loadState: async () => importReviewState,
      requestReview: async () => {
        importReviewCalls.push("request");
      },
      saveState: async (state) => {
        importReviewCalls.push(["save", state]);
        importReviewState = state;
      },
    },
    options: { premiumActive: false, showReviewAfter: 3 },
  });
  assert.deepEqual(importReviewCalls, [
    "available",
    "request",
    [
      "save",
      {
        importCount: 3,
        reviewAlreadyRequested: true,
      },
    ],
  ]);
  assert.deepEqual(getImportSongPreviewEmptyState(), {
    body: "Choose songs to review them before saving.",
    title: "No songs staged",
  });
  assert.deepEqual(
    getImportSongPreviewListState({
      songs: [
        {
          album: "Smoke Album",
          artist: "Smoke Artist",
          artwork: null,
          cacheUri: "file:///tmp/smoke.mp3",
          duration: 65_000,
          fileName: "smoke.mp3",
          fileType: "audio/mpeg",
          id: 5,
          title: "Smoke Song",
          track: null,
        },
      ],
    }),
    {
      emptyState: {
        body: "Choose songs to review them before saving.",
        title: "No songs staged",
      },
      rows: [
        {
          editHref: "/import/edit/5",
          song: {
            album: "Smoke Album",
            artist: "Smoke Artist",
            artwork: null,
            cacheUri: "file:///tmp/smoke.mp3",
            duration: 65_000,
            fileName: "smoke.mp3",
            fileType: "audio/mpeg",
            id: 5,
            title: "Smoke Song",
            track: null,
          },
        },
      ],
    },
  );
  assert.deepEqual(getImportHomeRouteSelectCommand(), {
    haptic: "light",
  });
  assert.deepEqual(
    getImportHomeState({ premiumActive: false, state }).routes.map((route) => ({
      href: route.href,
      label: route.label,
      metaLabel: route.metaLabel,
    })),
    [
      { href: "/(tabs)/import/files", label: "Files", metaLabel: "Free" },
      { href: "/(tabs)/import/wifi", label: "Wi-Fi", metaLabel: "Free" },
      { href: "/(tabs)/import/save", label: "Save", metaLabel: "First song" },
    ],
  );

  state = importSessionReducer(state, {
    songs: [first, second],
    type: "review",
  });
  assert.equal(state.phase, "reviewing");
  assert.equal(state.selectedSongId, first.id);
  assert.deepEqual(state.progress, { current: 2, total: 2 });
  assert.deepEqual(toPersistedImportSession(state), {
    selectedSongId: first.id,
    shouldSaveToLibrary: true,
    songs: [first, second],
    source: "files",
  });
  assert.deepEqual(getImportFilesActionState(state), {
    canChooseFiles: true,
    chooseLabel: "Choose songs",
    isWorking: false,
  });
  assert.equal(getImportFileSelectionStartHaptic(), "light");
  assert.deepEqual(getImportFileSelectionResultCommand(true), {
    haptic: "success",
    href: "/(tabs)/import/save",
  });
  assert.deepEqual(getImportFileSelectionResultCommand(false), {
    haptic: "error",
    href: "/(tabs)/import/failure",
  });
  assert.equal(getImportFileRemovalStartHaptic(), "medium");
  assert.deepEqual(getImportFileRemovalResultCommand(true), {
    haptic: "success",
  });
  assert.deepEqual(getImportFileRemovalResultCommand(false), {
    haptic: "error",
  });
  const importFilesActionEvents: unknown[] = [];
  const sendImportFilesActionHaptic = (haptic: string) => {
    importFilesActionEvents.push(["haptic", haptic]);
  };
  const navigateImportFilesAction = (href: string) => {
    importFilesActionEvents.push(["navigate", href]);
  };
  await runImportFilesChooseAction({
    navigate: navigateImportFilesAction,
    sendHaptic: sendImportFilesActionHaptic,
    startFileImport: async () => true,
  });
  await runImportFilesChooseAction({
    navigate: navigateImportFilesAction,
    sendHaptic: sendImportFilesActionHaptic,
    startFileImport: async () => false,
  });
  await runImportFilesRemoveAction({
    removeImportSongs: async (songIds) => {
      importFilesActionEvents.push(["remove", songIds]);
      return true;
    },
    sendHaptic: sendImportFilesActionHaptic,
    songId: first.id,
  });
  await runImportFilesRemoveAction({
    removeImportSongs: async (songIds) => {
      importFilesActionEvents.push(["remove", songIds]);
      return false;
    },
    sendHaptic: sendImportFilesActionHaptic,
    songId: second.id,
  });
  const importFilesActions = createImportFilesControllerActions({
    navigate: navigateImportFilesAction,
    removeImportSongs: async (songIds) => {
      importFilesActionEvents.push(["controller-remove", songIds]);
      return true;
    },
    sendHaptic: sendImportFilesActionHaptic,
    startFileImport: async () => true,
  });
  await importFilesActions.chooseFiles();
  await importFilesActions.removeSong(first.id);
  await runImportSaveRemoveSongAction({
    canRemoveSongs: false,
    removeImportSongs: async (songIds) => {
      importFilesActionEvents.push(["guarded-remove", songIds]);
      return true;
    },
    sendHaptic: sendImportFilesActionHaptic,
    songId: first.id,
  });
  await runImportSaveRemoveSongAction({
    canRemoveSongs: true,
    removeImportSongs: async (songIds) => {
      importFilesActionEvents.push(["guarded-remove", songIds]);
      return true;
    },
    sendHaptic: sendImportFilesActionHaptic,
    songId: second.id,
  });
  const saveControllerActions = createImportSaveControllerActions({
    canRemoveSongs: true,
    removeImportSongs: async (songIds) => {
      importFilesActionEvents.push(["save-controller-remove", songIds]);
      return true;
    },
    sendHaptic: sendImportFilesActionHaptic,
  });
  await saveControllerActions.removeSong(first.id);
  assert.deepEqual(importFilesActionEvents, [
    ["haptic", "light"],
    ["haptic", "success"],
    ["navigate", "/(tabs)/import/save"],
    ["haptic", "light"],
    ["haptic", "error"],
    ["navigate", "/(tabs)/import/failure"],
    ["haptic", "medium"],
    ["remove", [first.id]],
    ["haptic", "success"],
    ["haptic", "medium"],
    ["remove", [second.id]],
    ["haptic", "error"],
    ["haptic", "light"],
    ["haptic", "success"],
    ["navigate", "/(tabs)/import/save"],
    ["haptic", "medium"],
    ["controller-remove", [first.id]],
    ["haptic", "success"],
    ["haptic", "medium"],
    ["guarded-remove", [second.id]],
    ["haptic", "success"],
    ["haptic", "medium"],
    ["save-controller-remove", [first.id]],
    ["haptic", "success"],
  ]);
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
  const fileCommandEvents: unknown[] = [];
  const recordFileCommandEvent = (event: unknown) => {
    fileCommandEvents.push(event);
  };
  const dispatchFileCommand = (action: unknown) => {
    recordFileCommandEvent(["dispatch", action]);
  };
  assert.equal(
    await runImportFileSelectionCommand({
      dependencies: {
        deleteImportDraftCacheFiles: async () => undefined,
        selectImportFiles: async () => ({
          drafts: [importDraft(91)],
          skipped: 0,
        }),
      },
      dispatch: dispatchFileCommand,
    }),
    true,
  );
  assert.deepEqual(fileCommandEvents, [
    ["dispatch", { type: "begin-file-pick" }],
    ["dispatch", { songs: [importDraft(91)], type: "review" }],
  ]);
  fileCommandEvents.length = 0;
  assert.equal(
    await runImportFileSelectionCommand({
      dependencies: {
        deleteImportDraftCacheFiles: async () => undefined,
        selectImportFiles: async () => ({
          drafts: [],
          skipped: 2,
        }),
      },
      dispatch: dispatchFileCommand,
    }),
    false,
  );
  assert.deepEqual(fileCommandEvents, [
    ["dispatch", { type: "begin-file-pick" }],
    [
      "dispatch",
      {
        error: "No selected songs could be staged for import.",
        type: "fail",
      },
    ],
  ]);
  fileCommandEvents.length = 0;
  assert.equal(
    await runImportFileSelectionCommand({
      dependencies: {
        deleteImportDraftCacheFiles: async () => undefined,
        selectImportFiles: async () => {
          throw new Error("picker failed");
        },
      },
      dispatch: dispatchFileCommand,
    }),
    false,
  );
  assert.deepEqual(fileCommandEvents, [
    ["dispatch", { type: "begin-file-pick" }],
    ["dispatch", { error: "picker failed", type: "fail" }],
  ]);
  fileCommandEvents.length = 0;
  assert.equal(
    await runImportFileRemovalCommand({
      dependencies: {
        deleteImportDraftCacheFiles: async (removedSongs) => {
          recordFileCommandEvent([
            "delete-cache",
            removedSongs.map((song) => song.id),
          ]);
        },
        selectImportFiles: async () => ({ drafts: [], skipped: 0 }),
      },
      dispatch: dispatchFileCommand,
      songIds: [first.id],
      songs: [first, second],
    }),
    true,
  );
  assert.deepEqual(fileCommandEvents, [
    ["delete-cache", [first.id]],
    ["dispatch", { songIds: [first.id], type: "remove-songs" }],
  ]);
  fileCommandEvents.length = 0;
  assert.equal(
    await runImportFileRemovalCommand({
      dependencies: {
        deleteImportDraftCacheFiles: async () => {
          throw new Error("delete failed");
        },
        selectImportFiles: async () => ({ drafts: [], skipped: 0 }),
      },
      dispatch: dispatchFileCommand,
      songIds: [second.id],
      songs: [first, second],
    }),
    false,
  );
  assert.deepEqual(fileCommandEvents, [
    ["dispatch", { error: "delete failed", type: "fail" }],
  ]);
  fileCommandEvents.length = 0;
  const importFileCommands = createImportFileCommands({
    dependencies: {
      deleteImportDraftCacheFiles: async (removedSongs) => {
        recordFileCommandEvent([
          "delete-cache",
          removedSongs.map((song) => song.id),
        ]);
      },
      selectImportFiles: async () => ({
        drafts: [importDraft(95)],
        skipped: 0,
      }),
    },
    dispatch: dispatchFileCommand,
    songs: [first, second],
  });
  assert.equal(await importFileCommands.startFileImport(), true);
  assert.equal(await importFileCommands.removeImportSongs([second.id]), true);
  assert.deepEqual(fileCommandEvents, [
    ["dispatch", { type: "begin-file-pick" }],
    ["dispatch", { songs: [importDraft(95)], type: "review" }],
    ["delete-cache", [second.id]],
    ["dispatch", { songIds: [second.id], type: "remove-songs" }],
  ]);
  assert.deepEqual(
    getImportSaveActionState({ isExporting: false, state }),
    {
      canDiscard: true,
      canExport: true,
      canFinish: true,
      canRemoveSongs: true,
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
      canRemoveSongs: false,
      discardLabel: "Discard",
      exportLabel: "Exporting",
      finishLabel: "Finishing",
      hasSongs: true,
      isWorking: true,
    },
  );
  assert.deepEqual(
    getPremiumScopedImportSongs({
      premiumActive: false,
      songs: [first, second],
    }),
    [first],
  );
  assert.deepEqual(
    getPremiumScopedImportSongs({
      premiumActive: true,
      songs: [first, second],
    }),
    [first, second],
  );
  const lifecycleSummary = {
    discarded: 0,
    saved: 2,
    savedSongIds: [first.id, second.id],
  };
  const lifecycleCalls: string[] = [];
  const lifecycleDependencies = {
    clearImportCache: async () => {
      lifecycleCalls.push("clear-cache");
    },
    clearPersistedImportSessionState: async () => {
      lifecycleCalls.push("clear-persisted");
    },
    discardImportSession: async (songs: ImportSongDraft[]) => {
      lifecycleCalls.push(`discard-${songs.length}`);
      return {
        discarded: songs.length,
        saved: 0,
        savedSongIds: [],
      };
    },
    saveImportSessionToLibrary: async (songs: ImportSongDraft[]) => {
      lifecycleCalls.push(`save-${songs.length}`);
      return lifecycleSummary;
    },
  };

  assert.deepEqual(getFinishImportSessionAction(lifecycleSummary), {
    summary: lifecycleSummary,
    type: "finish",
  });
  assert.deepEqual(getSavingImportSessionAction(), { type: "saving" });
  assert.deepEqual(
    await saveImportSessionLifecycle(
      {
        premiumActive: true,
        shouldSaveToLibrary: true,
        songs: [first, second],
      },
      lifecycleDependencies,
    ),
    {
      action: {
        summary: lifecycleSummary,
        type: "finish",
      },
      succeeded: true,
    },
  );
  assert.deepEqual(lifecycleCalls, ["save-2", "clear-persisted"]);
  lifecycleCalls.length = 0;
  assert.deepEqual(
    await saveImportSessionLifecycle(
      {
        premiumActive: false,
        shouldSaveToLibrary: true,
        songs: [first, second],
      },
      lifecycleDependencies,
    ),
    {
      action: {
        summary: lifecycleSummary,
        type: "finish",
      },
      succeeded: true,
    },
  );
  assert.deepEqual(lifecycleCalls, ["save-1", "clear-persisted"]);
  lifecycleCalls.length = 0;
  assert.deepEqual(
    await saveImportSessionLifecycle(
      {
        premiumActive: false,
        shouldSaveToLibrary: false,
        songs: [first],
      },
      lifecycleDependencies,
    ),
    {
      action: {
        summary: {
          discarded: 1,
          saved: 0,
          savedSongIds: [],
        },
        type: "finish",
      },
      succeeded: true,
    },
  );
  assert.deepEqual(lifecycleCalls, ["discard-1", "clear-persisted"]);
  lifecycleCalls.length = 0;
  assert.deepEqual(
    await discardImportSessionLifecycle(lifecycleDependencies),
    {
      action: { type: "discard" },
      succeeded: true,
    },
  );
  assert.deepEqual(lifecycleCalls, ["clear-cache", "clear-persisted"]);
  lifecycleCalls.length = 0;
  assert.deepEqual(resetImportSessionLifecycle(lifecycleDependencies), {
    type: "reset",
  });
  await Promise.resolve();
  assert.deepEqual(lifecycleCalls, ["clear-cache", "clear-persisted"]);

  const failingLifecycleDependencies = {
    ...lifecycleDependencies,
    clearImportCache: async () => {
      throw new Error("Cache clear failed.");
    },
    saveImportSessionToLibrary: async () => {
      throw new Error("Library save failed.");
    },
  };
  assert.deepEqual(
    await saveImportSessionLifecycle(
      {
        premiumActive: true,
        shouldSaveToLibrary: true,
        songs: [first],
      },
      failingLifecycleDependencies,
    ),
    {
      action: {
        error: "Library save failed.",
        type: "fail",
      },
      succeeded: false,
    },
  );
  assert.deepEqual(
    await discardImportSessionLifecycle(failingLifecycleDependencies),
    {
      action: {
        error: "Cache clear failed.",
        type: "fail",
      },
      succeeded: false,
    },
  );
  const lifecycleCommandEvents: unknown[] = [];
  const dispatchLifecycleCommand = (action: unknown) => {
    lifecycleCommandEvents.push(["dispatch", action]);
  };
  runFinishImportSessionCommand({
    dispatch: dispatchLifecycleCommand,
    summary: lifecycleSummary,
  });
  assert.equal(
    await runSaveImportSessionCommand({
      dependencies: lifecycleDependencies,
      dispatch: dispatchLifecycleCommand,
      premiumActive: true,
      shouldSaveToLibrary: true,
      songs: [first, second],
    }),
    true,
  );
  assert.deepEqual(lifecycleCommandEvents, [
    ["dispatch", { summary: lifecycleSummary, type: "finish" }],
    ["dispatch", { type: "saving" }],
    ["dispatch", { summary: lifecycleSummary, type: "finish" }],
  ]);
  lifecycleCommandEvents.length = 0;
  assert.equal(
    await runSaveImportSessionCommand({
      dependencies: failingLifecycleDependencies,
      dispatch: dispatchLifecycleCommand,
      premiumActive: true,
      shouldSaveToLibrary: true,
      songs: [first],
    }),
    false,
  );
  assert.deepEqual(lifecycleCommandEvents, [
    ["dispatch", { type: "saving" }],
    ["dispatch", { error: "Library save failed.", type: "fail" }],
  ]);
  lifecycleCommandEvents.length = 0;
  assert.equal(
    await runDiscardImportSessionCommand({
      dependencies: lifecycleDependencies,
      dispatch: dispatchLifecycleCommand,
    }),
    true,
  );
  assert.deepEqual(lifecycleCommandEvents, [
    ["dispatch", { type: "saving" }],
    ["dispatch", { type: "discard" }],
  ]);
  lifecycleCommandEvents.length = 0;
  runResetImportSessionCommand({
    dependencies: lifecycleDependencies,
    dispatch: dispatchLifecycleCommand,
  });
  await Promise.resolve();
  assert.deepEqual(lifecycleCommandEvents, [["dispatch", { type: "reset" }]]);
  lifecycleCommandEvents.length = 0;
  const importSessionLifecycleCommands = createImportSessionLifecycleCommands({
    dependencies: lifecycleDependencies,
    dispatch: dispatchLifecycleCommand,
    premiumActive: true,
    shouldSaveToLibrary: true,
    songs: [first, second],
  });
  importSessionLifecycleCommands.finishSession(lifecycleSummary);
  assert.equal(await importSessionLifecycleCommands.saveImportSession(), true);
  assert.equal(await importSessionLifecycleCommands.discardSession(), true);
  importSessionLifecycleCommands.resetSession();
  await Promise.resolve();
  assert.deepEqual(lifecycleCommandEvents, [
    ["dispatch", { summary: lifecycleSummary, type: "finish" }],
    ["dispatch", { type: "saving" }],
    ["dispatch", { summary: lifecycleSummary, type: "finish" }],
    ["dispatch", { type: "saving" }],
    ["dispatch", { type: "discard" }],
    ["dispatch", { type: "reset" }],
  ]);
  assert.deepEqual(initialImportSaveExportState, {
    error: null,
    isExporting: false,
  });
  assert.deepEqual(getImportSaveExportBeginAction(), { type: "begin" });
  assert.deepEqual(getImportSaveExportFinishAction(), { type: "finish" });
  assert.deepEqual(
    importSaveExportReducer(
      initialImportSaveExportState,
      getImportSaveExportBeginAction(),
    ),
    {
      error: null,
      isExporting: true,
    },
  );
  assert.deepEqual(
    importSaveExportReducer(
      {
        error: null,
        isExporting: true,
      },
      getImportSaveExportFinishAction(),
    ),
    initialImportSaveExportState,
  );
  assert.deepEqual(
    importSaveExportReducer(initialImportSaveExportState, {
      error: "Staged songs could not be exported.",
      type: "fail",
    }),
    {
      error: "Staged songs could not be exported.",
      isExporting: false,
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
  assert.deepEqual(getImportSaveExportSuccessCommand(), {
    haptic: "success",
  });
  assert.deepEqual(
    getImportSaveExportFailureCommand(new Error("Export smoke failure")),
    {
      action: {
        error: "Export smoke failure",
        type: "fail",
      },
      haptic: "error",
    },
  );
  const importSaveExportActionEvents: unknown[] = [];
  await runImportSaveExportAction({
    dispatch: (action) => {
      importSaveExportActionEvents.push(["dispatch", action]);
    },
    premiumActive: false,
    sendHaptic: (haptic) => {
      importSaveExportActionEvents.push(["haptic", haptic]);
    },
    shareImportDraftSongs: async (songs) => {
      importSaveExportActionEvents.push(["share", songs.length]);
    },
    state,
  });
  await runImportSaveExportAction({
    dispatch: (action) => {
      importSaveExportActionEvents.push(["dispatch", action]);
    },
    premiumActive: true,
    sendHaptic: (haptic) => {
      importSaveExportActionEvents.push(["haptic", haptic]);
    },
    shareImportDraftSongs: async () => {
      throw new Error("Share failed");
    },
    state,
  });
  assert.deepEqual(importSaveExportActionEvents, [
    ["dispatch", { type: "begin" }],
    ["share", 1],
    ["haptic", "success"],
    ["dispatch", { type: "finish" }],
    ["dispatch", { type: "begin" }],
    ["haptic", "error"],
    ["dispatch", { error: "Share failed", type: "fail" }],
    ["dispatch", { type: "finish" }],
  ]);
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
    getImportSuccessViewState({
      ...state,
      phase: "success",
      progress: { current: 3, total: 4 },
      saveSummary: { discarded: 1, saved: 2, savedSongIds: [1, 2] },
      shouldSaveToLibrary: true,
    }),
    {
      backHref: "/(tabs)/library",
      backLabel: "Open Library",
      kicker: "Import complete",
      panelHint: "Saved songs are ready in Library.",
      panelLabel: "Library save",
      panelText: "2 saved to library",
      subtitle: "3 of 4 songs processed.",
      title: "Success",
      tone: "accent",
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
    getImportFailureViewState({
      ...state,
      error: "Import smoke failure",
      phase: "failure",
    }),
    {
      backHref: "/(tabs)/import/files",
      backLabel: "Back to files",
      kicker: "Import stopped",
      panelLabel: "Phase",
      panelText: "failure",
      subtitle: "Import smoke failure",
      title: "Failure",
      tone: "danger",
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
  assert.deepEqual(getBeginFilePickAction(), {
    type: "begin-file-pick",
  });
  assert.deepEqual(getBeginWifiTransferAction(3), {
    total: 3,
    type: "begin-wifi-transfer",
  });
  assert.deepEqual(getFailImportSessionAction("Nope"), {
    error: "Nope",
    type: "fail",
  });
  assert.deepEqual(getReviewImportSongsAction([importDraft(88)]), {
    songs: [importDraft(88)],
    type: "review",
  });
  assert.deepEqual(getReceiveWifiSongAction(importDraft(89)), {
    song: importDraft(89),
    type: "receive-wifi-song",
  });
  assert.deepEqual(getRemoveImportSongsAction([1, 2]), {
    songIds: [1, 2],
    type: "remove-songs",
  });
  assert.deepEqual(getSetImportSaveToLibraryAction(false), {
    shouldSaveToLibrary: false,
    type: "set-save-to-library",
  });
  assert.deepEqual(getUpdateImportSongAction(importDraft(90)), {
    song: importDraft(90),
    type: "update-song",
  });
  const importSessionCommandEvents: string[] = [];
  const dispatchImportSessionCommand = (action: ImportSessionAction) => {
    importSessionCommandEvents.push(action.type);
  };
  runBeginImportFilePickCommand({
    dispatch: dispatchImportSessionCommand,
  });
  runFailImportSessionCommand({
    dispatch: dispatchImportSessionCommand,
    error: "Nope",
  });
  runReviewImportSongsCommand({
    dispatch: dispatchImportSessionCommand,
    songs: [importDraft(91)],
  });
  runSetImportSaveToLibraryCommand({
    dispatch: dispatchImportSessionCommand,
    shouldSaveToLibrary: true,
  });
  runUpdateImportSongCommand({
    dispatch: dispatchImportSessionCommand,
    song: importDraft(92),
  });
  assert.deepEqual(importSessionCommandEvents, [
    "begin-file-pick",
    "fail",
    "review",
    "set-save-to-library",
    "update-song",
  ]);
  importSessionCommandEvents.length = 0;
  const importSessionBasicCommands = createImportSessionBasicCommands({
    dispatch: dispatchImportSessionCommand,
  });
  importSessionBasicCommands.beginFilePick();
  importSessionBasicCommands.failSession("Nope");
  importSessionBasicCommands.reviewSongs([importDraft(93)]);
  importSessionBasicCommands.setShouldSaveToLibrary(false);
  importSessionBasicCommands.updateImportSong(importDraft(94));
  assert.deepEqual(importSessionCommandEvents, [
    "begin-file-pick",
    "fail",
    "review",
    "set-save-to-library",
    "update-song",
  ]);
  const composedImportSessionCommands = createImportSessionCommands({
    basicCommands: {
      beginFilePick: () => "begin",
      failSession: () => "fail",
      reviewSongs: () => "review",
      setShouldSaveToLibrary: () => "save-toggle",
      updateImportSong: () => "update",
    },
    fileCommands: {
      removeImportSongs: async () => true,
      startFileImport: async () => false,
    },
    lifecycleCommands: {
      discardSession: async () => false,
      finishSession: () => "finish",
      resetSession: () => "reset",
      saveImportSession: async () => true,
    },
    wifiCommands: {
      beginWifiTransfer: async () => true,
      finishWifiTransfer: () => "finish-wifi",
      receiveWifiSong: () => "receive-wifi",
    },
  });
  assert.equal(composedImportSessionCommands.beginFilePick(), "begin");
  assert.equal(await composedImportSessionCommands.startFileImport(), false);
  assert.equal(await composedImportSessionCommands.saveImportSession(), true);
  assert.equal(
    await composedImportSessionCommands.beginWifiTransfer(2),
    true,
  );
  const importSessionPersistenceEvents: unknown[] = [];
  const dispatchImportSessionPersistenceCommand = (
    action: ImportSessionAction,
  ) => {
    importSessionPersistenceEvents.push(["dispatch", action]);
  };
  const persistedImportSession = {
    ...initialImportSessionState,
    phase: "reviewing" as const,
    songs: [importDraft(93)],
  };
  assert.deepEqual(getHydrateImportSessionAction(persistedImportSession), {
    state: persistedImportSession,
    type: "hydrate",
  });
  await runImportSessionHydrateCommand({
    dispatch: dispatchImportSessionPersistenceCommand,
    isCurrent: () => true,
    loadPersistedImportSessionState: async () => persistedImportSession,
  });
  await runImportSessionHydrateCommand({
    dispatch: dispatchImportSessionPersistenceCommand,
    isCurrent: () => true,
    loadPersistedImportSessionState: async () => null,
  });
  await runImportSessionHydrateCommand({
    dispatch: dispatchImportSessionPersistenceCommand,
    isCurrent: () => false,
    loadPersistedImportSessionState: async () => persistedImportSession,
  });
  await runImportSessionPersistenceCommand({
    clearPersistedImportSessionState: async () => {
      importSessionPersistenceEvents.push(["clear"]);
    },
    savePersistedImportSessionState: async (state) => {
      importSessionPersistenceEvents.push(["save", state.phase]);
    },
    state: persistedImportSession,
  });
  await runImportSessionPersistenceCommand({
    clearPersistedImportSessionState: async () => {
      importSessionPersistenceEvents.push(["clear"]);
    },
    savePersistedImportSessionState: async (state) => {
      importSessionPersistenceEvents.push(["save", state.phase]);
    },
    state: initialImportSessionState,
  });
  await runImportSessionPersistenceCommand({
    clearPersistedImportSessionState: async () => {
      importSessionPersistenceEvents.push(["unexpected-clear"]);
    },
    savePersistedImportSessionState: async (state) => {
      importSessionPersistenceEvents.push(["unexpected-save", state.phase]);
    },
    state: {
      ...initialImportSessionState,
      phase: "success",
      songs: [importDraft(94)],
    },
  });
  assert.deepEqual(importSessionPersistenceEvents, [
    ["dispatch", { state: persistedImportSession, type: "hydrate" }],
    ["save", "reviewing"],
    ["clear"],
  ]);
  const importSessionWifiCommandEvents: unknown[] = [];
  const dispatchImportSessionWifiCommand = (action: ImportSessionAction) => {
    importSessionWifiCommandEvents.push([
      action.type,
      "error" in action ? action.error : null,
    ]);
  };
  assert.equal(
    await runBeginWifiTransferCommand({
      dispatch: dispatchImportSessionWifiCommand,
      prepareWifiImportCache: async () => {},
      total: 4,
    }),
    true,
  );
  assert.equal(
    await runBeginWifiTransferCommand({
      dispatch: dispatchImportSessionWifiCommand,
      prepareWifiImportCache: async () => {
        throw new Error("Cache failed");
      },
      total: 5,
    }),
    false,
  );
  runReceiveWifiSongCommand({
    dispatch: dispatchImportSessionWifiCommand,
    song: importDraft(93),
  });
  runFinishWifiTransferCommand({
    dispatch: dispatchImportSessionWifiCommand,
    songs: [importDraft(94)],
  });
  runFinishWifiTransferCommand({
    dispatch: dispatchImportSessionWifiCommand,
    songs: [],
  });
  assert.deepEqual(importSessionWifiCommandEvents, [
    ["begin-wifi-transfer", null],
    ["fail", "Cache failed"],
    ["receive-wifi-song", null],
    ["review", null],
    ["fail", "No Wi-Fi songs were received."],
  ]);
  importSessionWifiCommandEvents.length = 0;
  const importSessionWifiCommands = createImportSessionWifiCommands({
    dispatch: dispatchImportSessionWifiCommand,
    prepareWifiImportCache: async () => {},
    songs: [importDraft(95)],
  });
  assert.equal(await importSessionWifiCommands.beginWifiTransfer(2), true);
  importSessionWifiCommands.receiveWifiSong(importDraft(96));
  importSessionWifiCommands.finishWifiTransfer();
  assert.deepEqual(importSessionWifiCommandEvents, [
    ["begin-wifi-transfer", null],
    ["receive-wifi-song", null],
    ["review", null],
  ]);
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
      canRemoveSongs: false,
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
  assert.deepEqual(getImportWifiActionState(), {
    backLink: {
      href: "/(tabs)/import",
      label: "Back to import",
    },
    reviewSave: {
      href: "/(tabs)/import/save",
      label: "Review save",
    },
  });
  assert.deepEqual(
    getImportWifiViewState({
      error: null,
      isReady: true,
      state,
    }),
    {
      actionState: getImportWifiActionState(),
      songPreviewEmptyState: getImportSongPreviewEmptyState(),
      songPreviewListState: getImportSongPreviewListState({
        songs: state.songs,
      }),
      wifiState: getImportWifiState({
        error: null,
        isReady: true,
        state,
      }),
    },
  );
  assert.equal(getImportWifiReviewSaveHaptic(), "light");
  const importWifiActionEvents: unknown[] = [];
  runImportWifiReviewSaveAction({
    sendHaptic: (haptic) => {
      importWifiActionEvents.push(["haptic", haptic]);
    },
  });
  await runImportWifiRemoveSongAction({
    canRemoveSongs: false,
    removeImportSongs: async (songIds) => {
      importWifiActionEvents.push(["remove", songIds]);
      return true;
    },
    sendHaptic: (haptic) => {
      importWifiActionEvents.push(["haptic", haptic]);
    },
    songId: 41,
  });
  await runImportWifiRemoveSongAction({
    canRemoveSongs: true,
    removeImportSongs: async (songIds) => {
      importWifiActionEvents.push(["remove", songIds]);
      return true;
    },
    sendHaptic: (haptic) => {
      importWifiActionEvents.push(["haptic", haptic]);
    },
    songId: 42,
  });
  const importWifiActions = createImportWifiControllerActions({
    canRemoveSongs: true,
    removeImportSongs: async (songIds) => {
      importWifiActionEvents.push(["controller-remove", songIds]);
      return true;
    },
    sendHaptic: (haptic) => {
      importWifiActionEvents.push(["haptic", haptic]);
    },
  });
  importWifiActions.reviewSave();
  await importWifiActions.removeSong(43);
  assert.deepEqual(importWifiActionEvents, [
    ["haptic", "light"],
    ["haptic", "medium"],
    ["remove", [42]],
    ["haptic", "success"],
    ["haptic", "light"],
    ["haptic", "medium"],
    ["controller-remove", [43]],
    ["haptic", "success"],
  ]);
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

async function assertWifiImportRequestSmoke() {
  let serverState = wifiImportServerReducer(initialWifiImportServerState, {
    ipAddress: "192.168.1.4",
    type: "resolve-address",
  });
  assert.deepEqual(serverState, {
    error: null,
    ipAddress: "192.168.1.4",
    isReady: false,
    port: null,
  });
  assert.equal(getWifiImportServerAddress(serverState), "");

  serverState = wifiImportServerReducer(serverState, {
    port: 3002,
    type: "start",
  });
  assert.deepEqual(serverState, {
    error: null,
    ipAddress: "192.168.1.4",
    isReady: true,
    port: 3002,
  });
  assert.equal(
    getWifiImportServerAddress(serverState),
    "http://192.168.1.4:3002",
  );
  assert.deepEqual(getWifiImportServerStopAction(), { type: "stop" });

  assert.deepEqual(
    wifiImportServerReducer(serverState, getWifiImportServerStopAction()),
    {
      error: null,
      ipAddress: "192.168.1.4",
      isReady: false,
      port: null,
    },
  );
  assert.deepEqual(
    wifiImportServerReducer(serverState, {
      error: "Port busy",
      type: "fail",
    }),
    {
      error: "Port busy",
      ipAddress: "192.168.1.4",
      isReady: false,
      port: null,
    },
  );
  assert.deepEqual(wifiImportServerReducer(serverState, { type: "clear-address" }), {
    error: null,
    ipAddress: "",
    isReady: true,
    port: 3002,
  });
  assert.deepEqual(
    await resolveWifiImportServerAddressAction({
      getIpAddress: async () => "10.0.0.7",
    }),
    {
      ipAddress: "10.0.0.7",
      type: "resolve-address",
    },
  );
  assert.deepEqual(
    await resolveWifiImportServerAddressAction({
      getIpAddress: async () => {
        throw new Error("offline");
      },
    }),
    { type: "clear-address" },
  );
  const addressLoadEvents: unknown[] = [];
  await runWifiImportServerAddressLoadCommand({
    dispatch: (action) => {
      addressLoadEvents.push(action);
    },
    getIpAddress: async () => "10.0.0.8",
    isActive: () => true,
  });
  await runWifiImportServerAddressLoadCommand({
    dispatch: (action) => {
      addressLoadEvents.push(action);
    },
    getIpAddress: async () => "10.0.0.9",
    isActive: () => false,
  });
  assert.deepEqual(addressLoadEvents, [
    { ipAddress: "10.0.0.8", type: "resolve-address" },
  ]);
  const emptyWifiRouteDependencies =
    {} as WifiImportRouteHandlerDependencies;
  const startupEvents: unknown[] = [];
  const startResult = startWifiImportServerWithDependencies({
    createRouteHandlers: ({ runtimeState }) => {
      startupEvents.push([
        "routes",
        runtimeState.isMidTransfer,
        runtimeState.receivedIds.size,
      ]);

      return {} as ReturnType<typeof createWifiImportRouteHandlers>;
    },
    createRuntimeState: createWifiImportRouteRuntimeState,
    getRouteDependencies: () => {
      startupEvents.push(["dependencies"]);

      return emptyWifiRouteDependencies;
    },
    startServer: ({ routeHandlers }) => {
      startupEvents.push(["start", routeHandlers !== null]);

      return {
        port: 3010,
        server: {
          stop: () => {
            startupEvents.push(["stop"]);
          },
        },
      };
    },
  });
  assert.deepEqual(startResult.action, {
    port: 3010,
    type: "start",
  });
  assert.notEqual(startResult.server, null);
  startResult.server?.stop();
  assert.deepEqual(startupEvents, [
    ["routes", false, 0],
    ["start", true],
    ["stop"],
  ]);
  const startupCommandEvents: unknown[] = [];
  const cleanupWifiImportServer = runWifiImportServerStartupCommand({
    createRouteHandlers: () => {
      startupCommandEvents.push(["routes"]);

      return {} as ReturnType<typeof createWifiImportRouteHandlers>;
    },
    createRuntimeState: createWifiImportRouteRuntimeState,
    dispatch: (action) => {
      startupCommandEvents.push(["dispatch", action]);
    },
    getRouteDependencies: () => emptyWifiRouteDependencies,
    startServer: () => ({
      port: 3020,
      server: {
        stop: () => {
          startupCommandEvents.push(["stop"]);
        },
      },
    }),
  });
  cleanupWifiImportServer();
  assert.deepEqual(startupCommandEvents, [
    ["routes"],
    ["dispatch", { port: 3020, type: "start" }],
    ["dispatch", { type: "stop" }],
    ["stop"],
  ]);
  assert.deepEqual(
    startWifiImportServerWithDependencies({
      createRouteHandlers: () => ({} as ReturnType<typeof createWifiImportRouteHandlers>),
      createRuntimeState: createWifiImportRouteRuntimeState,
      getRouteDependencies: () => emptyWifiRouteDependencies,
      startServer: () => {
        throw new Error("bridge failed");
      },
    }),
    {
      action: {
        error: "bridge failed",
        type: "fail",
      },
      server: null,
    },
  );
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
  assert.equal(isWifiImportTransferPathname("/(tabs)/import/wifi"), true);
  assert.equal(isWifiImportTransferPathname("/import/wifi"), true);
  assert.equal(isWifiImportTransferPathname("/ingest/from-network"), true);
  assert.equal(isWifiImportTransferPathname("/(tabs)/library"), false);
  assert.deepEqual(
    getWifiStartTransferDecision({
      allowTransfer: false,
      isMidTransfer: false,
      postData: { size: 3 },
    }),
    {
      response: {
        message: "Must be on Wifi Transfer page in app",
        status: 400,
      },
      shouldStart: false,
      transferSize: 0,
    },
  );
  assert.deepEqual(
    getWifiStartTransferDecision({
      allowTransfer: true,
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
      allowTransfer: true,
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
      allowTransfer: true,
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
  const transferPage = getWifiTransferPage();
  assert.equal(transferPage.includes('accept="audio/*"'), true);
  assert.equal(transferPage.includes("./startTransfer"), true);
  assert.equal(transferPage.includes("./fileUpload"), true);
  assert.equal(transferPage.includes("./finishTransfer"), true);

  const responses: unknown[] = [];
  const htmlResponses: string[] = [];
  const callbackCalls: unknown[] = [];
  let allowTransfer = false;
  let canBeginTransfer = true;
  let stageShouldFail = false;
  const runtimeState = createWifiImportRouteRuntimeState();
  const response = {
    html: (html: string) => {
      htmlResponses.push(html);
    },
    json: (payload: unknown, status: number) => {
      responses.push({ payload, status });
    },
  } as WifiBridgeResponse;
  const request = (postData?: unknown) =>
    ({ postData }) as WifiBridgeRequest;
  const routeHandlers = createWifiImportRouteHandlers({
    dependencies: () => ({
      allowTransfer,
      beginWifiTransfer: async (transferSize) => {
        callbackCalls.push(["begin", transferSize]);

        return canBeginTransfer;
      },
      failSession: (message) => {
        callbackCalls.push(["fail", message]);
      },
      finishWifiTransfer: () => {
        callbackCalls.push(["finish"]);
      },
      getConnectionResponse: () => ({ deviceName: "Smoke Device" }),
      getTransferPage: () => "<!DOCTYPE html><html><body>Smoke</body></html>",
      receiveWifiSong: (song) => {
        callbackCalls.push(["receive", song.id, song.fileName]);
      },
      stageWifiImportFile: async ({ id, name, type }) => {
        callbackCalls.push(["stage", id, name, type]);

        if (stageShouldFail) {
          throw new Error("stage failed");
        }

        return importDraft(id);
      },
    }),
    runtimeState,
  });

  await routeHandlers.handleRoot(request(), response);
  assert.equal(htmlResponses.length, 1);
  assert.equal(htmlResponses[0]?.includes("<!DOCTYPE html>"), true);

  await routeHandlers.handleStartTransfer(request({ size: 2 }), response);
  assert.equal(runtimeState.isMidTransfer, false);
  assert.deepEqual(responses.pop(), {
    payload: {
      message: "Must be on Wifi Transfer page in app",
      status: 400,
    },
    status: 400,
  });
  assert.deepEqual(callbackCalls, []);

  allowTransfer = true;
  canBeginTransfer = false;
  runtimeState.receivedIds.add(99);
  await routeHandlers.handleStartTransfer(request({ size: 2 }), response);
  assert.equal(runtimeState.isMidTransfer, false);
  assert.equal(runtimeState.receivedIds.has(99), false);
  assert.deepEqual(callbackCalls, [["begin", 2]]);
  assert.deepEqual(responses.pop(), {
    payload: wifiImportPrepareFailureResponse,
    status: 500,
  });
  callbackCalls.length = 0;

  canBeginTransfer = true;
  await routeHandlers.handleStartTransfer(request({ size: 2 }), response);
  assert.equal(runtimeState.isMidTransfer, true);
  assert.deepEqual(callbackCalls, [["begin", 2]]);
  assert.deepEqual(responses.pop(), {
    payload: {
      message: "OK - READY TO TRANSFER",
      status: 200,
    },
    status: 200,
  });
  callbackCalls.length = 0;

  await routeHandlers.handleFileUpload(
    request({
      data: "YmFzZTY0",
      id: 7,
      name: "song.mp3",
      type: "audio/mpeg",
    }),
    response,
  );
  assert.equal(runtimeState.receivedIds.has(7), true);
  assert.deepEqual(callbackCalls, [
    ["stage", 7, "song.mp3", "audio/mpeg"],
    ["receive", 7, "import-7.mp3"],
  ]);
  assert.deepEqual(responses.pop(), {
    payload: {
      message: "OK - song.mp3 RECEIVED",
      status: 200,
    },
    status: 200,
  });
  callbackCalls.length = 0;

  await routeHandlers.handleFileUpload(
    request({
      data: "YmFzZTY0",
      id: 7,
      name: "song.mp3",
      type: "audio/mpeg",
    }),
    response,
  );
  assert.deepEqual(callbackCalls, []);
  assert.deepEqual(responses.pop(), {
    payload: {
      message: "ERROR - Bad data from song.mp3",
      status: 409,
    },
    status: 409,
  });

  stageShouldFail = true;
  await routeHandlers.handleFileUpload(
    request({
      data: "YmFzZTY0",
      id: 8,
      name: "broken.mp3",
      type: "audio/mpeg",
    }),
    response,
  );
  assert.equal(runtimeState.receivedIds.has(8), false);
  assert.deepEqual(callbackCalls, [
    ["stage", 8, "broken.mp3", "audio/mpeg"],
    ["fail", "stage failed"],
  ]);
  assert.deepEqual(responses.pop(), {
    payload: {
      message: "ERROR - Failed to upload song: stage failed",
      status: 500,
    },
    status: 500,
  });
  callbackCalls.length = 0;

  await routeHandlers.handleFinishTransfer(request(), response);
  assert.equal(runtimeState.isMidTransfer, false);
  assert.deepEqual(callbackCalls, [["finish"]]);
  assert.deepEqual(responses.pop(), {
    payload: wifiImportFinishResponse,
    status: 200,
  });
  callbackCalls.length = 0;

  runtimeState.isMidTransfer = true;
  runtimeState.receivedIds.add(7);
  await routeHandlers.handleReset(request(), response);
  assert.equal(runtimeState.isMidTransfer, false);
  assert.deepEqual(Array.from(runtimeState.receivedIds), []);
  assert.deepEqual(responses.pop(), {
    payload: wifiImportResetResponse,
    status: 200,
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
  assert.equal(
    getCollectionDetailResultUpdatedAt(new Date(40), new Date(41)),
    41,
  );
  assert.equal(getCollectionDetailResultUpdatedAt(null, undefined), 0);
  assert.deepEqual(
    getCollectionDetailResultErrors(null, new Error("songs failed")).map(
      (error) => (error instanceof Error ? error.message : error),
    ),
    ["songs failed"],
  );
  const playlistResult = buildPlaylistDetailResult({
    collectionError: new Error("playlist failed"),
    getImagePath: (imageHash) => `/small/${imageHash}`,
    playlistRows: [{ coverImage: "playlist-hash", name: "Result Playlist" }],
    playlistUpdatedAt: new Date(12),
    songRows: [],
    songsError: null,
    songsUpdatedAt: new Date(13),
  });
  assert.equal(playlistResult.detail.title, "Result Playlist");
  assert.equal(playlistResult.detail.imagePath, "/small/playlist-hash");
  assert.equal(
    getLibrarySmallImagePathWithResolver({
      getImagePath: (imageHash) => ({
        pathToSmallImage: `/small/${imageHash}`,
      }),
      imageHash: "playlist-hash",
    }),
    "/small/playlist-hash",
  );
  assert.equal(playlistResult.detail.updatedAt, 13);
  assert.equal(
    playlistResult.errors[0] instanceof Error
      ? playlistResult.errors[0].message
      : playlistResult.errors[0],
    "playlist failed",
  );
  const albumResult = buildAlbumDetailResult({
    albumRows: [
      {
        artistName: "Result Artist",
        coverImage: "album-hash",
        name: "Result Album",
        year: null,
      },
    ],
    albumUpdatedAt: new Date(20),
    collectionError: null,
    getImagePath: (imageHash) => `/small/${imageHash}`,
    songRows: [],
    songsError: new Error("album songs failed"),
    songsUpdatedAt: new Date(19),
  });
  assert.equal(albumResult.detail.title, "Result Album");
  assert.equal(albumResult.detail.imagePath, "/small/album-hash");
  assert.equal(albumResult.detail.updatedAt, 20);
  assert.equal(albumResult.errors.length, 1);
  const artistResult = buildArtistDetailResult({
    artistRows: [{ albumId: 1, name: "Result Artist", profileImage: null }],
    artistUpdatedAt: undefined,
    collectionError: null,
    getImagePath: (imageHash) => `/small/${imageHash}`,
    songRows: [],
    songsError: null,
    songsUpdatedAt: undefined,
  });
  assert.equal(artistResult.detail.title, "Result Artist");
  assert.equal(artistResult.detail.updatedAt, 0);
  assert.deepEqual(artistResult.errors, []);
}

async function assertLibraryCollectionInteractionSmoke() {
  const commandCalls: unknown[] = [];
  const collectionCommandDependencies: LibraryCollectionCommandDependencies = {
    addSongToCollection: async (params) => {
      commandCalls.push(["add-one", params]);
    },
    addSongsToCollection: async (params) => {
      commandCalls.push(["add-many", params]);
    },
    deleteCollection: async (params) => {
      commandCalls.push(["delete", params]);
    },
    removeSongFromCollection: async (params) => {
      commandCalls.push(["remove", params]);
    },
    shareLibrarySongs: async (songs) => {
      commandCalls.push(["share", songs]);
    },
    updateCollectionSongOrder: async (params) => {
      commandCalls.push(["order", params]);
    },
  };

  assert.deepEqual(getLibraryInvalidCollectionState(), {
    backLink: {
      href: "/(tabs)/library",
      label: "Back to Library",
    },
    body: "This route needs a numeric id.",
    kicker: "Library",
    title: "Invalid collection",
  });
  assert.deepEqual(getLibraryInvalidCollectionState({ kicker: "Edit album" }), {
    backLink: {
      href: "/(tabs)/library",
      label: "Back to Library",
    },
    body: "This route needs a numeric id.",
    kicker: "Edit album",
    title: "Invalid collection",
  });

  assert.deepEqual(getLibraryCollectionSongEmptyState(), {
    body: "Add songs from your library to build this collection.",
    title: "No songs here yet",
  });

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

  void exportLibraryCollectionCommandWithDependencies(
    getPlayableCollectionSongs(songs),
    collectionCommandDependencies,
  );
  void deleteLibraryCollectionCommandWithDependencies(
    { id: 7, kind: "album" },
    collectionCommandDependencies,
  );
  void moveLibraryCollectionSongCommandWithDependencies(
    {
      collectionId: 7,
      direction: "down",
      kind: "playlist",
      songId: 1,
      songs,
    },
    collectionCommandDependencies,
  );
  void removeLibraryCollectionSongCommandWithDependencies(
    { collectionId: 7, kind: "artist", songId: 3 },
    collectionCommandDependencies,
  );
  void addLibraryCollectionSongCommandWithDependencies(
    { collectionId: 7, kind: "album", songId: 4 },
    collectionCommandDependencies,
  );
  void addLibraryCollectionSongsCommandWithDependencies(
    { collectionId: 7, kind: "playlist", songIds: [5, 6] },
    collectionCommandDependencies,
  );
  assert.deepEqual(commandCalls, [
    [
      "share",
      [songs[0], songs[2]],
    ],
    ["delete", { id: 7, kind: "album" }],
    [
      "order",
      {
        collectionId: 7,
        kind: "playlist",
        songIds: [2, 1, 3],
      },
    ],
    ["remove", { collectionId: 7, kind: "artist", songId: 3 }],
    ["add-one", { collectionId: 7, kind: "album", songId: 4 }],
    ["add-many", { collectionId: 7, kind: "playlist", songIds: [5, 6] }],
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
      canEdit: true,
      canExport: true,
      canMutateSongs: true,
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
      canEdit: true,
      canExport: false,
      canMutateSongs: true,
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
      canEdit: false,
      canExport: true,
      canMutateSongs: false,
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
      canEdit: false,
      canExport: false,
      canMutateSongs: false,
      canPlay: false,
      canQueue: false,
      deleteLabel: "Delete",
      exportLabel: "Export",
      playableSongs: [],
    },
  );
  assert.deepEqual(
    getCollectionDetailMutationActionState({
      detail: {
        isMissing: false,
        songs,
      },
      id: 7,
      kind: "album",
      mutationState: {
        isDeleting: true,
        isExporting: true,
      },
    }),
    {
      canDelete: false,
      canEdit: true,
      canExport: false,
      canMutateSongs: true,
      canPlay: true,
      canQueue: true,
      deleteLabel: "Deleting",
      exportLabel: "Exporting",
      playableSongs: [songs[0], songs[2]],
    },
  );
  assert.deepEqual(
    getCollectionDetailMutationControllerState({
      detail: {
        isMissing: false,
        songs,
      },
      id: 7,
      kind: "album",
      mutationState: {
        isDeleting: false,
        isExporting: true,
        movingSongId: 2,
        mutationError: "Collection mutation failed.",
        removingSongId: 3,
      },
    }),
    {
      actionState: {
        canDelete: true,
        canEdit: true,
        canExport: false,
        canMutateSongs: true,
        canPlay: true,
        canQueue: true,
        deleteLabel: "Delete",
        exportLabel: "Exporting",
        playableSongs: [songs[0], songs[2]],
      },
      movingSongId: 2,
      mutationError: "Collection mutation failed.",
      removingSongId: 3,
    },
  );
  assert.deepEqual(initialCollectionDetailMutationState, {
    isDeleting: false,
    isExporting: false,
    movingSongId: null,
    mutationError: null,
    removingSongId: null,
  });
  assert.deepEqual(
    collectionDetailMutationReducer(initialCollectionDetailMutationState, {
      mutation: "delete-collection",
      type: "begin",
    }),
    {
      ...initialCollectionDetailMutationState,
      isDeleting: true,
      mutationError: null,
    },
  );
  assert.deepEqual(
    collectionDetailMutationReducer(initialCollectionDetailMutationState, {
      mutation: "move-song",
      songId: 2,
      type: "begin",
    }),
    {
      ...initialCollectionDetailMutationState,
      movingSongId: 2,
      mutationError: null,
    },
  );
  assert.deepEqual(
    collectionDetailMutationReducer(
      {
        ...initialCollectionDetailMutationState,
        removingSongId: 3,
      },
      {
        mutation: "remove-song",
        type: "finish",
      },
    ),
    initialCollectionDetailMutationState,
  );
  assert.deepEqual(
    collectionDetailMutationReducer(initialCollectionDetailMutationState, {
      error: "Song order could not be saved.",
      type: "fail",
    }),
    {
      ...initialCollectionDetailMutationState,
      mutationError: "Song order could not be saved.",
    },
  );
  assert.deepEqual(getCollectionDetailMutationBlockedCommand(), {
    haptic: "error",
  });
  assert.deepEqual(getCollectionDeleteStartCommand(), {
    action: {
      mutation: "delete-collection",
      type: "begin",
    },
  });
  assert.deepEqual(getCollectionDeleteSuccessCommand({ kind: "artist" }), {
    haptic: "success",
    href: "/(tabs)/library/artists",
  });
  assert.deepEqual(getCollectionDeleteFinishCommand(), {
    action: {
      mutation: "delete-collection",
      type: "finish",
    },
  });
  assert.deepEqual(getCollectionExportStartCommand(), {
    action: {
      mutation: "export-collection",
      type: "begin",
    },
  });
  assert.deepEqual(getCollectionExportSuccessCommand(), {
    haptic: "success",
  });
  assert.deepEqual(getCollectionExportFinishCommand(), {
    action: {
      mutation: "export-collection",
      type: "finish",
    },
  });
  assert.deepEqual(getCollectionSongMoveStartCommand(2), {
    action: {
      mutation: "move-song",
      songId: 2,
      type: "begin",
    },
  });
  assert.deepEqual(getCollectionSongMoveSuccessCommand(), {
    haptic: "light",
  });
  assert.deepEqual(getCollectionSongMoveFinishCommand(), {
    action: {
      mutation: "move-song",
      type: "finish",
    },
  });
  assert.deepEqual(getCollectionSongRemovalStartCommand(3), {
    action: {
      mutation: "remove-song",
      songId: 3,
      type: "begin",
    },
  });
  assert.deepEqual(getCollectionSongRemovalSuccessCommand(), {
    haptic: "medium",
  });
  assert.deepEqual(getCollectionSongRemovalFinishCommand(), {
    action: {
      mutation: "remove-song",
      type: "finish",
    },
  });
  const collectionMutationAttemptEvents: unknown[] = [];
  await runCollectionDetailMutationAttempt({
    dispatch: (action) => {
      collectionMutationAttemptEvents.push(["dispatch", action]);
    },
    finishAction: getCollectionExportFinishCommand().action,
    mutation: "export-collection",
    onSuccess: () => {
      collectionMutationAttemptEvents.push(["success"]);
    },
    run: async () => {
      collectionMutationAttemptEvents.push(["run"]);
    },
    sendHaptic: (haptic) => {
      collectionMutationAttemptEvents.push(["haptic", haptic]);
    },
    startAction: getCollectionExportStartCommand().action,
  });
  await runCollectionDetailMutationAttempt({
    dispatch: (action) => {
      collectionMutationAttemptEvents.push(["dispatch", action]);
    },
    finishAction: getCollectionSongMoveFinishCommand().action,
    mutation: "move-song",
    onSuccess: () => {
      collectionMutationAttemptEvents.push(["unexpected-success"]);
    },
    run: async () => {
      throw new Error("Move failed");
    },
    sendHaptic: (haptic) => {
      collectionMutationAttemptEvents.push(["haptic", haptic]);
    },
    startAction: getCollectionSongMoveStartCommand(4).action,
  });
  assert.deepEqual(collectionMutationAttemptEvents, [
    [
      "dispatch",
      { mutation: "export-collection", type: "begin" },
    ],
    ["run"],
    ["success"],
    [
      "dispatch",
      { mutation: "export-collection", type: "finish" },
    ],
    [
      "dispatch",
      { mutation: "move-song", songId: 4, type: "begin" },
    ],
    ["haptic", "error"],
    [
      "dispatch",
      { error: "Move failed", type: "fail" },
    ],
    [
      "dispatch",
      { mutation: "move-song", type: "finish" },
    ],
  ]);
  const collectionMutationCommandEvents: unknown[] = [];
  const dispatchCollectionMutationCommand = (
    action: CollectionDetailMutationAction,
  ) => {
    collectionMutationCommandEvents.push(["dispatch", action]);
  };
  const sendCollectionMutationHaptic = (haptic: string) => {
    collectionMutationCommandEvents.push(["haptic", haptic]);
  };
  const playableActionState = getCollectionDetailActionState({
    id: 7,
    isDeleting: false,
    isExporting: false,
    isMissing: false,
    kind: "playlist",
    songs,
  });
  const deleteActionState = {
    ...playableActionState,
    canDelete: true,
  };
  const showCollectionDeleteConfirmation = async (
    shouldConfirm: boolean,
    shouldFailDelete = false,
  ) => {
    const confirmations: Promise<void>[] = [];
    runLibraryCollectionDeleteCommand({
      actionState: deleteActionState,
      deleteLibraryCollection: async (params) => {
        collectionMutationCommandEvents.push(["delete", params.id, params.kind]);

        if (shouldFailDelete) {
          throw new Error("Delete failed");
        }
      },
      detail: {
        eyebrow: "Playlist",
        title: "Smoke Mix",
      },
      dispatch: dispatchCollectionMutationCommand,
      id: 7,
      kind: "playlist",
      replaceRoute: (href) => {
        collectionMutationCommandEvents.push(["route", href]);
      },
      sendHaptic: sendCollectionMutationHaptic,
      showConfirmation: (params) => {
        collectionMutationCommandEvents.push([
          "confirm",
          params.title,
          params.body,
          params.cancelLabel,
          params.confirmLabel,
        ]);

        if (shouldConfirm) {
          confirmations.push(Promise.resolve(params.onConfirm()));
        }
      },
    });
    await Promise.all(confirmations);
  };
  runLibraryCollectionDeleteCommand({
    actionState: {
      ...deleteActionState,
      canDelete: false,
    },
    deleteLibraryCollection: async () => {
      collectionMutationCommandEvents.push(["unexpected-delete"]);
    },
    detail: {
      eyebrow: "Playlist",
      title: "Smoke Mix",
    },
    dispatch: dispatchCollectionMutationCommand,
    id: 7,
    kind: "playlist",
    replaceRoute: (href) => {
      collectionMutationCommandEvents.push(["unexpected-route", href]);
    },
    sendHaptic: sendCollectionMutationHaptic,
    showConfirmation: () => {
      collectionMutationCommandEvents.push(["unexpected-confirm"]);
    },
  });
  await showCollectionDeleteConfirmation(false);
  await showCollectionDeleteConfirmation(true);
  await showCollectionDeleteConfirmation(true, true);
  await runLibraryCollectionExportCommand({
    actionState: {
      ...playableActionState,
      canExport: false,
    },
    dispatch: dispatchCollectionMutationCommand,
    exportLibraryCollection: async () => {
      collectionMutationCommandEvents.push(["unexpected-export"]);
    },
    sendHaptic: sendCollectionMutationHaptic,
  });
  await runLibraryCollectionExportCommand({
    actionState: playableActionState,
    dispatch: dispatchCollectionMutationCommand,
    exportLibraryCollection: async (playableSongs) => {
      collectionMutationCommandEvents.push([
        "export",
        playableSongs.map((song) => song.id),
      ]);
    },
    sendHaptic: sendCollectionMutationHaptic,
  });
  await runLibraryCollectionExportCommand({
    actionState: playableActionState,
    dispatch: dispatchCollectionMutationCommand,
    exportLibraryCollection: async () => {
      throw new Error("Export failed");
    },
    sendHaptic: sendCollectionMutationHaptic,
  });
  await runLibraryCollectionSongMoveCommand({
    collectionId: 7,
    detail: { songs },
    direction: "down",
    dispatch: dispatchCollectionMutationCommand,
    kind: "playlist",
    moveLibraryCollectionSong: async (params) => {
      collectionMutationCommandEvents.push([
        "move",
        params.collectionId,
        params.songId,
        params.direction,
        params.songs.map((song) => song.id),
      ]);
    },
    sendHaptic: sendCollectionMutationHaptic,
    songId: songs[0]!.id,
  });
  await runLibraryCollectionSongMoveCommand({
    collectionId: 7,
    detail: { songs },
    direction: "up",
    dispatch: dispatchCollectionMutationCommand,
    kind: "playlist",
    moveLibraryCollectionSong: async () => {
      throw new Error("Move failed");
    },
    sendHaptic: sendCollectionMutationHaptic,
    songId: songs[1]!.id,
  });
  await runLibraryCollectionSongRemoveCommand({
    collectionId: 7,
    dispatch: dispatchCollectionMutationCommand,
    kind: "playlist",
    removeLibraryCollectionSong: async (params) => {
      collectionMutationCommandEvents.push([
        "remove",
        params.collectionId,
        params.songId,
      ]);
    },
    sendHaptic: sendCollectionMutationHaptic,
    songId: songs[0]!.id,
  });
  await runLibraryCollectionSongRemoveCommand({
    collectionId: 7,
    dispatch: dispatchCollectionMutationCommand,
    kind: "playlist",
    removeLibraryCollectionSong: async () => {
      throw new Error("Remove failed");
    },
    sendHaptic: sendCollectionMutationHaptic,
    songId: songs[1]!.id,
  });
  assert.deepEqual(collectionMutationCommandEvents, [
    ["haptic", "error"],
    [
      "confirm",
      "Delete playlist",
      "Delete Smoke Mix? Songs will stay in your library.",
      "Cancel",
      "Delete",
    ],
    [
      "confirm",
      "Delete playlist",
      "Delete Smoke Mix? Songs will stay in your library.",
      "Cancel",
      "Delete",
    ],
    [
      "dispatch",
      { mutation: "delete-collection", type: "begin" },
    ],
    ["delete", 7, "playlist"],
    ["haptic", "success"],
    ["route", "/(tabs)/library/playlists"],
    [
      "dispatch",
      { mutation: "delete-collection", type: "finish" },
    ],
    [
      "confirm",
      "Delete playlist",
      "Delete Smoke Mix? Songs will stay in your library.",
      "Cancel",
      "Delete",
    ],
    [
      "dispatch",
      { mutation: "delete-collection", type: "begin" },
    ],
    ["delete", 7, "playlist"],
    ["haptic", "error"],
    ["dispatch", { error: "Delete failed", type: "fail" }],
    [
      "dispatch",
      { mutation: "delete-collection", type: "finish" },
    ],
    ["haptic", "error"],
    [
      "dispatch",
      { mutation: "export-collection", type: "begin" },
    ],
    ["export", [1, 3]],
    ["haptic", "success"],
    [
      "dispatch",
      { mutation: "export-collection", type: "finish" },
    ],
    [
      "dispatch",
      { mutation: "export-collection", type: "begin" },
    ],
    ["haptic", "error"],
    ["dispatch", { error: "Export failed", type: "fail" }],
    [
      "dispatch",
      { mutation: "export-collection", type: "finish" },
    ],
    [
      "dispatch",
      { mutation: "move-song", songId: 1, type: "begin" },
    ],
    ["move", 7, 1, "down", [1, 2, 3]],
    ["haptic", "light"],
    ["dispatch", { mutation: "move-song", type: "finish" }],
    [
      "dispatch",
      { mutation: "move-song", songId: 2, type: "begin" },
    ],
    ["haptic", "error"],
    ["dispatch", { error: "Move failed", type: "fail" }],
    ["dispatch", { mutation: "move-song", type: "finish" }],
    [
      "dispatch",
      { mutation: "remove-song", songId: 1, type: "begin" },
    ],
    ["remove", 7, 1],
    ["haptic", "medium"],
    ["dispatch", { mutation: "remove-song", type: "finish" }],
    [
      "dispatch",
      { mutation: "remove-song", songId: 2, type: "begin" },
    ],
    ["haptic", "error"],
    ["dispatch", { error: "Remove failed", type: "fail" }],
    ["dispatch", { mutation: "remove-song", type: "finish" }],
  ]);
  assert.deepEqual(
    getCollectionDetailStatusState({
      errors: [],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      mutationError: null,
      updatedAt: 30,
    }),
    {
      isError: false,
      statusLabel: "Updated time:30",
      updatedLabel: "Updated time:30",
    },
  );
  assert.deepEqual(
    getCollectionDetailStatusState({
      errors: [],
      mutationError: null,
      updatedAt: 0,
    }),
    {
      isError: false,
      statusLabel: "Waiting for collection data",
      updatedLabel: "Waiting for collection data",
    },
  );
  assert.deepEqual(
    getCollectionDetailStatusState({
      errors: [new Error("query")],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      mutationError: null,
      updatedAt: 30,
    }),
    {
      isError: true,
      statusLabel: "One or more detail queries failed.",
      updatedLabel: "Updated time:30",
    },
  );
  assert.deepEqual(
    getCollectionDetailStatusState({
      errors: [new Error("query")],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      mutationError: "Move failed.",
      updatedAt: 30,
    }),
    {
      isError: true,
      statusLabel: "Move failed.",
      updatedLabel: "Updated time:30",
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
  const collectionPlaybackActionEvents: unknown[] = [];
  const collectionPlaybackActions = {
    addToQueue: (song: (typeof songs)[number]) => {
      collectionPlaybackActionEvents.push(["queue", song.id]);
    },
    playSong: (song: (typeof songs)[number]) => {
      collectionPlaybackActionEvents.push(["play", song.id]);
    },
    pushRoute: (href: "/player") => {
      collectionPlaybackActionEvents.push(["route", href]);
    },
    sendHaptic: (haptic: string) => {
      collectionPlaybackActionEvents.push(["haptic", haptic]);
    },
  };
  runLibraryCollectionPlayAction({
    actionState: { playableSongs: [] },
    ...collectionPlaybackActions,
  });
  runLibraryCollectionPlayAction({
    actionState: { playableSongs: [songs[0]!, songs[2]!] },
    ...collectionPlaybackActions,
  });
  runLibraryCollectionQueueAction({
    actionState: { canQueue: false, playableSongs: [songs[0]!, songs[2]!] },
    addToQueue: collectionPlaybackActions.addToQueue,
    sendHaptic: collectionPlaybackActions.sendHaptic,
  });
  runLibraryCollectionQueueAction({
    actionState: { canQueue: true, playableSongs: [songs[0]!, songs[2]!] },
    addToQueue: collectionPlaybackActions.addToQueue,
    sendHaptic: collectionPlaybackActions.sendHaptic,
  });
  assert.deepEqual(collectionPlaybackActionEvents, [
    ["haptic", "error"],
    ["haptic", "light"],
    ["play", songs[0]!.id],
    ["queue", songs[2]!.id],
    ["route", "/player"],
    ["haptic", "error"],
    ["haptic", "light"],
    ["queue", songs[0]!.id],
    ["queue", songs[2]!.id],
  ]);
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
      canMutateSongs: false,
      index: 1,
      movingSongId: null,
      removingSongId: null,
      songId: 2,
      totalSongs: songs.length,
    }).canRemove,
    false,
  );
  assert.equal(
    getCollectionSongRowActionState({
      canMutateSongs: false,
      index: 1,
      movingSongId: null,
      removingSongId: null,
      songId: 2,
      totalSongs: songs.length,
    }).canMoveUp,
    false,
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
  assert.deepEqual(
    getCollectionSongRowViewState({
      index: 1,
      movingSongId: null,
      removingSongId: null,
      songId: 2,
      totalSongs: songs.length,
    }),
    {
      detailHref: "/(tabs)/library/song/2",
      rowState: {
        canMoveDown: true,
        canMoveUp: true,
        canRemove: true,
        downLabel: "Down",
        isMoving: false,
        isRemoving: false,
        removeLabel: "Remove",
        upLabel: "Up",
      },
    },
  );
  assert.deepEqual(
    getCollectionSongRowsViewState({
      movingSongId: 2,
      removingSongId: null,
      songs,
    }),
    [
      {
        song: songs[0],
        viewState: {
          detailHref: "/(tabs)/library/song/1",
          rowState: {
            canMoveDown: false,
            canMoveUp: false,
            canRemove: false,
            downLabel: "Down",
            isMoving: false,
            isRemoving: false,
            removeLabel: "Remove",
            upLabel: "Up",
          },
        },
      },
      {
        song: songs[1],
        viewState: {
          detailHref: "/(tabs)/library/song/2",
          rowState: {
            canMoveDown: false,
            canMoveUp: false,
            canRemove: false,
            downLabel: "Moving",
            isMoving: true,
            isRemoving: false,
            removeLabel: "Remove",
            upLabel: "Moving",
          },
        },
      },
      {
        song: songs[2],
        viewState: {
          detailHref: "/(tabs)/library/song/3",
          rowState: {
            canMoveDown: false,
            canMoveUp: false,
            canRemove: false,
            downLabel: "Down",
            isMoving: false,
            isRemoving: false,
            removeLabel: "Remove",
            upLabel: "Up",
          },
        },
      },
    ],
  );
  assert.equal(getCollectionListHref("album"), "/(tabs)/library/albums");
  assert.equal(getCollectionListHref("artist"), "/(tabs)/library/artists");
  assert.equal(getCollectionListHref("playlist"), "/(tabs)/library/playlists");
  assert.equal(getLibraryCollectionBackHref(), "/(tabs)/library");
  assert.deepEqual(getCollectionDetailViewState({ id: 7, kind: "album", songs }), {
    actionLinks: {
      addHref: "/(tabs)/library/album/add/7",
      editHref: "/(tabs)/library/album/edit/7",
    },
    backLink: {
      href: "/(tabs)/library",
      label: "Back to Library",
    },
    songSection: {
      emptyState: {
        body: "Add songs from your library to build this collection.",
        title: "No songs here yet",
      },
      meta: "3 songs",
      title: "Songs",
    },
  });
  const collectionDetailScreenViewState = getCollectionDetailScreenViewState({
    actionState: getCollectionDetailActionState({
      id: 7,
      isDeleting: false,
      isExporting: false,
      isMissing: false,
      kind: "album",
      songs,
    }),
    detail: {
      detail: "3 songs",
      eyebrow: "Album",
      imagePath: null,
      isMissing: false,
      kind: "album",
      meta: "3 songs",
      songs,
      title: "Alpha",
      updatedAt: 30,
    },
    errors: [],
    id: 7,
    kind: "album",
    movingSongId: null,
    mutationError: null,
    removingSongId: null,
  });
  assert.equal(
    collectionDetailScreenViewState.viewState.actionLinks.editHref,
    "/(tabs)/library/album/edit/7",
  );
  assert.equal(collectionDetailScreenViewState.statusState.isError, false);
  assert.equal(collectionDetailScreenViewState.songRows.length, 3);
  assert.equal(
    getCollectionEditHref({ id: 7, kind: "album" }),
    "/(tabs)/library/album/edit/7",
  );
  assert.equal(
    getCollectionAddSongsHref({ id: 8, kind: "playlist" }),
    "/(tabs)/library/playlist/add/8",
  );
  assert.deepEqual(
    getDeleteCollectionConfirmationCopy({
      eyebrow: "Playlist",
      title: "Smoke Mix",
    }),
    {
      cancelLabel: "Cancel",
      confirmLabel: "Delete",
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
  assert.deepEqual(
    getCollectionDetailMutationFailureCommand({
      caughtError: new Error("Move failed"),
      mutation: "move-song",
    }),
    {
      action: {
        error: "Move failed",
        type: "fail",
      },
      haptic: "error",
    },
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
    canEditLibraryCollection({
      id: 1,
      isMissing: false,
      kind: "playlist",
    }),
    false,
  );
  assert.equal(
    canEditLibraryCollection({
      id: 2,
      isMissing: false,
      kind: "playlist",
    }),
    false,
  );
  assert.equal(
    canEditLibraryCollection({
      id: 3,
      isMissing: false,
      kind: "playlist",
    }),
    true,
  );
  assert.equal(
    canMutateLibraryCollectionMembership({
      id: 1,
      isMissing: false,
      kind: "playlist",
    }),
    false,
  );
  assert.equal(
    canMutateLibraryCollectionMembership({
      id: 2,
      isMissing: false,
      kind: "playlist",
    }),
    false,
  );
  assert.equal(
    canMutateLibraryCollectionMembership({
      id: 3,
      isMissing: false,
      kind: "playlist",
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
  const addSongsControllerResultState =
    getAddCollectionSongsControllerResultState({
      controllerState: {
        isAddingSelection: false,
        mutationError: "Add failed.",
        savingSongId: 3,
        selectedSongIds: new Set([1, 2, 3]),
      },
      songs: addableSongs,
    });
  assert.equal(addSongsControllerResultState.mutationError, "Add failed.");
  assert.equal(addSongsControllerResultState.savingSongId, 3);
  assert.deepEqual(
    Array.from(addSongsControllerResultState.selectedSongIds),
    [1, 2, 3],
  );
  assert.deepEqual(
    addSongsControllerResultState.selectionState.selectedAddableSongIds,
    [1, 3],
  );
  assert.deepEqual(
    {
      ...initialAddCollectionSongsControllerState,
      selectedSongIds: Array.from(
        initialAddCollectionSongsControllerState.selectedSongIds,
      ),
    },
    {
      isAddingSelection: false,
      mutationError: null,
      savingSongId: null,
      selectedSongIds: [],
    },
  );
  assert.deepEqual(initialAddCollectionSongsSearchState, {
    query: "",
  });
  assert.deepEqual(getAddCollectionSongsSearchSetQueryAction("ambient"), {
    query: "ambient",
    type: "set-query",
  });
  assert.deepEqual(
    addCollectionSongsSearchReducer(
      initialAddCollectionSongsSearchState,
      getAddCollectionSongsSearchSetQueryAction("ambient"),
    ),
    {
      query: "ambient",
    },
  );
  const selectedAddControllerState = addCollectionSongsControllerReducer(
    initialAddCollectionSongsControllerState,
    { songId: 1, type: "toggle-selection" },
  );
  assert.deepEqual(Array.from(selectedAddControllerState.selectedSongIds), [1]);
  assert.equal(selectedAddControllerState.mutationError, null);
  assert.deepEqual(
    addCollectionSongsControllerReducer(selectedAddControllerState, {
      type: "begin-add-selection",
    }),
    {
      ...selectedAddControllerState,
      isAddingSelection: true,
      mutationError: null,
    },
  );
  assert.deepEqual(
    addCollectionSongsControllerReducer(
      {
        ...selectedAddControllerState,
        isAddingSelection: true,
      },
      getAddCollectionSongsFinishSelectionAction(),
    ),
    selectedAddControllerState,
  );
  assert.deepEqual(getAddCollectionSongsFinishSelectionAction(), {
    type: "finish-add-selection",
  });
  assert.deepEqual(
    addCollectionSongsControllerReducer(selectedAddControllerState, {
      songId: 1,
      type: "remove-selection",
    }).selectedSongIds,
    new Set(),
  );
  assert.deepEqual(
    addCollectionSongsControllerReducer(selectedAddControllerState, {
      songId: 3,
      type: "begin-add-song",
    }),
    {
      ...selectedAddControllerState,
      mutationError: null,
      savingSongId: 3,
    },
  );
  assert.deepEqual(
    addCollectionSongsControllerReducer(
      {
        ...selectedAddControllerState,
        savingSongId: 3,
      },
      getAddCollectionSongsFinishSongAction(),
    ),
    selectedAddControllerState,
  );
  assert.deepEqual(getAddCollectionSongsFinishSongAction(), {
    type: "finish-add-song",
  });
  assert.deepEqual(
    addCollectionSongsControllerReducer(selectedAddControllerState, {
      error: "Song could not be added.",
      type: "fail",
    }),
    {
      ...selectedAddControllerState,
      mutationError: "Song could not be added.",
    },
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
  assert.deepEqual(getAddCollectionSongsBlockedCommand(), {
    haptic: "error",
  });
  assert.deepEqual(getAddCollectionSongsToggleSelectionCommand(3), {
    action: {
      songId: 3,
      type: "toggle-selection",
    },
    haptic: "light",
  });
  assert.deepEqual(getAddCollectionSongsSelectionStartCommand(), {
    action: {
      type: "begin-add-selection",
    },
    haptic: "medium",
  });
  assert.deepEqual(getAddCollectionSongsSelectionSuccessCommand(), {
    action: {
      type: "clear-selection",
    },
    haptic: "success",
  });
  assert.deepEqual(getAddCollectionSongsSongStartCommand(3), {
    action: {
      songId: 3,
      type: "begin-add-song",
    },
    haptic: "light",
  });
  assert.deepEqual(getAddCollectionSongsSongSuccessCommand(3), {
    action: {
      songId: 3,
      type: "remove-selection",
    },
    haptic: "success",
  });
  assert.deepEqual(
    getAddCollectionSongsFailureCommand({
      caughtError: new Error("Add smoke failure"),
      mutation: "add-song",
    }),
    {
      action: {
        error: "Add smoke failure",
        type: "fail",
      },
      haptic: "error",
    },
  );

  const attemptEvents: unknown[] = [];
  await runAddCollectionSongsMutationAttempt({
    dispatchControllerState: (action) => {
      attemptEvents.push(["dispatch", action]);
    },
    finishAction: getAddCollectionSongsFinishSelectionAction(),
    mutation: "add-selection",
    run: async () => {
      attemptEvents.push(["run"]);
    },
    sendHaptic: (haptic) => {
      attemptEvents.push(["haptic", haptic]);
    },
    startCommand: getAddCollectionSongsSelectionStartCommand(),
    successCommand: getAddCollectionSongsSelectionSuccessCommand(),
  });
  await runAddCollectionSongsMutationAttempt({
    dispatchControllerState: (action) => {
      attemptEvents.push(["dispatch", action]);
    },
    finishAction: getAddCollectionSongsFinishSongAction(),
    mutation: "add-song",
    run: async () => {
      throw new Error("Attempt add failed");
    },
    sendHaptic: (haptic) => {
      attemptEvents.push(["haptic", haptic]);
    },
    startCommand: getAddCollectionSongsSongStartCommand(8),
    successCommand: getAddCollectionSongsSongSuccessCommand(8),
  });
  assert.deepEqual(attemptEvents, [
    ["haptic", "medium"],
    ["dispatch", { type: "begin-add-selection" }],
    ["run"],
    ["dispatch", { type: "clear-selection" }],
    ["haptic", "success"],
    ["dispatch", { type: "finish-add-selection" }],
    ["haptic", "light"],
    ["dispatch", { songId: 8, type: "begin-add-song" }],
    ["haptic", "error"],
    ["dispatch", { error: "Attempt add failed", type: "fail" }],
    ["dispatch", { type: "finish-add-song" }],
  ]);

  const commandEvents: unknown[] = [];
  const commandDependencies = {
    addCollectionSong: async ({
      collectionId,
      kind,
      songId,
    }: {
      collectionId: number;
      kind: "album" | "artist" | "playlist";
      songId: number;
    }) => {
      commandEvents.push(["add-song", collectionId, kind, songId]);
    },
    addCollectionSongs: async ({
      collectionId,
      kind,
      songIds,
    }: {
      collectionId: number;
      kind: "album" | "artist" | "playlist";
      songIds: number[];
    }) => {
      commandEvents.push(["add-songs", collectionId, kind, songIds]);
    },
    collectionId: 9,
    dispatchControllerState: (action: unknown) => {
      commandEvents.push(["dispatch", action]);
    },
    kind: "playlist" as const,
    selectionState: {
      bulkAddLabel: "Add selected",
      canBulkAdd: true,
      isMutating: false,
      selectedAddableSongIds: [1, 3],
      selectedCount: 2,
      selectionLabel: "2 selected",
    },
    sendHaptic: (haptic: string) => {
      commandEvents.push(["haptic", haptic]);
    },
  };
  runAddCollectionSongsToggleSelectionCommand({
    ...commandDependencies,
    songId: 5,
  });
  await runAddCollectionSongsSelectionCommand(commandDependencies);
  await runAddCollectionSongCommand({
    ...commandDependencies,
    songId: 3,
  });
  assert.deepEqual(commandEvents, [
    ["haptic", "light"],
    ["dispatch", { songId: 5, type: "toggle-selection" }],
    ["haptic", "medium"],
    ["dispatch", { type: "begin-add-selection" }],
    ["add-songs", 9, "playlist", [1, 3]],
    ["dispatch", { type: "clear-selection" }],
    ["haptic", "success"],
    ["dispatch", { type: "finish-add-selection" }],
    ["haptic", "light"],
    ["dispatch", { songId: 3, type: "begin-add-song" }],
    ["add-song", 9, "playlist", 3],
    ["dispatch", { songId: 3, type: "remove-selection" }],
    ["haptic", "success"],
    ["dispatch", { type: "finish-add-song" }],
  ]);
  commandEvents.length = 0;
  await runAddCollectionSongsSelectionCommand({
    ...commandDependencies,
    selectionState: {
      ...commandDependencies.selectionState,
      canBulkAdd: false,
      selectedAddableSongIds: [],
      selectedCount: 0,
    },
  });
  assert.deepEqual(commandEvents, [["haptic", "error"]]);
  commandEvents.length = 0;
  await runAddCollectionSongCommand({
    ...commandDependencies,
    addCollectionSong: async () => {
      throw new Error("add failed");
    },
    songId: 6,
  });
  assert.deepEqual(commandEvents, [
    ["haptic", "light"],
    ["dispatch", { songId: 6, type: "begin-add-song" }],
    ["haptic", "error"],
    ["dispatch", { error: "add failed", type: "fail" }],
    ["dispatch", { type: "finish-add-song" }],
  ]);
  commandEvents.length = 0;
  const assembledAddCollectionSongsCommands = createAddCollectionSongsCommands(
    commandDependencies,
  );
  assembledAddCollectionSongsCommands.toggleSongSelection(4);
  await assembledAddCollectionSongsCommands.addSelectedSongs();
  await assembledAddCollectionSongsCommands.addSong(6);
  assert.deepEqual(commandEvents, [
    ["haptic", "light"],
    ["dispatch", { songId: 4, type: "toggle-selection" }],
    ["haptic", "medium"],
    ["dispatch", { type: "begin-add-selection" }],
    ["add-songs", 9, "playlist", [1, 3]],
    ["dispatch", { type: "clear-selection" }],
    ["haptic", "success"],
    ["dispatch", { type: "finish-add-selection" }],
    ["haptic", "light"],
    ["dispatch", { songId: 6, type: "begin-add-song" }],
    ["add-song", 9, "playlist", 6],
    ["dispatch", { songId: 6, type: "remove-selection" }],
    ["haptic", "success"],
    ["dispatch", { type: "finish-add-song" }],
  ]);

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
  assert.deepEqual(
    getAddableSongRows({
      savingSongId: 1,
      selectedSongIds: new Set([1, 2]),
      songs: addableSongs,
    }),
    [
      {
        rowState: {
          addLabel: "Adding",
          isDisabled: true,
          isSaving: true,
          isSelected: true,
        },
        song: addableSongs[0],
      },
      {
        rowState: {
          addLabel: "Added",
          isDisabled: true,
          isSaving: false,
          isSelected: false,
        },
        song: addableSongs[1],
      },
      {
        rowState: {
          addLabel: "Add",
          isDisabled: false,
          isSaving: false,
          isSelected: false,
        },
        song: addableSongs[2],
      },
    ],
  );
}

async function assertCollectionDeleteExecutorSmoke() {
  const calls: string[] = [];
  const dependencies: CollectionDeleteDependencies = {
    deleteAlbumArtistRows: async (albumId) => {
      calls.push(`delete-album-artists:${albumId}`);
    },
    deleteAlbumRow: async (albumId) => {
      calls.push(`delete-album:${albumId}`);
    },
    deleteAlbumSongRows: async (albumId) => {
      calls.push(`delete-album-songs:${albumId}`);
    },
    deleteArtistAlbumRows: async (artistId) => {
      calls.push(`delete-artist-albums:${artistId}`);
    },
    deleteArtistRow: async (artistId) => {
      calls.push(`delete-artist:${artistId}`);
    },
    deleteArtistSongRows: async (artistId) => {
      calls.push(`delete-artist-songs:${artistId}`);
    },
    deletePlaylistRow: async (playlistId) => {
      calls.push(`delete-playlist:${playlistId}`);
    },
    deletePlaylistSongRows: async (playlistId) => {
      calls.push(`delete-playlist-songs:${playlistId}`);
    },
    likedSongsPlaylistId: 2,
    systemPlaylistId: 1,
  };

  await deleteCollectionWithDependencies(
    { id: 10, kind: "album" },
    dependencies,
  );
  assert.deepEqual(calls, [
    "delete-album-songs:10",
    "delete-album-artists:10",
    "delete-album:10",
  ]);

  calls.length = 0;
  await deleteCollectionWithDependencies(
    { id: 11, kind: "artist" },
    dependencies,
  );
  assert.deepEqual(calls, [
    "delete-artist-songs:11",
    "delete-artist-albums:11",
    "delete-artist:11",
  ]);

  calls.length = 0;
  await deleteCollectionWithDependencies(
    { id: 12, kind: "playlist" },
    dependencies,
  );
  assert.deepEqual(calls, [
    "delete-playlist-songs:12",
    "delete-playlist:12",
  ]);

  calls.length = 0;
  assert.throws(
    () => assertCanDeletePlaylist({ dependencies, id: 1 }),
    /system playlist/,
  );
  await assert.rejects(
    () =>
      deleteCollectionWithDependencies(
        { id: 2, kind: "playlist" },
        dependencies,
      ),
    /system playlist/,
  );
  assert.deepEqual(calls, []);
}

async function assertCollectionSongMembershipExecutorSmoke() {
  const calls: unknown[] = [];
  const relationships = new Map<string, { id: number; order: number }>([
    ["10:1", { id: 100, order: 2 }],
    ["10:2", { id: 101, order: 5 }],
  ]);
  let nextId = 200;
  const dependencies: LikedSongMembershipDependencies = {
    deleteRelationship: async ({ ownerId, songId }) => {
      calls.push(["delete", ownerId, songId]);
      relationships.delete(`${ownerId}:${songId}`);
    },
    findRelationshipId: async ({ ownerId, songId }) => {
      calls.push(["find", ownerId, songId]);
      return relationships.get(`${ownerId}:${songId}`)?.id ?? null;
    },
    insertRelationship: async ({ order, ownerId, songId }) => {
      calls.push(["insert", ownerId, songId, order]);
      relationships.set(`${ownerId}:${songId}`, { id: nextId++, order });
    },
    loadRelationshipOrders: async (ownerId) => {
      calls.push(["load-orders", ownerId]);
      return Array.from(relationships.entries())
        .filter(([key]) => key.startsWith(`${ownerId}:`))
        .map(([, relationship]) => relationship.order);
    },
  };

  assert.equal(getNextSongRelationshipOrder([null, 2, 5]), 6);
  assert.deepEqual(
    getOrderedSongRelationshipInsert({
      order: 6,
      ownerId: 10,
      songId: 3,
    }),
    { order: 6, ownerId: 10, songId: 3 },
  );
  assert.deepEqual(
    getLikedSongRelationshipDelete({
      playlistId: 2,
      songId: 5,
    }),
    { ownerId: 2, songId: 5 },
  );

  assert.equal(
    await addOrderedSongRelationshipWithDependencies(
      { ownerId: 10, songId: 3 },
      dependencies,
    ),
    true,
  );
  assert.deepEqual(calls, [
    ["find", 10, 3],
    ["load-orders", 10],
    ["insert", 10, 3, 6],
  ]);

  calls.length = 0;
  assert.equal(
    await addOrderedSongRelationshipWithDependencies(
      { ownerId: 10, songId: 3 },
      dependencies,
    ),
    false,
  );
  assert.deepEqual(calls, [["find", 10, 3]]);

  calls.length = 0;
  await assert.rejects(
    () =>
      addSongToPlaylistWithDependencies(
        {
          playlistId: 1,
          protectedPlaylistIds: new Set([1, 2]),
          songId: 9,
        },
        dependencies,
      ),
    /protected playlist/,
  );
  assert.deepEqual(calls, []);
  assert.throws(
    () =>
      assertCanMutatePlaylistMembership({
        playlistId: 2,
        protectedPlaylistIds: new Set([2]),
      }),
    /protected playlist/,
  );

  assert.equal(
    await addSongToPlaylistWithDependencies(
      {
        playlistId: 11,
        protectedPlaylistIds: new Set([1, 2]),
        songId: 4,
      },
      dependencies,
    ),
    true,
  );
  assert.deepEqual(calls, [
    ["find", 11, 4],
    ["load-orders", 11],
    ["insert", 11, 4, 1],
  ]);

  calls.length = 0;
  assert.equal(
    await setLikedSongMembershipWithDependencies(
      {
        liked: true,
        playlistId: 2,
        songId: 5,
      },
      dependencies,
    ),
    true,
  );
  assert.deepEqual(calls, [
    ["find", 2, 5],
    ["load-orders", 2],
    ["insert", 2, 5, 1],
  ]);

  calls.length = 0;
  assert.equal(
    await setLikedSongMembershipWithDependencies(
      {
        liked: false,
        playlistId: 2,
        songId: 5,
      },
      dependencies,
    ),
    false,
  );
  assert.deepEqual(calls, [["delete", 2, 5]]);
}

async function assertCollectionSongAddExecutorSmoke() {
  const calls: unknown[] = [];
  const dependencies: CollectionSongAddDependencies = {
    addSongToAlbum: async (params) => {
      calls.push(["album", params]);
    },
    addSongToArtist: async (params) => {
      calls.push(["artist", params]);
    },
    addSongToPlaylist: async (params) => {
      calls.push(["playlist", params]);
    },
  };

  assert.deepEqual(
    getCollectionSongAddOperation({
      collectionId: 9,
      kind: "album",
      songId: 1,
    }),
    { albumId: 9, kind: "album", songId: 1 },
  );
  assert.deepEqual(
    getCollectionSongAddOperations({
      collectionId: 9,
      kind: "playlist",
      songIds: [1, 2],
    }),
    [
      { kind: "playlist", playlistId: 9, songId: 1 },
      { kind: "playlist", playlistId: 9, songId: 2 },
    ],
  );

  await addSongToCollectionWithDependencies(
    { collectionId: 10, kind: "album", songId: 1 },
    dependencies,
  );
  await addSongToCollectionWithDependencies(
    { collectionId: 11, kind: "artist", songId: 2 },
    dependencies,
  );
  await addSongToCollectionWithDependencies(
    { collectionId: 12, kind: "playlist", songId: 3 },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["album", { albumId: 10, songId: 1 }],
    ["artist", { artistId: 11, songId: 2 }],
    ["playlist", { playlistId: 12, songId: 3 }],
  ]);

  calls.length = 0;
  await addSongsToCollectionWithDependencies(
    { collectionId: 13, kind: "playlist", songIds: [4, 5, 6] },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["playlist", { playlistId: 13, songId: 4 }],
    ["playlist", { playlistId: 13, songId: 5 }],
    ["playlist", { playlistId: 13, songId: 6 }],
  ]);
}

async function assertCollectionSongRelationshipExecutorSmoke() {
  const calls: unknown[] = [];
  const dependencies: CollectionSongRelationshipDependencies = {
    protectedPlaylistIds: new Set([1, 2]),
    removeAlbumSong: async (params) => {
      calls.push(["remove-album", params]);
    },
    removeArtistSong: async (params) => {
      calls.push(["remove-artist", params]);
    },
    removePlaylistSong: async (params) => {
      calls.push(["remove-playlist", params]);
    },
    updateAlbumSongOrder: async (params) => {
      calls.push(["order-album", params]);
    },
    updateArtistSongOrder: async (params) => {
      calls.push(["order-artist", params]);
    },
    updatePlaylistSongOrder: async (params) => {
      calls.push(["order-playlist", params]);
    },
  };

  assert.deepEqual(
    getCollectionSongOrderOperations({
      collectionId: 9,
      kind: "artist",
      songIds: [5, 3],
    }),
    [
      { collectionId: 9, kind: "artist", order: 1, songId: 5 },
      { collectionId: 9, kind: "artist", order: 2, songId: 3 },
    ],
  );
  assert.deepEqual(
    getCollectionSongRemoveOperation({
      collectionId: 9,
      kind: "playlist",
      songId: 5,
    }),
    { collectionId: 9, kind: "playlist", songId: 5 },
  );

  await updateCollectionSongOrderWithDependencies(
    { collectionId: 10, kind: "album", songIds: [3, 1] },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["order-album", { collectionId: 10, order: 1, songId: 3 }],
    ["order-album", { collectionId: 10, order: 2, songId: 1 }],
  ]);

  calls.length = 0;
  await updateCollectionSongOrderWithDependencies(
    { collectionId: 11, kind: "artist", songIds: [4] },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["order-artist", { collectionId: 11, order: 1, songId: 4 }],
  ]);

  calls.length = 0;
  await updateCollectionSongOrderWithDependencies(
    { collectionId: 12, kind: "playlist", songIds: [5, 6] },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["order-playlist", { collectionId: 12, order: 1, songId: 5 }],
    ["order-playlist", { collectionId: 12, order: 2, songId: 6 }],
  ]);

  calls.length = 0;
  await assert.rejects(
    () =>
      updateCollectionSongOrderWithDependencies(
        { collectionId: 1, kind: "playlist", songIds: [7] },
        dependencies,
      ),
    /protected playlist/,
  );
  assert.deepEqual(calls, []);

  await removeSongFromCollectionWithDependencies(
    { collectionId: 20, kind: "album", songId: 8 },
    dependencies,
  );
  await removeSongFromCollectionWithDependencies(
    { collectionId: 21, kind: "artist", songId: 9 },
    dependencies,
  );
  await removeSongFromCollectionWithDependencies(
    { collectionId: 22, kind: "playlist", songId: 10 },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["remove-album", { collectionId: 20, songId: 8 }],
    ["remove-artist", { collectionId: 21, songId: 9 }],
    ["remove-playlist", { collectionId: 22, songId: 10 }],
  ]);

  calls.length = 0;
  await assert.rejects(
    () =>
      removeSongFromCollectionWithDependencies(
        { collectionId: 2, kind: "playlist", songId: 11 },
        dependencies,
      ),
    /protected playlist/,
  );
  assert.deepEqual(calls, []);
}

function assertLibraryCollectionPreviewSmoke() {
  const getImagePath = (hash: string) => `/images/${hash}-small.jpg`;

  assert.deepEqual(getLibraryCollectionPreviewEmptyState(), {
    body: "Create a playlist, album, or artist once you have songs to organize.",
    title: "No collections yet",
  });
  assert.deepEqual(
    getLibraryCollectionPreviewSectionState({
      collections: {
        albums: [],
        artists: [],
        playlists: [],
      },
      totals: {
        albums: 0,
        artists: 0,
        playlists: 0,
      },
    }),
    {
      columns: [
        {
          key: "playlists",
          rows: [],
          title: "Playlists",
          total: 0,
          viewAllHref: "/(tabs)/library/playlists",
        },
        {
          key: "albums",
          rows: [],
          title: "Albums",
          total: 0,
          viewAllHref: "/(tabs)/library/albums",
        },
        {
          key: "artists",
          rows: [],
          title: "Artists",
          total: 0,
          viewAllHref: "/(tabs)/library/artists",
        },
      ],
    emptyState: {
      body:
        "Create a playlist, album, or artist once you have songs to organize.",
      title: "No collections yet",
    },
    },
  );

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
  assert.deepEqual(
    getLibraryCollectionPreviewRows([albums[0]!, artists[0]!, playlists[0]!]),
    [
      {
        collection: albums[0],
        href: "/(tabs)/library/album/1",
      },
      {
        collection: artists[0],
        href: "/(tabs)/library/artist/1",
      },
      {
        collection: playlists[0],
        href: "/(tabs)/library/playlist/2",
      },
    ],
  );
  assert.deepEqual(
    getLibraryCollectionPreviewSectionState({
      collections: {
        albums,
        artists,
        playlists,
      },
      totals: {
        albums: 4,
        artists: 3,
        playlists: 2,
      },
    }).columns,
    [
      {
        key: "playlists",
        rows: [
          {
            collection: playlists[0],
            href: "/(tabs)/library/playlist/2",
          },
        ],
        title: "Playlists",
        total: 2,
        viewAllHref: "/(tabs)/library/playlists",
      },
      {
        key: "albums",
        rows: [
          {
            collection: albums[0],
            href: "/(tabs)/library/album/1",
          },
          {
            collection: albums[1],
            href: "/(tabs)/library/album/2",
          },
        ],
        title: "Albums",
        total: 4,
        viewAllHref: "/(tabs)/library/albums",
      },
      {
        key: "artists",
        rows: [
          {
            collection: artists[0],
            href: "/(tabs)/library/artist/1",
          },
          {
            collection: artists[1],
            href: "/(tabs)/library/artist/2",
          },
        ],
        title: "Artists",
        total: 3,
        viewAllHref: "/(tabs)/library/artists",
      },
    ],
  );
  assert.equal(
    getLibraryCollectionPreviewUpdatedAt({
      albumUpdatedAt: new Date(30),
      artistUpdatedAt: new Date(20),
      playlistUpdatedAt: new Date(10),
    }),
    30,
  );
  assert.deepEqual(
    getLibraryCollectionPreviewErrors({
      albumError: null,
      artistError: new Error("artists failed"),
      playlistError: new Error("playlists failed"),
    }).map((error) => (error instanceof Error ? error.message : error)),
    ["playlists failed", "artists failed"],
  );
  assert.equal(
    isLibraryCollectionPreviewGroupEmpty({
      albums: [],
      artists: [],
      playlists: [],
    }),
    true,
  );
  assert.equal(
    isLibraryCollectionPreviewGroupEmpty({
      albums,
      artists: [],
      playlists: [],
    }),
    false,
  );
  const collectionPreviewResult = buildLibraryCollectionPreviewQueryResult({
    albumError: new Error("albums failed"),
    albumRows: [
      {
        albumCoverImage: "alpha-cover",
        albumId: 1,
        albumName: "Alpha Album",
        artistName: "Alpha Artist",
        songId: 20,
        year: 2026,
      },
    ],
    albumUpdatedAt: new Date(12),
    artistError: null,
    artistRows: [
      {
        albumId: 1,
        artistId: 1,
        artistName: "Alpha Artist",
        profileImage: "artist-profile",
        songId: 30,
      },
    ],
    artistUpdatedAt: new Date(14),
    getImagePath,
    limit: 1,
    playlistError: null,
    playlistRows: [
      {
        coverImage: "playlist-cover",
        playlistId: 1,
        playlistName: "First Playlist",
        songId: 10,
      },
      {
        coverImage: null,
        playlistId: 2,
        playlistName: "Second Playlist",
        songId: 11,
      },
    ],
    playlistUpdatedAt: new Date(13),
  });
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(collectionPreviewResult.collections).map(
        ([key, value]) => [key, value.length],
      ),
    ),
    { albums: 1, artists: 1, playlists: 1 },
  );
  assert.deepEqual(collectionPreviewResult.totals, {
    albums: 1,
    artists: 1,
    playlists: 2,
  });
  assert.equal(collectionPreviewResult.isEmpty, false);
  assert.equal(collectionPreviewResult.updatedAt, 14);
  assert.equal(collectionPreviewResult.errors.length, 1);
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
  const previewQueryResult = buildLibrarySongPreviewQueryResult({
    error: new Error("song smoke"),
    limit: 2,
    order: "asc",
    query: "a",
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
    updatedAt: new Date(42),
  });
  assert.deepEqual(
    previewQueryResult.songs.map((song) => song.id),
    [1, 2],
  );
  assert.equal(previewQueryResult.isEmpty, false);
  assert.equal(previewQueryResult.updatedAt, 42);
  assert.equal((previewQueryResult.error as Error).message, "song smoke");
  assert.equal(getLibrarySongPreviewQueryUpdatedAt(null), 0);
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
  assert.equal(
    getLibrarySongPreviewDetailHref(previews[0]!),
    "/(tabs)/library/song/1",
  );
  assert.equal(getLibrarySongPreviewPlayerHref(), "/player");
  assert.deepEqual(getLibrarySongPreviewPlayCommand(), {
    haptic: "light",
    href: "/player",
  });
  assert.deepEqual(getLibrarySongPreviewQueueCommand(), {
    haptic: "light",
  });
  const songPreviewActionEvents: unknown[] = [];
  const previewPlaybackItem = toLibrarySongPlaybackItem(previews[0]!);
  runLibrarySongPreviewPlayAction({
    playbackItem: previewPlaybackItem,
    playSong: (song) => {
      songPreviewActionEvents.push(["play", song.id]);
    },
    pushRoute: (href) => {
      songPreviewActionEvents.push(["route", href]);
    },
    sendHaptic: (haptic) => {
      songPreviewActionEvents.push(["haptic", haptic]);
    },
  });
  runLibrarySongPreviewQueueAction({
    addToQueue: (song) => {
      songPreviewActionEvents.push(["queue", song.id]);
    },
    playbackItem: previewPlaybackItem,
    sendHaptic: (haptic) => {
      songPreviewActionEvents.push(["haptic", haptic]);
    },
  });
  assert.deepEqual(songPreviewActionEvents, [
    ["haptic", "light"],
    ["play", 1],
    ["route", "/player"],
    ["haptic", "light"],
    ["queue", 1],
  ]);
  assert.deepEqual(getLibrarySongPreviewEmptyState(), {
    body: "Import audio files to start building your song library.",
    link: {
      href: "/(tabs)/import",
      label: "Import music",
    },
    title: "No songs yet",
  });
  assert.deepEqual(
    getLibrarySongPreviewListState({
      activeTrackId: previews[0]!.id,
      songs: previews,
    }),
    {
      emptyState: {
        body: "Import audio files to start building your song library.",
        link: {
          href: "/(tabs)/import",
          label: "Import music",
        },
        title: "No songs yet",
      },
      meta: "1 shown",
      rows: [
        {
          detailHref: "/(tabs)/library/song/1",
          rowState: {
            canPlay: true,
            isActive: true,
          },
          song: previews[0],
        },
      ],
      title: "Recent Songs",
    },
  );
  assert.deepEqual(
    getLibrarySongListControlsState({ order: "asc", sort: "artist" }),
    {
      orderButton: {
        haptic: "light",
        label: "Asc",
        nextOrder: "desc",
      },
      searchInput: {
        placeholder: "Search songs, artists, albums",
      },
      sortOptions: [
        { haptic: "light", isActive: false, label: "Recent", value: "recent" },
        { haptic: "light", isActive: false, label: "Title", value: "title" },
        { haptic: "light", isActive: true, label: "Artist", value: "artist" },
        { haptic: "light", isActive: false, label: "Album", value: "album" },
      ],
    },
  );
  assert.deepEqual(
    getLibrarySongListControlsState({ order: "desc", sort: "recent" }),
    {
      orderButton: {
        haptic: "light",
        label: "Desc",
        nextOrder: "asc",
      },
      searchInput: {
        placeholder: "Search songs, artists, albums",
      },
      sortOptions: [
        { haptic: "light", isActive: true, label: "Recent", value: "recent" },
        { haptic: "light", isActive: false, label: "Title", value: "title" },
        { haptic: "light", isActive: false, label: "Artist", value: "artist" },
        { haptic: "light", isActive: false, label: "Album", value: "album" },
      ],
    },
  );
  const songListControlEvents: unknown[] = [];
  runLibrarySongListSortSelectAction({
    order: "asc",
    sendHaptic: (haptic) => {
      songListControlEvents.push(["haptic", haptic]);
    },
    setSort: (sort) => {
      songListControlEvents.push(["sort", sort]);
    },
    sort: "album",
  });
  runLibrarySongListOrderToggleAction({
    order: "desc",
    sendHaptic: (haptic) => {
      songListControlEvents.push(["haptic", haptic]);
    },
    setOrder: (order) => {
      songListControlEvents.push(["order", order]);
    },
    sort: "recent",
  });
  assert.deepEqual(songListControlEvents, [
    ["haptic", "light"],
    ["sort", "album"],
    ["haptic", "light"],
    ["order", "asc"],
  ]);
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
  assert.deepEqual(
    getAddCollectionSongsStatusState({
      errors: [],
      formatTime: (updatedAt) => `smoke-${updatedAt}`,
      mutationError: null,
      updatedAt: 123,
    }),
    {
      isError: false,
      statusLabel: "Updated smoke-123",
      updatedLabel: "Updated smoke-123",
    },
  );
  assert.deepEqual(
    getAddCollectionSongsStatusState({
      errors: [],
      mutationError: null,
      updatedAt: 0,
    }),
    {
      isError: false,
      statusLabel: "Waiting for library data",
      updatedLabel: "Waiting for library data",
    },
  );
  assert.deepEqual(
    getAddCollectionSongsStatusState({
      errors: [new Error("query")],
      formatTime: (updatedAt) => `smoke-${updatedAt}`,
      mutationError: null,
      updatedAt: 123,
    }),
    {
      isError: true,
      statusLabel: "One or more song queries failed.",
      updatedLabel: "Updated smoke-123",
    },
  );
  assert.deepEqual(
    getAddCollectionSongsStatusState({
      errors: [new Error("query")],
      formatTime: (updatedAt) => `smoke-${updatedAt}`,
      mutationError: "Add failed.",
      updatedAt: 123,
    }),
    {
      isError: true,
      statusLabel: "Add failed.",
      updatedLabel: "Updated smoke-123",
    },
  );
  assert.equal(
    getAddCollectionSongsBackHref({
      collectionId: 7,
      kind: "playlist",
    }),
    "/(tabs)/library/playlist/7",
  );
  assert.deepEqual(
    getAddCollectionSongsBackLink({
      collectionId: 7,
      kind: "playlist",
    }),
    {
      href: "/(tabs)/library/playlist/7",
      label: "Back to collection",
    },
  );
  assert.deepEqual(
    getAddCollectionSongsFormState({
      collectionId: 7,
      kind: "playlist",
    }),
    {
      backLink: {
        href: "/(tabs)/library/playlist/7",
        label: "Back to collection",
      },
      header: {
        kicker: "Add songs",
        searchInput: {
          placeholder: "Search songs, artists, or albums",
          returnKeyType: "search",
        },
        subtitle: "Search your songs and add them to this collection.",
        title: "Add to playlist",
      },
    },
  );
  assert.deepEqual(getAddCollectionSongsHeaderState({ kind: "album" }), {
    kicker: "Add songs",
    searchInput: {
      placeholder: "Search songs, artists, or albums",
      returnKeyType: "search",
    },
    subtitle: "Search your songs and add them to this collection.",
    title: "Add to album",
  });

  const addCollectionSongsFormViewState = getAddCollectionSongsFormViewState({
    collectionId: 7,
    errors: [],
    kind: "playlist",
    mutationError: null,
    savingSongId: 1,
    selectedSongIds: new Set([1]),
    selectionState: {
      bulkAddLabel: "Add selected",
      canBulkAdd: true,
      isMutating: false,
      selectedAddableSongIds: [1],
      selectedCount: 1,
      selectionLabel: "1 selected",
    },
    songs: [
      {
        album: "First Album",
        artist: "First Artist",
        duration: 10_000,
        id: 1,
        isLinked: false,
        title: "Alpha",
      },
    ],
    updatedAt: 123,
  });
  assert.equal(
    addCollectionSongsFormViewState.formState.backLink.href,
    "/(tabs)/library/playlist/7",
  );
  assert.equal(addCollectionSongsFormViewState.rows[0]?.rowState.isSaving, true);
  assert.equal(
    addCollectionSongsFormViewState.statusState.statusLabel.startsWith(
      "Updated ",
    ),
    true,
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
  const addableResult = buildAddableCollectionSongsResult({
    linkedRows: [{ songId: 2 }],
    linkedRowsError: new Error("linked smoke"),
    linkedRowsUpdatedAt: new Date(30),
    query: "beta",
    songRows: [
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
    ],
    songRowsError: new Error("songs smoke"),
    songRowsUpdatedAt: new Date(40),
  });
  assert.deepEqual(
    addableResult.songs.map((song) => ({
      id: song.id,
      isLinked: song.isLinked,
    })),
    [{ id: 2, isLinked: true }],
  );
  assert.deepEqual(
    addableResult.errors.map((error) => (error as Error).message),
    ["songs smoke", "linked smoke"],
  );
  assert.equal(addableResult.updatedAt, 40);
  assert.equal(
    getAddableCollectionSongsUpdatedAt({
      linkedRowsUpdatedAt: null,
      songRowsUpdatedAt: null,
    }),
    0,
  );

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
  assert.deepEqual(
    Array.from(
      rowsToLinkedSongIds([{ songId: 7 }, { songId: null }, { songId: 9 }]),
    ),
    [7, 9],
  );
}

async function assertLibrarySongDetailSmoke() {
  const commandCalls: unknown[] = [];
  const songCommandDependencies: LibrarySongCommandDependencies = {
    deleteLibrarySong: async (songId) => {
      commandCalls.push(["delete", songId]);
    },
    setLibrarySongLiked: async (params) => {
      commandCalls.push(["liked", params]);
    },
    shareLibrarySongs: async (songs) => {
      commandCalls.push(["share", songs]);
    },
    updateLibrarySongMetadata: async (params) => {
      commandCalls.push(["metadata", params]);
    },
  };
  const detail = buildLibrarySongDetail({
    albumRows: [
      {
        coverImage: "beta-album-cover",
        id: 2,
        name: "Beta Album",
        track: 2,
        year: null,
      },
      {
        coverImage: "alpha-album-cover",
        id: 1,
        name: "Alpha Album",
        track: 1,
        year: 2026,
      },
      {
        coverImage: "alpha-album-cover",
        id: 1,
        name: "Alpha Album",
        track: 1,
        year: 2026,
      },
    ],
    artistRows: [
      { id: 2, name: "Beta Artist" },
      { id: 1, name: "Alpha Artist" },
      { id: 1, name: "Alpha Artist" },
    ],
    getImagePath: (hash) => `/images/${hash}-small.jpg`,
    likedRows: [{ id: 10 }],
    playlistRows: [
      { id: 5, name: "Smoke Playlist" },
      { id: 5, name: "Smoke Playlist" },
      { id: 6, name: null },
    ],
    songRow: {
      coverImage: "song-cover",
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
  assert.equal(detail.coverImagePath, "/images/song-cover-small.jpg");
  assert.equal(detail.relationshipSummary, "2 artists / 2 albums / 2 playlists");
  assert.equal(detail.isLiked, true);
  assert.equal(detail.isMissing, false);
  const detailQueryResult = buildLibrarySongDetailQueryResult({
    albumError: new Error("album detail smoke"),
    albumRows: [
      {
        coverImage: "album-cover",
        id: 1,
        name: "Alpha Album",
        track: 1,
        year: 2026,
      },
    ],
    albumUpdatedAt: new Date(20),
    artistError: null,
    artistRows: [{ id: 1, name: "Alpha Artist" }],
    artistUpdatedAt: new Date(30),
    getImagePath: (hash) => `/images/${hash}.jpg`,
    likedError: new Error("liked detail smoke"),
    likedRows: [],
    likedUpdatedAt: new Date(50),
    playlistError: null,
    playlistRows: [],
    playlistUpdatedAt: new Date(40),
    songError: new Error("song detail smoke"),
    songRow: {
      coverImage: null,
      duration: null,
      fileType: null,
      originalFileName: null,
      pathToFile: null,
      title: "Query Alpha",
    },
    songUpdatedAt: new Date(10),
  });
  assert.equal(detailQueryResult.detail.title, "Query Alpha");
  assert.equal(detailQueryResult.detail.coverImagePath, "/images/album-cover.jpg");
  assert.equal(detailQueryResult.detail.updatedAt, 50);
  assert.deepEqual(
    detailQueryResult.errors.map((error) => (error as Error).message),
    ["song detail smoke", "album detail smoke", "liked detail smoke"],
  );
  assert.equal(
    getLibrarySongDetailQueryUpdatedAt({
      albumUpdatedAt: null,
      artistUpdatedAt: null,
      likedUpdatedAt: null,
      playlistUpdatedAt: null,
      songUpdatedAt: null,
    }),
    0,
  );
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
  void toggleLibrarySongLikedCommandWithDependencies(
    { liked: false, songId: 42 },
    songCommandDependencies,
  );
  void deleteLibrarySongCommandWithDependencies(
    42,
    songCommandDependencies,
  );
  void exportLibrarySongCommandWithDependencies(
    { detail, songId: 42 },
    songCommandDependencies,
  );
  void updateLibrarySongMetadataCommandWithDependencies(
    {
      albumNames: "Alpha Album, Beta Album",
      artistNames: "Alpha Artist, Beta Artist",
      coverImageDataUrl: "data:image/png;base64,cover",
      id: 42,
      title: "Updated Alpha",
    },
    songCommandDependencies,
  );
  assert.deepEqual(commandCalls, [
    ["liked", { liked: false, songId: 42 }],
    ["delete", 42],
    [
      "share",
      [
        {
          id: 42,
          pathToFile: "/tmp/alpha.mp3",
          title: "Alpha",
        },
      ],
    ],
    [
      "metadata",
      {
        albumNames: "Alpha Album, Beta Album",
        artistNames: "Alpha Artist, Beta Artist",
        coverImageDataUrl: "data:image/png;base64,cover",
        id: 42,
        title: "Updated Alpha",
      },
    ],
  ]);
  assert.equal(
    buildLibrarySongDetail({
      albumRows: [
        {
          coverImage: "playlist-album-cover",
          id: 9,
          name: "Playlist Album",
          track: null,
          year: null,
        },
      ],
      artistRows: [],
      getImagePath: (hash) => `/images/${hash}-small.jpg`,
      likedRows: [],
      playlistRows: [{ id: 2, name: "Liked Songs" }],
      songRow: {
        coverImage: null,
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
  assert.equal(
    buildLibrarySongDetail({
      albumRows: [
        {
          coverImage: "fallback-album-cover",
          id: 3,
          name: "Fallback Album",
          track: null,
          year: null,
        },
      ],
      artistRows: [],
      getImagePath: (hash) => `/images/${hash}-small.jpg`,
      likedRows: [],
      playlistRows: [],
      songRow: {
        coverImage: null,
        duration: null,
        fileType: null,
        originalFileName: null,
        pathToFile: null,
        title: "Album cover fallback",
      },
      updatedAt: 44,
    }).coverImagePath,
    "/images/fallback-album-cover-small.jpg",
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
  assert.equal(getLibrarySongDetailPlayerHref(), "/player");
  assert.deepEqual(getLibrarySongPlaybackBlockedCommand(), {
    haptic: "error",
  });
  assert.deepEqual(getLibrarySongPlayCommand(), {
    haptic: "light",
    href: "/player",
  });
  assert.deepEqual(getLibrarySongQueueCommand(), {
    haptic: "light",
  });
  const songPlaybackItem = toLibrarySongDetailPlaybackItem({
    detail,
    songId: 42,
  });
  const songPlaybackActionEvents: unknown[] = [];
  const songPlaybackActions = {
    addToQueue: (song: typeof songPlaybackItem) => {
      songPlaybackActionEvents.push(["queue", song.id]);
    },
    playSong: (song: typeof songPlaybackItem) => {
      songPlaybackActionEvents.push(["play", song.id]);
    },
    pushRoute: (href: string) => {
      songPlaybackActionEvents.push(["route", href]);
    },
    sendHaptic: (haptic: string) => {
      songPlaybackActionEvents.push(["haptic", haptic]);
    },
  };
  runLibrarySongPlayAction({
    canPlay: false,
    playbackItem: songPlaybackItem,
    playSong: songPlaybackActions.playSong,
    pushRoute: songPlaybackActions.pushRoute,
    sendHaptic: songPlaybackActions.sendHaptic,
  });
  runLibrarySongPlayAction({
    canPlay: true,
    playbackItem: songPlaybackItem,
    playSong: songPlaybackActions.playSong,
    pushRoute: songPlaybackActions.pushRoute,
    sendHaptic: songPlaybackActions.sendHaptic,
  });
  runLibrarySongQueueAction({
    addToQueue: songPlaybackActions.addToQueue,
    canPlay: false,
    playbackItem: songPlaybackItem,
    sendHaptic: songPlaybackActions.sendHaptic,
  });
  runLibrarySongQueueAction({
    addToQueue: songPlaybackActions.addToQueue,
    canPlay: true,
    playbackItem: songPlaybackItem,
    sendHaptic: songPlaybackActions.sendHaptic,
  });
  assert.deepEqual(songPlaybackActionEvents, [
    ["haptic", "error"],
    ["haptic", "light"],
    ["play", 42],
    ["route", "/player"],
    ["haptic", "error"],
    ["haptic", "light"],
    ["queue", 42],
  ]);
  assert.equal(getLibrarySongDetailBackHref(), "/(tabs)/library");
  assert.deepEqual(getLibraryInvalidSongState(), {
    backLink: {
      href: "/(tabs)/library",
      label: "Back to Library",
    },
    body: "This route needs a numeric id.",
    kicker: "Song",
    title: "Invalid song",
  });
  assert.deepEqual(getLibrarySongDetailViewState({ detail, songId: 42 }), {
    actionLinks: {
      addToPlaylistHref: "/(tabs)/library/song/add-to-playlist/42",
      editHref: "/(tabs)/library/song/edit/42",
    },
    backLink: {
      href: "/(tabs)/library",
      label: "Back to Library",
    },
    relationshipSections: {
      albums: {
        emptyLabel: "No albums linked",
        items: [
          {
            detail: "Album / track 2",
            href: "/(tabs)/library/album/2",
            id: 2,
            title: "Beta Album",
          },
          {
            detail: "2026 / track 1",
            href: "/(tabs)/library/album/1",
            id: 1,
            title: "Alpha Album",
          },
        ],
        kind: "album",
        title: "Albums",
      },
      artists: {
        emptyLabel: "No artists linked",
        items: [
          {
            href: "/(tabs)/library/artist/2",
            id: 2,
            title: "Beta Artist",
          },
          {
            href: "/(tabs)/library/artist/1",
            id: 1,
            title: "Alpha Artist",
          },
        ],
        kind: "artist",
        title: "Artists",
      },
      playlists: {
        emptyLabel: "No playlists linked",
        items: [
          {
            href: "/(tabs)/library/playlist/5",
            id: 5,
            title: "Smoke Playlist",
          },
          {
            href: "/(tabs)/library/playlist/6",
            id: 6,
            title: "Untitled playlist",
          },
        ],
        kind: "playlist",
        title: "Playlists",
      },
    },
  });
  assert.equal(
    getLibrarySongDetailHref({ songId: 42 }),
    "/(tabs)/library/song/42",
  );
  assert.equal(
    getLibrarySongEditHref({ songId: 42 }),
    "/(tabs)/library/song/edit/42",
  );
  assert.equal(
    getLibrarySongAddToPlaylistHref({ songId: 42 }),
    "/(tabs)/library/song/add-to-playlist/42",
  );
  assert.deepEqual(getSongAddToPlaylistBackLink({ songId: 42 }), {
    href: "/(tabs)/library/song/42",
    label: "Song details",
  });
  assert.deepEqual(getSongAddToPlaylistHeaderState({ songId: 42 }), {
    backLink: {
      href: "/(tabs)/library/song/42",
      label: "Song details",
    },
    copy: {
      emptyLabel: "No playlists available",
      kicker: "Library",
      placeholder: "Search playlists",
      title: "Add to playlist",
    },
  });
  assert.deepEqual(
    getSongAddToPlaylistRowState({
      mutationState: {
        error: null,
        pendingPlaylistId: 7,
        successPlaylistId: null,
      },
      playlist: {
        detail: "3 songs",
        id: 7,
        imagePath: null,
        kind: "playlists",
        meta: "Playlist",
        title: "Road Trip",
      },
    }),
    {
      detailLabel: "Adding",
      imageInitial: "R",
      isAdded: false,
      isDisabled: true,
      isPending: true,
      metaLabel: "Playlist",
      playlist: {
        detail: "3 songs",
        id: 7,
        imagePath: null,
        kind: "playlists",
        meta: "Playlist",
        title: "Road Trip",
      },
    },
  );
  assert.deepEqual(
    getSongAddToPlaylistStatusState({
      hasListErrors: true,
      listStatusLabel: "Playlist query failed.",
      mutationState: initialSongAddToPlaylistMutationState,
      statusLabel: "Waiting for library data",
    }),
    {
      hasError: true,
      label: "Playlist query failed.",
    },
  );
  assert.deepEqual(
    getSelectableSongPlaylists([
      {
        detail: "2 songs",
        id: 1,
        imagePath: null,
        kind: "playlists",
        meta: "Playlist",
        title: "System",
      },
      {
        detail: "1 song",
        id: 2,
        imagePath: null,
        kind: "playlists",
        meta: "Playlist",
        title: "Liked Songs",
      },
      {
        detail: "3 songs",
        id: 7,
        imagePath: null,
        kind: "playlists",
        meta: "Playlist",
        title: "Road Trip",
      },
    ]),
    [
      {
        detail: "3 songs",
        id: 7,
        imagePath: null,
        kind: "playlists",
        meta: "Playlist",
        title: "Road Trip",
      },
    ],
  );
  assert.equal(
    getSongAddToPlaylistStatusLabel({
      mutationState: initialSongAddToPlaylistMutationState,
      playlistCount: 0,
      updatedAt: 0,
    }),
    "Create a playlist before adding this song.",
  );
  assert.equal(
    getSongAddToPlaylistStatusLabel({
      mutationState: {
        error: null,
        pendingPlaylistId: null,
        successPlaylistId: 7,
      },
      playlistCount: 1,
      updatedAt: 0,
    }),
    "Added to playlist",
  );
  const addToPlaylistControllerState = getSongAddToPlaylistControllerViewState({
    collections: [
      {
        detail: "2 songs",
        id: 1,
        imagePath: null,
        kind: "playlists",
        meta: "Playlist",
        title: "System",
      },
      {
        detail: "3 songs",
        id: 7,
        imagePath: null,
        kind: "playlists",
        meta: "Playlist",
        title: "Road Trip",
      },
    ],
    error: null,
    mutationState: {
      error: null,
      pendingPlaylistId: null,
      successPlaylistId: 7,
    },
    query: "road",
    songId: 42,
    updatedAt: 1_000,
  });
  assert.equal(addToPlaylistControllerState.copy.placeholder, "Search playlists");
  assert.equal(
    addToPlaylistControllerState.headerState.backLink.href,
    "/(tabs)/library/song/42",
  );
  assert.equal(
    addToPlaylistControllerState.listState.visibleCollections.length,
    1,
  );
  assert.equal(addToPlaylistControllerState.rowStates[0]?.isAdded, true);
  assert.equal(addToPlaylistControllerState.statusState.label, "Added to playlist");
  const addToPlaylistEvents: unknown[] = [];
  await runSongAddToPlaylistCommand({
    addLibraryCollectionSong: async ({ collectionId, kind, songId }) => {
      addToPlaylistEvents.push(["add", collectionId, kind, songId]);
    },
    playlistId: 7,
    sendHaptic: (haptic) => {
      addToPlaylistEvents.push(["haptic", haptic]);
    },
    setMutationState: (state) => {
      addToPlaylistEvents.push(["state", state]);
    },
    songId: 42,
  });
  await runSongAddToPlaylistCommand({
    addLibraryCollectionSong: async () => {
      throw new Error("playlist failed");
    },
    playlistId: 8,
    sendHaptic: (haptic) => {
      addToPlaylistEvents.push(["haptic", haptic]);
    },
    setMutationState: (state) => {
      addToPlaylistEvents.push(["state", state]);
    },
    songId: 42,
  });
  assert.deepEqual(addToPlaylistEvents, [
    [
      "state",
      { error: null, pendingPlaylistId: 7, successPlaylistId: null },
    ],
    ["add", 7, "playlist", 42],
    ["haptic", "success"],
    [
      "state",
      { error: null, pendingPlaylistId: null, successPlaylistId: 7 },
    ],
    [
      "state",
      { error: null, pendingPlaylistId: 8, successPlaylistId: null },
    ],
    ["haptic", "error"],
    [
      "state",
      {
        error: new Error("playlist failed"),
        pendingPlaylistId: null,
        successPlaylistId: null,
      },
    ],
  ]);
  const addToPlaylistControllerCommandEvents: unknown[] = [];
  const addToPlaylistCommands = createSongAddToPlaylistControllerCommands({
    addLibraryCollectionSong: async ({ collectionId, kind, songId }) => {
      addToPlaylistControllerCommandEvents.push([
        "add",
        collectionId,
        kind,
        songId,
      ]);
    },
    dispatchControls: (action) => {
      addToPlaylistControllerCommandEvents.push(["control", action]);
    },
    sendHaptic: (haptic) => {
      addToPlaylistControllerCommandEvents.push(["haptic", haptic]);
    },
    setMutationState: (state) => {
      addToPlaylistControllerCommandEvents.push(["state", state]);
    },
    songId: 42,
  });
  addToPlaylistCommands.setQuery("road");
  await addToPlaylistCommands.addToPlaylist(7);
  assert.deepEqual(addToPlaylistControllerCommandEvents, [
    ["control", { query: "road", type: "set-query" }],
    [
      "state",
      { error: null, pendingPlaylistId: 7, successPlaylistId: null },
    ],
    ["add", 7, "playlist", 42],
    ["haptic", "success"],
    [
      "state",
      { error: null, pendingPlaylistId: null, successPlaylistId: 7 },
    ],
  ]);
  const assembledAddToPlaylistController = getSongAddToPlaylistController({
    commands: addToPlaylistCommands,
    query: "road",
    viewState: addToPlaylistControllerState,
  });
  assert.equal(assembledAddToPlaylistController.query, "road");
  assert.deepEqual(
    assembledAddToPlaylistController.headerState,
    addToPlaylistControllerState.headerState,
  );
  assert.equal(
    assembledAddToPlaylistController.addToPlaylist,
    addToPlaylistCommands.addToPlaylist,
  );
  assert.equal(
    assembledAddToPlaylistController.setQuery,
    addToPlaylistCommands.setQuery,
  );
  assert.equal(getLibrarySongDeleteSuccessHref(), "/(tabs)/library");
  assert.deepEqual(getLibrarySongDeleteConfirmationCopy(detail), {
    body: "Delete Alpha?",
    cancelLabel: "Cancel",
    confirmLabel: "Delete",
    title: "Delete song",
  });
  const playableActionState = getLibrarySongDetailActionState({
    detail,
    isDeleting: false,
    isExporting: false,
    isTogglingLiked: false,
  });
  assert.deepEqual(
    playableActionState,
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
  assert.deepEqual(
    getLibrarySongDetailMutationActionState({
      detail,
      mutationState: {
        isDeleting: true,
        isExporting: true,
        isTogglingLiked: true,
      },
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
  assert.deepEqual(
    getLibrarySongDetailMutationControllerState({
      detail,
      mutationState: {
        error: "Song mutation failed.",
        isDeleting: false,
        isExporting: true,
        isTogglingLiked: false,
      },
    }),
    {
      actionState: {
        canDelete: true,
        canExport: false,
        canPlay: true,
        canToggleLiked: true,
        deleteLabel: "Delete",
        exportLabel: "Exporting",
        likedLabel: "Unlike",
      },
      error: "Song mutation failed.",
    },
  );
  assert.deepEqual(initialLibrarySongDetailMutationState, {
    error: null,
    isDeleting: false,
    isExporting: false,
    isTogglingLiked: false,
  });
  assert.deepEqual(
    librarySongDetailMutationReducer(initialLibrarySongDetailMutationState, {
      mutation: "toggle-liked",
      type: "begin",
    }),
    {
      ...initialLibrarySongDetailMutationState,
      error: null,
      isTogglingLiked: true,
    },
  );
  assert.deepEqual(
    librarySongDetailMutationReducer(
      {
        ...initialLibrarySongDetailMutationState,
        isExporting: true,
      },
      {
        mutation: "export-song",
        type: "finish",
      },
    ),
    initialLibrarySongDetailMutationState,
  );
  assert.deepEqual(
    librarySongDetailMutationReducer(initialLibrarySongDetailMutationState, {
      error: "Song could not be deleted.",
      type: "fail",
    }),
    {
      ...initialLibrarySongDetailMutationState,
      error: "Song could not be deleted.",
    },
  );
  assert.deepEqual(getLibrarySongDetailMutationBlockedCommand(), {
    haptic: "error",
  });
  assert.deepEqual(getLibrarySongDetailMutationStartCommand("export-song"), {
    action: {
      mutation: "export-song",
      type: "begin",
    },
  });
  assert.deepEqual(getLibrarySongDetailMutationFinishCommand("toggle-liked"), {
    action: {
      mutation: "toggle-liked",
      type: "finish",
    },
  });
  assert.deepEqual(getLibrarySongDeleteSuccessCommand(), {
    haptic: "success",
    href: "/(tabs)/library",
  });
  assert.deepEqual(getLibrarySongExportSuccessCommand(), {
    haptic: "success",
  });
  assert.deepEqual(getLibrarySongLikedSuccessCommand(), {
    haptic: "light",
  });
  const songMutationAttemptEvents: unknown[] = [];
  await runLibrarySongDetailMutationAttempt({
    dispatch: (action) => {
      songMutationAttemptEvents.push(["dispatch", action]);
    },
    mutation: "export-song",
    onSuccess: () => {
      songMutationAttemptEvents.push(["success"]);
    },
    run: async () => {
      songMutationAttemptEvents.push(["run"]);
    },
    sendHaptic: (haptic) => {
      songMutationAttemptEvents.push(["haptic", haptic]);
    },
  });
  await runLibrarySongDetailMutationAttempt({
    dispatch: (action) => {
      songMutationAttemptEvents.push(["dispatch", action]);
    },
    mutation: "toggle-liked",
    onSuccess: () => {
      songMutationAttemptEvents.push(["unexpected-success"]);
    },
    run: async () => {
      throw new Error("Liked failed");
    },
    sendHaptic: (haptic) => {
      songMutationAttemptEvents.push(["haptic", haptic]);
    },
  });
  assert.deepEqual(songMutationAttemptEvents, [
    [
      "dispatch",
      { mutation: "export-song", type: "begin" },
    ],
    ["run"],
    ["success"],
    [
      "dispatch",
      { mutation: "export-song", type: "finish" },
    ],
    [
      "dispatch",
      { mutation: "toggle-liked", type: "begin" },
    ],
    ["haptic", "error"],
    [
      "dispatch",
      { error: "Liked failed", type: "fail" },
    ],
    [
      "dispatch",
      { mutation: "toggle-liked", type: "finish" },
    ],
  ]);
  const songMutationCommandEvents: unknown[] = [];
  const dispatchSongMutationCommand = (
    action: LibrarySongDetailMutationAction,
  ) => {
    songMutationCommandEvents.push(["dispatch", action]);
  };
  const sendSongMutationHaptic = (haptic: string) => {
    songMutationCommandEvents.push(["haptic", haptic]);
  };
  const showSongDeleteConfirmation = async (
    shouldConfirm: boolean,
    shouldFailDelete = false,
  ) => {
    const confirmations: Promise<void>[] = [];
    runLibrarySongDeleteCommand({
      actionState: playableActionState,
      deleteLibrarySong: async (deletedSongId) => {
        songMutationCommandEvents.push(["delete", deletedSongId]);

        if (shouldFailDelete) {
          throw new Error("Delete failed");
        }
      },
      detail,
      dispatch: dispatchSongMutationCommand,
      removeFromQueue: (queuedSongId) => {
        songMutationCommandEvents.push(["remove-from-queue", queuedSongId]);
      },
      replaceRoute: (href) => {
        songMutationCommandEvents.push(["route", href]);
      },
      sendHaptic: sendSongMutationHaptic,
      showConfirmation: (params) => {
        songMutationCommandEvents.push([
          "confirm",
          params.title,
          params.body,
          params.cancelLabel,
          params.confirmLabel,
        ]);

        if (shouldConfirm) {
          confirmations.push(Promise.resolve(params.onConfirm()));
        }
      },
      songId: 42,
    });
    await Promise.all(confirmations);
  };
  runLibrarySongDeleteCommand({
    actionState: {
      ...playableActionState,
      canDelete: false,
    },
    deleteLibrarySong: async () => {
      songMutationCommandEvents.push(["unexpected-delete"]);
    },
    detail,
    dispatch: dispatchSongMutationCommand,
    removeFromQueue: (songId) => {
      songMutationCommandEvents.push(["unexpected-remove-from-queue", songId]);
    },
    replaceRoute: (href) => {
      songMutationCommandEvents.push(["unexpected-route", href]);
    },
    sendHaptic: sendSongMutationHaptic,
    showConfirmation: () => {
      songMutationCommandEvents.push(["unexpected-confirm"]);
    },
    songId: 42,
  });
  await showSongDeleteConfirmation(false);
  await showSongDeleteConfirmation(true);
  await showSongDeleteConfirmation(true, true);
  await runLibrarySongExportCommand({
    actionState: {
      ...playableActionState,
      canExport: false,
    },
    detail,
    dispatch: dispatchSongMutationCommand,
    exportLibrarySong: async () => {
      songMutationCommandEvents.push(["unexpected-export"]);
    },
    sendHaptic: sendSongMutationHaptic,
    songId: 42,
  });
  await runLibrarySongExportCommand({
    actionState: playableActionState,
    detail,
    dispatch: dispatchSongMutationCommand,
    exportLibrarySong: async (params) => {
      songMutationCommandEvents.push([
        "export",
        params.songId,
        params.detail.title,
      ]);
    },
    sendHaptic: sendSongMutationHaptic,
    songId: 42,
  });
  await runLibrarySongExportCommand({
    actionState: playableActionState,
    detail,
    dispatch: dispatchSongMutationCommand,
    exportLibrarySong: async () => {
      throw new Error("Export failed");
    },
    sendHaptic: sendSongMutationHaptic,
    songId: 42,
  });
  await runLibrarySongLikedCommand({
    actionState: {
      ...playableActionState,
      canToggleLiked: false,
    },
    detail,
    dispatch: dispatchSongMutationCommand,
    sendHaptic: sendSongMutationHaptic,
    songId: 42,
    toggleLibrarySongLiked: async () => {
      songMutationCommandEvents.push(["unexpected-liked"]);
    },
  });
  await runLibrarySongLikedCommand({
    actionState: playableActionState,
    detail,
    dispatch: dispatchSongMutationCommand,
    sendHaptic: sendSongMutationHaptic,
    songId: 42,
    toggleLibrarySongLiked: async (params) => {
      songMutationCommandEvents.push(["liked", params.songId, params.liked]);
    },
  });
  await runLibrarySongLikedCommand({
    actionState: playableActionState,
    detail,
    dispatch: dispatchSongMutationCommand,
    sendHaptic: sendSongMutationHaptic,
    songId: 42,
    toggleLibrarySongLiked: async () => {
      throw new Error("Liked failed");
    },
  });
  assert.deepEqual(songMutationCommandEvents, [
    ["haptic", "error"],
    ["confirm", "Delete song", "Delete Alpha?", "Cancel", "Delete"],
    ["confirm", "Delete song", "Delete Alpha?", "Cancel", "Delete"],
    ["dispatch", { mutation: "delete-song", type: "begin" }],
    ["delete", 42],
    ["remove-from-queue", 42],
    ["haptic", "success"],
    ["route", "/(tabs)/library"],
    ["dispatch", { mutation: "delete-song", type: "finish" }],
    ["confirm", "Delete song", "Delete Alpha?", "Cancel", "Delete"],
    ["dispatch", { mutation: "delete-song", type: "begin" }],
    ["delete", 42],
    ["haptic", "error"],
    ["dispatch", { error: "Delete failed", type: "fail" }],
    ["dispatch", { mutation: "delete-song", type: "finish" }],
    ["haptic", "error"],
    ["dispatch", { mutation: "export-song", type: "begin" }],
    ["export", 42, "Alpha"],
    ["haptic", "success"],
    ["dispatch", { mutation: "export-song", type: "finish" }],
    ["dispatch", { mutation: "export-song", type: "begin" }],
    ["haptic", "error"],
    ["dispatch", { error: "Export failed", type: "fail" }],
    ["dispatch", { mutation: "export-song", type: "finish" }],
    ["haptic", "error"],
    ["dispatch", { mutation: "toggle-liked", type: "begin" }],
    ["liked", 42, false],
    ["haptic", "light"],
    ["dispatch", { mutation: "toggle-liked", type: "finish" }],
    ["dispatch", { mutation: "toggle-liked", type: "begin" }],
    ["haptic", "error"],
    ["dispatch", { error: "Liked failed", type: "fail" }],
    ["dispatch", { mutation: "toggle-liked", type: "finish" }],
  ]);
  assert.deepEqual(
    getLibrarySongDetailStatusState({
      actionState: playableActionState,
      detail,
      errors: [],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      mutationError: null,
    }),
    {
      isError: false,
      statusLabel: "Updated time:42",
      updatedLabel: "Updated time:42",
    },
  );
  assert.deepEqual(
    getLibrarySongDetailStatusState({
      actionState: playableActionState,
      detail,
      errors: [new Error("query")],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      mutationError: null,
    }),
    {
      isError: true,
      statusLabel: "One or more song detail queries failed.",
      updatedLabel: "Updated time:42",
    },
  );
  assert.deepEqual(
    getLibrarySongDetailStatusState({
      actionState: playableActionState,
      detail,
      errors: [new Error("query")],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      mutationError: "Export failed.",
    }),
    {
      isError: true,
      statusLabel: "Export failed.",
      updatedLabel: "Updated time:42",
    },
  );
  assert.equal(
    getLibrarySongDetailUpdatedLabel({
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      updatedAt: 0,
    }),
    "Waiting for song data",
  );
  const librarySongDetailScreenViewState = getLibrarySongDetailScreenViewState({
    actionState: playableActionState,
    detail,
    errors: [],
    mutationError: null,
    songId: 42,
  });
  assert.equal(
    librarySongDetailScreenViewState.viewState.actionLinks.editHref,
    "/(tabs)/library/song/edit/42",
  );
  assert.equal(librarySongDetailScreenViewState.statusState.isError, false);
  assert.deepEqual(buildLibrarySongEditFormState(detail), {
    albumNames: "Alpha Album, Beta Album",
    artistNames: "Alpha Artist, Beta Artist",
    coverImage: null,
    title: "Alpha",
  });
  const songEditState = getInitialLibrarySongEditControllerState();
  assert.deepEqual(songEditState, {
    albumNames: "",
    artistNames: "",
    coverImage: null,
    errorMessage: null,
    isSaving: false,
    loadedSongId: null,
    title: "",
  });
  assert.deepEqual(getLibrarySongEditHydrateAction({ detail, songId: 42 }), {
    detail,
    songId: 42,
    type: "hydrate",
  });
  assert.deepEqual(
    getLibrarySongEditChangeFieldAction({
      field: "title",
      value: "Updated",
    }),
    {
      field: "title",
      type: "change-field",
      value: "Updated",
    },
  );
  assert.deepEqual(
    librarySongEditControllerReducer(
      songEditState,
      getLibrarySongEditHydrateAction({ detail, songId: 42 }),
    ),
    {
      ...songEditState,
      albumNames: "Alpha Album, Beta Album",
      artistNames: "Alpha Artist, Beta Artist",
      coverImage: null,
      loadedSongId: 42,
      title: "Alpha",
    },
  );
  assert.deepEqual(
    librarySongEditControllerReducer(
      {
        ...songEditState,
        loadedSongId: 42,
        title: "Local Edit",
      },
      getLibrarySongEditHydrateAction({ detail, songId: 42 }),
    ),
    {
      ...songEditState,
      loadedSongId: 42,
      title: "Local Edit",
    },
  );
  assert.deepEqual(
    librarySongEditControllerReducer(
      songEditState,
      getLibrarySongEditChangeFieldAction({
        field: "title",
        value: "Updated",
      }),
    ),
    {
      ...songEditState,
      title: "Updated",
    },
  );
  assert.deepEqual(
    librarySongEditControllerReducer(songEditState, {
      coverImage: {
        dataUrl: "data:image/jpeg;base64,cover",
        fileName: "cover.jpg",
      },
      type: "pick-cover-image",
    }),
    {
      ...songEditState,
      coverImage: {
        dataUrl: "data:image/jpeg;base64,cover",
        fileName: "cover.jpg",
      },
    },
  );
  assert.deepEqual(
    getLibrarySongEditBeginSaveAction(),
    {
      type: "begin-save",
    },
  );
  assert.deepEqual(
    getLibrarySongEditFinishSaveAction(),
    {
      type: "finish-save",
    },
  );
  assert.deepEqual(
    librarySongEditControllerReducer(
      songEditState,
      getLibrarySongEditBeginSaveAction(),
    ),
    {
      ...songEditState,
      errorMessage: null,
      isSaving: true,
    },
  );
  assert.deepEqual(
    librarySongEditControllerReducer(
      {
        ...songEditState,
        isSaving: true,
      },
      getLibrarySongEditFinishSaveAction(),
    ),
    songEditState,
  );
  assert.deepEqual(
    librarySongEditControllerReducer(songEditState, {
      errorMessage: "Song could not be saved.",
      type: "fail",
    }),
    {
      ...songEditState,
      errorMessage: "Song could not be saved.",
    },
  );
  assert.deepEqual(getLibrarySongEditFieldState(), {
    albumNames: {
      label: "Albums",
      placeholder: "Album names",
      returnKeyType: "done",
    },
    artistNames: {
      label: "Artists",
      placeholder: "Artist names",
      returnKeyType: "next",
    },
    title: {
      label: "Title",
      placeholder: "Song title",
      returnKeyType: "next",
    },
  });
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail,
      isSaving: false,
      songId: 42,
      title: " Alpha ",
    }),
    {
      cancelHref: "/(tabs)/library/song/42",
      canPickCoverImage: true,
      canSave: true,
      saveLabel: "Save",
    },
  );
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail,
      isSaving: false,
      songId: 42,
      title: "   ",
    }),
    {
      cancelHref: "/(tabs)/library/song/42",
      canPickCoverImage: true,
      canSave: false,
      saveLabel: "Save",
    },
  );
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail,
      isSaving: true,
      songId: 42,
      title: "Alpha",
    }),
    {
      cancelHref: "/(tabs)/library/song/42",
      canPickCoverImage: false,
      canSave: false,
      saveLabel: "Saving",
    },
  );
  assert.deepEqual(
    getLibrarySongEditControllerResultState({
      detail,
      formState: {
        ...songEditState,
        albumNames: "Controller Album",
        artistNames: "Controller Artist",
        errorMessage: "Controller error.",
        isSaving: true,
        title: "Controller Title",
      },
      songId: 42,
    }),
    {
      actionState: {
        cancelHref: "/(tabs)/library/song/42",
        canPickCoverImage: false,
        canSave: false,
        saveLabel: "Saving",
      },
      albumNames: "Controller Album",
      artistNames: "Controller Artist",
      coverImage: null,
      errorMessage: "Controller error.",
      title: "Controller Title",
    },
  );
  assert.deepEqual(
    getLibrarySongEditStatusState({
      detail,
      errors: [],
      mutationError: null,
    }),
    {
      isError: false,
      statusLabel: "Separate multiple artists or albums with commas.",
    },
  );
  assert.deepEqual(
    getLibrarySongEditStatusState({
      detail,
      errors: [new Error("query")],
      mutationError: null,
    }),
    {
      isError: true,
      statusLabel: "One or more song edit queries failed.",
    },
  );
  assert.deepEqual(
    getLibrarySongEditStatusState({
      detail,
      errors: [new Error("query")],
      mutationError: "Song save failed.",
    }),
    {
      isError: true,
      statusLabel: "Song save failed.",
    },
  );
  const librarySongEditScreenViewState = getLibrarySongEditScreenViewState({
    detail,
    errors: [],
    mutationError: null,
  });
  assert.equal(
    librarySongEditScreenViewState.fieldState.title.placeholder,
    "Song title",
  );
  assert.equal(librarySongEditScreenViewState.statusState.isError, false);
  assert.equal(
    getLibrarySongEditErrorMessage(new Error("Song edit smoke failure")),
    "Song edit smoke failure",
  );
  assert.equal(
    getLibrarySongEditErrorMessage(null),
    "Song could not be saved.",
  );
  assert.deepEqual(getLibrarySongEditBlockedCommand(), {
    haptic: "error",
  });
  assert.deepEqual(
    getLibrarySongEditCoverPickedCommand({
      dataUrl: "data:image/jpeg;base64,cover",
      fileName: "cover.jpg",
    }),
    {
      action: {
        coverImage: {
          dataUrl: "data:image/jpeg;base64,cover",
          fileName: "cover.jpg",
        },
        type: "pick-cover-image",
      },
      haptic: "light",
    },
  );
  assert.deepEqual(
    getLibrarySongEditFailureCommand(new Error("Song edit smoke failure")),
    {
      action: {
        errorMessage: "Song edit smoke failure",
        type: "fail",
      },
      haptic: "error",
    },
  );
  assert.deepEqual(getLibrarySongEditSaveSuccessCommand({ songId: 42 }), {
    haptic: "success",
    href: "/(tabs)/library/song/42",
  });
  const songEditCommandEvents: unknown[] = [];
  const dispatchSongEditCommand = (action: LibrarySongEditControllerAction) => {
    songEditCommandEvents.push(["dispatch", action]);
  };
  const sendSongEditHaptic = (haptic: string) => {
    songEditCommandEvents.push(["haptic", haptic]);
  };
  const replaceSongEditRoute = (href: string) => {
    songEditCommandEvents.push(["route", href]);
  };
  await runLibrarySongEditCoverPickCommand({
    canPickCoverImage: false,
    dispatch: dispatchSongEditCommand,
    pickCoverImage: async () => {
      songEditCommandEvents.push(["unexpected-pick"]);
      return null;
    },
    sendHaptic: sendSongEditHaptic,
  });
  await runLibrarySongEditCoverPickCommand({
    canPickCoverImage: true,
    dispatch: dispatchSongEditCommand,
    pickCoverImage: async () => null,
    sendHaptic: sendSongEditHaptic,
  });
  await runLibrarySongEditCoverPickCommand({
    canPickCoverImage: true,
    dispatch: dispatchSongEditCommand,
    pickCoverImage: async () => ({
      dataUrl: "data:image/jpeg;base64,cover",
      fileName: "cover.jpg",
    }),
    sendHaptic: sendSongEditHaptic,
  });
  await runLibrarySongEditCoverPickCommand({
    canPickCoverImage: true,
    dispatch: dispatchSongEditCommand,
    pickCoverImage: async () => {
      throw new Error("Cover failed");
    },
    sendHaptic: sendSongEditHaptic,
  });
  const editableSongState = {
    ...songEditState,
    albumNames: "Alpha Album",
    artistNames: "Alpha Artist",
    coverImage: {
      dataUrl: "data:image/png;base64,updated-cover",
      fileName: "updated-cover.png",
    },
    title: "Updated Alpha",
  };
  await runLibrarySongEditSaveCommand({
    canSave: false,
    dispatch: dispatchSongEditCommand,
    formState: editableSongState,
    replaceRoute: replaceSongEditRoute,
    sendHaptic: sendSongEditHaptic,
    songId: 42,
    updateLibrarySongMetadata: async () => {
      songEditCommandEvents.push(["unexpected-save"]);
    },
  });
  await runLibrarySongEditSaveCommand({
    canSave: true,
    dispatch: dispatchSongEditCommand,
    formState: editableSongState,
    replaceRoute: replaceSongEditRoute,
    sendHaptic: sendSongEditHaptic,
    songId: 43,
    updateLibrarySongMetadata: async (params) => {
      songEditCommandEvents.push(["save", params]);
    },
  });
  await runLibrarySongEditSaveCommand({
    canSave: true,
    dispatch: dispatchSongEditCommand,
    formState: editableSongState,
    replaceRoute: replaceSongEditRoute,
    sendHaptic: sendSongEditHaptic,
    songId: 44,
    updateLibrarySongMetadata: async () => {
      throw new Error("Save failed");
    },
  });
  assert.deepEqual(songEditCommandEvents, [
    ["haptic", "error"],
    [
      "dispatch",
      {
        coverImage: {
          dataUrl: "data:image/jpeg;base64,cover",
          fileName: "cover.jpg",
        },
        type: "pick-cover-image",
      },
    ],
    ["haptic", "light"],
    ["haptic", "error"],
    ["dispatch", { errorMessage: "Cover failed", type: "fail" }],
    ["haptic", "error"],
    ["dispatch", { type: "begin-save" }],
    [
      "save",
      {
        albumNames: "Alpha Album",
        artistNames: "Alpha Artist",
        coverImageDataUrl: "data:image/png;base64,updated-cover",
        id: 43,
        title: "Updated Alpha",
      },
    ],
    ["haptic", "success"],
    ["route", "/(tabs)/library/song/43"],
    ["dispatch", { type: "finish-save" }],
    ["dispatch", { type: "begin-save" }],
    ["haptic", "error"],
    ["dispatch", { errorMessage: "Save failed", type: "fail" }],
    ["dispatch", { type: "finish-save" }],
  ]);
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
  assert.deepEqual(
    getLibrarySongDetailMutationFailureCommand({
      caughtError: new Error("Song detail mutation failed"),
      mutation: "delete-song",
    }),
    {
      action: {
        error: "Song detail mutation failed",
        type: "fail",
      },
      haptic: "error",
    },
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
  const missingActionState = getLibrarySongDetailActionState({
    detail: missing,
    isDeleting: false,
    isExporting: false,
    isTogglingLiked: false,
  });
  assert.deepEqual(
    getLibrarySongDetailStatusState({
      actionState: missingActionState,
      detail: missing,
      errors: [],
      mutationError: null,
    }),
    {
      isError: false,
      statusLabel: "Song missing from database.",
      updatedLabel: "Waiting for song data",
    },
  );
  assert.deepEqual(buildLibrarySongEditFormState(missing), {
    albumNames: "",
    artistNames: "",
    coverImage: null,
    title: "",
  });
  assert.deepEqual(
    getLibrarySongEditStatusState({
      detail: missing,
      errors: [],
      mutationError: null,
    }),
    {
      isError: false,
      statusLabel: "Song missing from database.",
    },
  );
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail: missing,
      isSaving: false,
      songId: 404,
      title: "Recovered title",
    }),
    {
      cancelHref: "/(tabs)/library/song/404",
      canPickCoverImage: false,
      canSave: false,
      saveLabel: "Save",
    },
  );
  assert.deepEqual(
    missingActionState,
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
  const unplayable = buildLibrarySongDetail({
    albumRows: [],
    artistRows: [],
    likedRows: [],
    playlistRows: [],
    songRow: {
      coverImage: null,
      duration: null,
      fileType: null,
      originalFileName: "no-path.mp3",
      pathToFile: null,
      title: "No Path",
    },
    updatedAt: 0,
  });
  assert.deepEqual(
    getLibrarySongDetailStatusState({
      actionState: getLibrarySongDetailActionState({
        detail: unplayable,
        isDeleting: false,
        isExporting: false,
        isTogglingLiked: false,
      }),
      detail: unplayable,
      errors: [],
      mutationError: null,
    }),
    {
      isError: false,
      statusLabel: "Song has no playable file path.",
      updatedLabel: "Waiting for song data",
    },
  );
}

async function assertLibrarySongDeleteExecutorSmoke() {
  const calls: string[] = [];
  const rowDependencies: LibrarySongDeleteRowDependencies = {
    deleteAlbumSongRows: async (songId) => {
      calls.push(`album-songs:${songId}`);
    },
    deleteArtistSongRows: async (songId) => {
      calls.push(`artist-songs:${songId}`);
    },
    deletePlaylistSongRows: async (songId) => {
      calls.push(`playlist-songs:${songId}`);
    },
    deleteSongRow: async (songId) => {
      calls.push(`song:${songId}`);
    },
  };
  let documentDirectory: string | null = "file:///documents/";
  const fileDependencies: LibrarySongFileDependencies = {
    deletePath: async (path, options) => {
      calls.push(`files:${path}:${options?.idempotent ?? false}`);
    },
    get documentDirectory() {
      return documentDirectory;
    },
  };
  const deleteDependencies: LibrarySongDeleteDependencies = {
    deleteLibrarySongFiles: async (songId) => {
      calls.push(`delete-files:${songId}`);
    },
    deleteLibrarySongRows: async (songId) => {
      calls.push(`delete-rows:${songId}`);
    },
  };

  assert.equal(
    getLibrarySongDirectoryPath({
      documentDirectory: "file:///documents/",
      songId: 42,
    }),
    "file:///documents/library/42",
  );

  await deleteLibrarySongRowsWithDependencies(42, rowDependencies);
  assert.deepEqual(calls, [
    "album-songs:42",
    "artist-songs:42",
    "playlist-songs:42",
    "song:42",
  ]);

  calls.length = 0;
  await deleteLibrarySongFilesForLibraryWithDependencies(42, fileDependencies);
  assert.deepEqual(calls, ["files:file:///documents/library/42:true"]);

  calls.length = 0;
  documentDirectory = null;
  await deleteLibrarySongFilesForLibraryWithDependencies(43, fileDependencies);
  assert.deepEqual(calls, []);

  calls.length = 0;
  await deleteLibrarySongWithDependencies(44, deleteDependencies);
  assert.deepEqual(calls, ["delete-rows:44", "delete-files:44"]);
}

async function assertLibrarySongExportSnapshotExecutorSmoke() {
  const calls: string[] = [];
  let snapshotAtLastExport: string | null | undefined = "digest:current";
  let songRow: LibrarySongExportSnapshotSongRow = {
    coverImage: "song-cover",
    duration: 123_000,
    fileType: "audio/mpeg",
    snapshotAtLastExport: "digest:current",
    title: "Smoke Song",
  };
  const dependencies: LibrarySongExportSnapshotDependencies = {
    digestSnapshot: async (input) => {
      calls.push(`digest:${input}`);
      return `digest:${input}`;
    },
    loadAlbumRows: async (songId) => {
      calls.push(`albums:${songId}`);
      return [
        { coverImage: "beta-cover", name: "Beta", year: null },
        { coverImage: "alpha-cover", name: "Alpha", year: 2026 },
      ];
    },
    loadArtistRows: async (songId) => {
      calls.push(`artists:${songId}`);
      return [{ name: "Beta Artist" }, { name: "Alpha Artist" }];
    },
    loadSnapshotAtLastExport: async (songId) => {
      calls.push(`snapshot:${songId}`);
      return snapshotAtLastExport;
    },
    loadSongRow: async (songId) => {
      calls.push(`song:${songId}`);
      return songRow;
    },
    updateSnapshotAtLastExport: async ({ snapshotAtLastExport, songId }) => {
      calls.push(`update:${songId}:${snapshotAtLastExport}`);
    },
  };
  const snapshotInput = getLibrarySongExportSnapshotInput({
    albums: [
      { coverImage: "beta-cover", name: "Beta", year: null },
      { coverImage: "alpha-cover", name: "Alpha", year: 2026 },
    ],
    artists: [{ name: "Beta Artist" }, { name: "Alpha Artist" }],
    song: songRow,
  });

  assert.equal(
    snapshotInput,
    "Smoke Song-123000-audio/mpeg-song-cover-Alpha Artist,Beta Artist-Alpha2026alpha-cover,Betabeta-cover",
  );
  assert.equal(
    await getLibrarySongSnapshotHashWithDependencies(42, dependencies),
    `digest:${snapshotInput}`,
  );
  assert.deepEqual(calls, [
    "song:42",
    "albums:42",
    "artists:42",
    `digest:${snapshotInput}`,
  ]);

  calls.length = 0;
  snapshotAtLastExport = undefined;
  assert.equal(
    await isLibrarySongSnapshotStaleWithDependencies(43, dependencies),
    null,
  );
  assert.deepEqual(calls, ["snapshot:43"]);

  calls.length = 0;
  snapshotAtLastExport = null;
  assert.equal(
    await isLibrarySongSnapshotStaleWithDependencies(44, dependencies),
    true,
  );
  assert.deepEqual(calls, ["snapshot:44"]);

  calls.length = 0;
  snapshotAtLastExport = `digest:${snapshotInput}`;
  assert.equal(
    await isLibrarySongSnapshotStaleWithDependencies(45, dependencies),
    false,
  );
  assert.deepEqual(calls, [
    "snapshot:45",
    "song:45",
    "albums:45",
    "artists:45",
    `digest:${snapshotInput}`,
  ]);

  calls.length = 0;
  snapshotAtLastExport = "old-digest";
  assert.equal(
    await isLibrarySongSnapshotStaleWithDependencies(46, dependencies),
    true,
  );
  assert.deepEqual(calls, [
    "snapshot:46",
    "song:46",
    "albums:46",
    "artists:46",
    `digest:${snapshotInput}`,
  ]);

  calls.length = 0;
  await markLibrarySongAsExportedWithDependencies(47, dependencies);
  assert.deepEqual(calls, [
    "song:47",
    "albums:47",
    "artists:47",
    `digest:${snapshotInput}`,
    `update:47:digest:${snapshotInput}`,
  ]);

  songRow = { ...songRow, title: null };
  await assert.rejects(
    () =>
      getLibrarySongSnapshotHashWithDependencies(48, {
        ...dependencies,
        loadSongRow: async () => null,
      }),
    /Song 48 not found/,
  );
}

function assertEditCollectionQuerySmoke() {
  const getImagePath = (hash: string) => `/images/${hash}-small.jpg`;
  const editAlbumRowResult = buildEditAlbumRowQueryResult({
    albumError: null,
    albumRows: [{ coverImage: "album-cover", name: "Smoke Album", year: 2026 }],
    albumUpdatedAt: new Date(20),
    artistRows: [
      { id: 2, name: "Beta Artist" },
      { id: 1, name: "Alpha Artist" },
    ],
    artistRowsError: new Error("artist rows smoke"),
    artistRowsUpdatedAt: new Date(30),
  });
  assert.equal(editAlbumRowResult.row?.name, "Smoke Album");
  assert.deepEqual(
    editAlbumRowResult.artistRows.map((artist) => artist.id),
    [2, 1],
  );
  assert.equal(
    (editAlbumRowResult.error as Error).message,
    "artist rows smoke",
  );
  assert.equal(editAlbumRowResult.updatedAt?.getTime(), 30);
  assert.equal(
    getEditAlbumRowQueryUpdatedAt({
      albumUpdatedAt: undefined,
      artistRowsUpdatedAt: undefined,
    }),
    undefined,
  );
  const editArtistRowResult = buildEditCollectionRowQueryResult({
    error: new Error("artist smoke"),
    rows: [{ name: "Smoke Artist", profileImage: "artist-profile" }],
    updatedAt: new Date(40),
  });
  assert.equal((editArtistRowResult.error as Error).message, "artist smoke");
  assert.deepEqual(editArtistRowResult.row, {
    name: "Smoke Artist",
    profileImage: "artist-profile",
  });
  assert.equal(editArtistRowResult.updatedAt?.getTime(), 40);
  const editAlbumQueryResult = buildEditAlbumCollectionQueryResult({
    album: editAlbumRowResult,
    getImagePath,
  });
  assert.equal(editAlbumQueryResult.name, "Smoke Album");
  assert.equal(editAlbumQueryResult.artistNames, "Alpha Artist, Beta Artist");
  assert.equal(editAlbumQueryResult.imagePath, "/images/album-cover-small.jpg");
  assert.equal(editAlbumQueryResult.updatedAt?.getTime(), 30);
  assert.equal(
    (editAlbumQueryResult.error as Error).message,
    "artist rows smoke",
  );
  assert.deepEqual(
    buildEditArtistCollectionQueryResult({
      artist: editArtistRowResult,
      getImagePath,
    }),
    {
      artistNames: "",
      error: editArtistRowResult.error,
      imagePath: "/images/artist-profile-small.jpg",
      isMissing: false,
      name: "Smoke Artist",
      updatedAt: new Date(40),
      year: "",
    },
  );
  assert.equal(
    buildEditPlaylistCollectionQueryResult({
      getImagePath,
      playlist: {
        error: null,
        row: undefined,
        updatedAt: new Date(50),
      },
    }).isMissing,
    true,
  );

  const album = buildEditCollectionState({
    albumArtistRows: [
      { id: 2, name: "Beta Artist" },
      { id: 1, name: "Alpha Artist" },
      { id: 3, name: null },
    ],
    albumRow: { coverImage: "album-cover", name: "Smoke Album", year: 2026 },
    getImagePath,
    hasLoaded: true,
    kind: "album",
  });
  assert.equal(album.name, "Smoke Album");
  assert.equal(album.artistNames, "Alpha Artist, Beta Artist");
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

async function assertCollectionFormSmoke() {
  assert.equal(getCollectionFormBackHref(), "/(tabs)/library");
  assert.deepEqual(getCollectionFormBackLink(), {
    href: "/(tabs)/library",
    label: "Back to Library",
  });
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
  assert.equal(
    getEditCollectionFormSubtitle(),
    "Update the name, artwork, and details shown across your library.",
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
  assert.equal(getCollectionFormImageLabel("album"), "Cover image");
  assert.equal(getCollectionFormImageLabel("artist"), "Profile image");
  assert.equal(getCollectionFormImageLabel("playlist"), "Cover image");
  assert.deepEqual(getCollectionFormFieldState("album"), {
    artistNamesPlaceholder: "Artist names",
    artistNamesReturnKeyType: "done",
    nameReturnKeyType: "next",
    showsArtistNames: true,
    showsYear: true,
    yearPlaceholder: "Album year",
    yearReturnKeyType: "done",
  });
  assert.deepEqual(getCollectionFormFieldState("artist"), {
    artistNamesPlaceholder: "Artist names",
    artistNamesReturnKeyType: "done",
    nameReturnKeyType: "done",
    showsArtistNames: false,
    showsYear: false,
    yearPlaceholder: "Album year",
    yearReturnKeyType: "done",
  });
  assert.deepEqual(getCollectionFormFieldState("playlist"), {
    artistNamesPlaceholder: "Artist names",
    artistNamesReturnKeyType: "done",
    nameReturnKeyType: "done",
    showsArtistNames: false,
    showsYear: false,
    yearPlaceholder: "Album year",
    yearReturnKeyType: "done",
  });
  assert.equal(getSavedCollectionFormImageLabel("album"), "Saved cover image");
  assert.equal(
    getSavedCollectionFormImageLabel("artist"),
    "Saved profile image",
  );
  assert.equal(
    getSavedCollectionFormImageLabel("playlist"),
    "Saved cover image",
  );
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
  assert.equal(parseAlbumYearInput("0007"), 7);
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
  assert.deepEqual(
    getCollectionFormControllerResultState({
      fallbackInitial: "C",
      formState: {
        artistNames: "",
        error: null,
        image: null,
        isDirty: true,
        isSaving: true,
        name: "  Smoke Album  ",
        year: "",
      },
      saveLabel: "Save album",
      savingLabel: "Saving album",
    }),
    {
      actionState: {
        canEdit: false,
        canPickImage: false,
        canSave: false,
        hasName: true,
      },
      imageInitial: "S",
      saveLabel: "Saving album",
    },
  );
  assert.deepEqual(
    getCollectionFormControllerResultState({
      fallbackInitial: "P",
      formState: {
        artistNames: "",
        error: null,
        image: null,
        isDirty: false,
        isSaving: false,
        name: "",
        year: "",
      },
      isMissing: true,
      saveLabel: "Save playlist",
      savingLabel: "Saving playlist",
    }),
    {
      actionState: {
        canEdit: false,
        canPickImage: false,
        canSave: false,
        hasName: false,
      },
      imageInitial: "P",
      saveLabel: "Save playlist",
    },
  );
  const collectionFormState = getInitialCollectionFormState();
  assert.deepEqual(collectionFormState, {
    artistNames: "",
    error: null,
    image: null,
    isDirty: false,
    isSaving: false,
    name: "",
    year: "",
  });
  assert.deepEqual(
    getInitialCollectionFormState({
      artistNames: "Seed Artist",
      name: "Seed Collection",
      year: "1999",
    }),
    {
      artistNames: "Seed Artist",
      error: null,
      image: null,
      isDirty: false,
      isSaving: false,
      name: "Seed Collection",
      year: "1999",
    },
  );
  const controllerViewState = getInitialCollectionFormState({
    artistNames: "Seed Artist",
    name: "Seed Collection",
    year: "1999",
  });
  assert.deepEqual(
    getCreateCollectionFormControllerViewState({
      actionState: {
        canEdit: true,
        canPickImage: true,
        canSave: true,
        hasName: true,
      },
      formState: controllerViewState,
      imageInitial: "S",
      saveLabel: "Create collection",
    }),
    {
      actionState: {
        canEdit: true,
        canPickImage: true,
        canSave: true,
        hasName: true,
      },
      error: null,
      image: null,
      imageInitial: "S",
      isSaving: false,
      name: "Seed Collection",
      saveLabel: "Create collection",
      year: "1999",
    },
  );
  assert.deepEqual(
    getEditCollectionFormControllerViewState({
      actionState: {
        canEdit: true,
        canPickImage: true,
        canSave: true,
        hasName: true,
      },
      formState: controllerViewState,
      imageInitial: "S",
      saveLabel: "Save collection",
    }),
    {
      actionState: {
        canEdit: true,
        canPickImage: true,
        canSave: true,
        hasName: true,
      },
      artistNames: "Seed Artist",
      error: null,
      image: null,
      imageInitial: "S",
      isSaving: false,
      name: "Seed Collection",
      saveLabel: "Save collection",
      year: "1999",
    },
  );
  assert.deepEqual(
    getCollectionFormHydrateAction({
      artistNames: "Hydrated Artist",
      name: "Hydrated Album",
      year: "2026",
    }),
    {
      artistNames: "Hydrated Artist",
      name: "Hydrated Album",
      type: "hydrate",
      year: "2026",
    },
  );
  assert.deepEqual(
    getCollectionFormChangeFieldAction({
      field: "name",
      value: "Smoke Album",
    }),
    {
      field: "name",
      type: "change-field",
      value: "Smoke Album",
    },
  );
  assert.deepEqual(
    collectionFormReducer(
      collectionFormState,
      getCollectionFormHydrateAction({
        artistNames: "Hydrated Artist",
        name: "Hydrated Album",
        year: "2026",
      }),
    ),
    {
      ...collectionFormState,
      artistNames: "Hydrated Artist",
      name: "Hydrated Album",
      year: "2026",
    },
  );
  assert.deepEqual(
    collectionFormReducer(
      {
        ...collectionFormState,
        isDirty: true,
        name: "Local Edit",
      },
      getCollectionFormHydrateAction({
        artistNames: "Hydrated Artist",
        name: "Hydrated Album",
        year: "2026",
      }),
    ),
    {
      ...collectionFormState,
      isDirty: true,
      name: "Local Edit",
    },
  );
  assert.deepEqual(
    collectionFormReducer(
      collectionFormState,
      getCollectionFormChangeFieldAction({
        field: "artistNames",
        value: "Alpha Artist, Beta Artist",
      }),
    ),
    {
      ...collectionFormState,
      artistNames: "Alpha Artist, Beta Artist",
      error: null,
      isDirty: true,
    },
  );
  assert.deepEqual(
    collectionFormReducer(
      collectionFormState,
      getCollectionFormChangeFieldAction({
        field: "name",
        value: "Smoke Album",
      }),
    ),
    {
      ...collectionFormState,
      error: null,
      isDirty: true,
      name: "Smoke Album",
    },
  );
  assert.deepEqual(
    collectionFormReducer(collectionFormState, {
      image: {
        dataUrl: "data:image/png;base64,smoke",
        fileName: "smoke.png",
      },
      type: "pick-image",
    }),
    {
      ...collectionFormState,
      error: null,
      image: {
        dataUrl: "data:image/png;base64,smoke",
        fileName: "smoke.png",
      },
      isDirty: true,
    },
  );
  assert.deepEqual(
    collectionFormReducer(collectionFormState, { type: "begin-save" }),
    {
      ...collectionFormState,
      error: null,
      isSaving: true,
    },
  );
  assert.deepEqual(
    collectionFormReducer(
      {
        ...collectionFormState,
        isSaving: true,
      },
      getCollectionFormFinishSaveAction(),
    ),
    collectionFormState,
  );
  assert.deepEqual(getCollectionFormFinishSaveAction(), {
    type: "finish-save",
  });
  assert.deepEqual(
    collectionFormReducer(collectionFormState, {
      error: "Album name is required.",
      type: "fail",
    }),
    {
      ...collectionFormState,
      error: "Album name is required.",
    },
  );
  assert.deepEqual(
    collectionFormReducer(
      {
        ...collectionFormState,
        error: "Album name is required.",
      },
      { type: "clear-error" },
    ),
    collectionFormState,
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
  assert.equal(
    getCollectionFormFallbackMessage({
      kind: "album",
      operation: "create",
    }),
    "Album could not be created.",
  );
  assert.equal(
    getCollectionFormFallbackMessage({
      kind: "playlist",
      operation: "update",
    }),
    "Playlist could not be updated.",
  );
  assert.deepEqual(getCollectionFormBlockedSaveCommand("album"), {
    action: {
      error: "Album name is required.",
      type: "fail",
    },
    haptic: "error",
  });
  assert.deepEqual(getCollectionFormBeginSaveCommand(), {
    action: {
      type: "begin-save",
    },
  });
  assert.deepEqual(getCollectionFormImagePickStartCommand(), {
    haptic: "light",
  });
  assert.deepEqual(
    getCollectionFormImagePickedCommand({
      dataUrl: "data:image/png;base64,smoke",
      fileName: "smoke.png",
    }),
    {
      action: {
        image: {
          dataUrl: "data:image/png;base64,smoke",
          fileName: "smoke.png",
        },
        type: "pick-image",
      },
    },
  );
  assert.deepEqual(
    getCollectionFormImagePickFailureCommand(new Error("Image failed")),
    {
      action: {
        error: "Image failed",
        type: "fail",
      },
      haptic: "error",
    },
  );
  const collectionImageCommandEvents: unknown[] = [];
  const dispatchCollectionImageCommand = (action: {
    [key: string]: unknown;
    type: string;
  }) => {
    collectionImageCommandEvents.push(["dispatch", action]);
  };
  const sendCollectionImageHaptic = (haptic: string) => {
    collectionImageCommandEvents.push(["haptic", haptic]);
  };
  await runCollectionFormImagePickCommand({
    dispatch: dispatchCollectionImageCommand,
    pickImage: async () => null,
    sendHaptic: sendCollectionImageHaptic,
  });
  await runCollectionFormImagePickCommand({
    dispatch: dispatchCollectionImageCommand,
    pickImage: async () => ({
      dataUrl: "data:image/png;base64,smoke",
      fileName: "smoke.png",
    }),
    sendHaptic: sendCollectionImageHaptic,
  });
  await runCollectionFormImagePickCommand({
    dispatch: dispatchCollectionImageCommand,
    pickImage: async () => {
      throw new Error("Image command failed");
    },
    sendHaptic: sendCollectionImageHaptic,
  });
  assert.deepEqual(collectionImageCommandEvents, [
    ["haptic", "light"],
    ["haptic", "light"],
    [
      "dispatch",
      {
        image: {
          dataUrl: "data:image/png;base64,smoke",
          fileName: "smoke.png",
        },
        type: "pick-image",
      },
    ],
    ["haptic", "light"],
    ["haptic", "error"],
    ["dispatch", { error: "Image command failed", type: "fail" }],
  ]);
  assert.deepEqual(getCollectionFormSuccessCommand({ id: 42, kind: "album" }), {
    haptic: "success",
    href: "/(tabs)/library/album/42",
  });
  assert.deepEqual(
    getCollectionFormFailureCommand({
      caughtError: new Error("Create failed"),
      kind: "playlist",
      operation: "create",
    }),
    {
      action: {
        error: "Create failed",
        type: "fail",
      },
      haptic: "error",
    },
  );
  assert.deepEqual(
    getCollectionFormFailureCommand({
      caughtError: null,
      kind: "artist",
      operation: "update",
    }),
    {
      action: {
        error: "Artist could not be updated.",
        type: "fail",
      },
      haptic: "error",
    },
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

  const collectionFormCommandEvents: unknown[] = [];
  const commandFormState = getInitialCollectionFormState({
    artistNames: "Alpha Artist, Beta Artist",
    name: "Smoke Album",
    year: "2026",
  });
  const formStateWithImage = {
    ...commandFormState,
    image: {
      dataUrl: "data:image/png;base64,smoke",
      fileName: "smoke.png",
    },
  };
  const dispatchCollectionFormCommand = (action: {
    [key: string]: unknown;
    type: string;
  }) => {
    collectionFormCommandEvents.push(["dispatch", action]);
  };
  const sendCollectionFormHaptic = (haptic: string) => {
    collectionFormCommandEvents.push(["haptic", haptic]);
  };
  const replaceCollectionFormRoute = (href: string) => {
    collectionFormCommandEvents.push(["route", href]);
  };
  const collectionFormAttemptEvents: unknown[] = [];
  await runCollectionFormSaveAttempt({
    dispatch: (action) => {
      collectionFormAttemptEvents.push(["dispatch", action]);
    },
    kind: "album",
    onSuccess: (id) => {
      collectionFormAttemptEvents.push(["success", id]);
    },
    operation: "create",
    run: async () => {
      collectionFormAttemptEvents.push(["run"]);
      return { id: 47 };
    },
    sendHaptic: (haptic) => {
      collectionFormAttemptEvents.push(["haptic", haptic]);
    },
  });
  await runCollectionFormSaveAttempt({
    dispatch: (action) => {
      collectionFormAttemptEvents.push(["dispatch", action]);
    },
    kind: "playlist",
    onSuccess: (id) => {
      collectionFormAttemptEvents.push(["unexpected-success", id]);
    },
    operation: "update",
    run: async () => {
      throw new Error("Attempt failed");
    },
    sendHaptic: (haptic) => {
      collectionFormAttemptEvents.push(["haptic", haptic]);
    },
  });
  assert.deepEqual(collectionFormAttemptEvents, [
    ["dispatch", { type: "begin-save" }],
    ["run"],
    ["success", 47],
    ["dispatch", { type: "finish-save" }],
    ["dispatch", { type: "begin-save" }],
    ["haptic", "error"],
    ["dispatch", { error: "Attempt failed", type: "fail" }],
    ["dispatch", { type: "finish-save" }],
  ]);
  await runCreateCollectionFormSaveCommand({
    canSave: false,
    createCollectionFromForm: async () => {
      collectionFormCommandEvents.push(["unexpected-create"]);
      return { id: 1 };
    },
    dispatch: dispatchCollectionFormCommand,
    formState: commandFormState,
    kind: "album",
    replaceRoute: replaceCollectionFormRoute,
    sendHaptic: sendCollectionFormHaptic,
  });
  await runCreateCollectionFormSaveCommand({
    canSave: true,
    createCollectionFromForm: async (params) => {
      collectionFormCommandEvents.push(["create", params]);
      return { id: 51 };
    },
    dispatch: dispatchCollectionFormCommand,
    formState: formStateWithImage,
    kind: "album",
    replaceRoute: replaceCollectionFormRoute,
    sendHaptic: sendCollectionFormHaptic,
  });
  await runCreateCollectionFormSaveCommand({
    canSave: true,
    createCollectionFromForm: async () => {
      throw new Error("Create flow failed");
    },
    dispatch: dispatchCollectionFormCommand,
    formState: commandFormState,
    kind: "playlist",
    replaceRoute: replaceCollectionFormRoute,
    sendHaptic: sendCollectionFormHaptic,
  });
  await runEditCollectionFormSaveCommand({
    canSave: false,
    dispatch: dispatchCollectionFormCommand,
    formState: commandFormState,
    id: 61,
    kind: "artist",
    replaceRoute: replaceCollectionFormRoute,
    sendHaptic: sendCollectionFormHaptic,
    updateCollectionFromForm: async () => {
      collectionFormCommandEvents.push(["unexpected-update"]);
    },
  });
  await runEditCollectionFormSaveCommand({
    canSave: true,
    dispatch: dispatchCollectionFormCommand,
    formState: formStateWithImage,
    id: 62,
    kind: "album",
    replaceRoute: replaceCollectionFormRoute,
    sendHaptic: sendCollectionFormHaptic,
    updateCollectionFromForm: async (params) => {
      collectionFormCommandEvents.push(["update", params]);
    },
  });
  await runEditCollectionFormSaveCommand({
    canSave: true,
    dispatch: dispatchCollectionFormCommand,
    formState: commandFormState,
    id: 63,
    kind: "artist",
    replaceRoute: replaceCollectionFormRoute,
    sendHaptic: sendCollectionFormHaptic,
    updateCollectionFromForm: async () => {
      throw new Error("Update flow failed");
    },
  });
  assert.deepEqual(collectionFormCommandEvents, [
    ["haptic", "error"],
    ["dispatch", { error: "Album name is required.", type: "fail" }],
    ["dispatch", { type: "begin-save" }],
    [
      "create",
      {
        imageDataUrl: "data:image/png;base64,smoke",
        kind: "album",
        name: "Smoke Album",
        year: "2026",
      },
    ],
    ["haptic", "success"],
    ["route", "/(tabs)/library/album/51"],
    ["dispatch", { type: "finish-save" }],
    ["dispatch", { type: "begin-save" }],
    ["haptic", "error"],
    ["dispatch", { error: "Create flow failed", type: "fail" }],
    ["dispatch", { type: "finish-save" }],
    ["haptic", "error"],
    ["dispatch", { error: "Artist name is required.", type: "fail" }],
    ["dispatch", { type: "begin-save" }],
    [
      "update",
      {
        artistNames: "Alpha Artist, Beta Artist",
        id: 62,
        imageDataUrl: "data:image/png;base64,smoke",
        kind: "album",
        name: "Smoke Album",
        year: "2026",
      },
    ],
    ["haptic", "success"],
    ["route", "/(tabs)/library/album/62"],
    ["dispatch", { type: "finish-save" }],
    ["dispatch", { type: "begin-save" }],
    ["haptic", "error"],
    ["dispatch", { error: "Update flow failed", type: "fail" }],
    ["dispatch", { type: "finish-save" }],
  ]);
}

async function assertCollectionImagePickerExecutorSmoke() {
  const calls: string[] = [];
  let result: CollectionImagePickerResult = {
    assets: [],
    canceled: true,
  };
  const dependencies: CollectionImagePickerDependencies = {
    pickImage: async () => {
      calls.push("pick");
      return result;
    },
    readBase64File: async (uri) => {
      calls.push(`read:${uri}`);
      return "base64-image";
    },
  };

  assert.deepEqual(supportedCollectionImageTypes, ["image/jpeg", "image/png"]);
  assert.equal(
    getCollectionImageMimeType({
      name: "cover.jpg",
      uri: "file:///cover.jpg",
    }),
    "image/jpeg",
  );
  assert.doesNotThrow(() => assertSupportedCollectionImageType("image/png"));
  assert.throws(
    () => assertSupportedCollectionImageType("image/gif"),
    /Choose a JPEG or PNG image/,
  );

  assert.equal(await pickCollectionImageWithDependencies(dependencies), null);
  assert.deepEqual(calls, ["pick"]);

  calls.length = 0;
  result = {
    assets: [],
    canceled: false,
  };
  assert.equal(await pickCollectionImageWithDependencies(dependencies), null);
  assert.deepEqual(calls, ["pick"]);

  calls.length = 0;
  result = {
    assets: [
      {
        mimeType: "image/png",
        name: "smoke cover.png",
        uri: "file:///picked/cover.png",
      },
    ],
    canceled: false,
  };
  assert.deepEqual(await pickCollectionImageWithDependencies(dependencies), {
    dataUrl: "data:image/png;base64,base64-image",
    fileName: "smoke cover.png",
  });
  assert.deepEqual(calls, ["pick", "read:file:///picked/cover.png"]);

  calls.length = 0;
  result = {
    assets: [
      {
        mimeType: "image/gif",
        name: "bad.gif",
        uri: "file:///picked/bad.gif",
      },
    ],
    canceled: false,
  };
  await assert.rejects(
    () => pickCollectionImageWithDependencies(dependencies),
    /Choose a JPEG or PNG image/,
  );
  assert.deepEqual(calls, ["pick"]);
}

async function assertAlbumArtistUpdateExecutorSmoke() {
  const calls: unknown[] = [];
  const existingArtists = new Map<string, number>([["Alpha Artist", 7]]);
  let nextArtistId = 20;
  const dependencies: AlbumArtistUpdateDependencies = {
    deleteAlbumArtistRows: async (albumId) => {
      calls.push(["delete-album-artists", albumId]);
    },
    findArtistIdByName: async (name) => {
      calls.push(["find-artist", name]);
      return existingArtists.get(name) ?? null;
    },
    insertAlbumArtistRows: async (rows) => {
      calls.push(["insert-album-artists", rows]);
    },
    insertArtist: async (name) => {
      calls.push(["insert-artist", name]);
      const id = nextArtistId++;
      existingArtists.set(name, id);
      return id;
    },
  };

  assert.equal(normalizeAlbumArtistName("  Artist  "), "Artist");
  assert.deepEqual(
    splitAlbumArtistNames(" Alpha Artist, Unknown, , Unknown Artist, Beta "),
    ["Alpha Artist", "Beta"],
  );

  await replaceAlbumArtistsWithDependencies(
    {
      albumId: 42,
      artistNames: " Alpha Artist, Beta Artist, Alpha Artist, unknown ",
    },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["find-artist", "Alpha Artist"],
    ["find-artist", "Beta Artist"],
    ["insert-artist", "Beta Artist"],
    ["find-artist", "Alpha Artist"],
    ["delete-album-artists", 42],
    [
      "insert-album-artists",
      [
        { albumId: 42, artistId: 7 },
        { albumId: 42, artistId: 20 },
      ],
    ],
  ]);

  calls.length = 0;
  await replaceAlbumArtistsWithDependencies(
    { albumId: 43, artistNames: "Unknown Artist, unknown, " },
    dependencies,
  );
  assert.deepEqual(calls, [["delete-album-artists", 43]]);
}

async function assertSongMetadataRelationshipExecutorSmoke() {
  const calls: unknown[] = [];
  const existingArtists = new Map<string, number>([["Alpha Artist", 7]]);
  const existingAlbums = new Map<string, number>([["Alpha Album", 8]]);
  const existingLinks = new Set(["8:7"]);
  let nextArtistId = 20;
  let nextAlbumId = 30;
  const dependencies: SongMetadataRelationshipDependencies = {
    deleteAlbumSongRows: async (songId) => {
      calls.push(["delete-album-songs", songId]);
    },
    deleteArtistSongRows: async (songId) => {
      calls.push(["delete-artist-songs", songId]);
    },
    findAlbumArtistLinkId: async ({ albumId, artistId }) => {
      calls.push(["find-album-artist", albumId, artistId]);
      return existingLinks.has(`${albumId}:${artistId}`) ? 1 : null;
    },
    findAlbumIdByName: async (name) => {
      calls.push(["find-album", name]);
      return existingAlbums.get(name) ?? null;
    },
    findArtistIdByName: async (name) => {
      calls.push(["find-artist", name]);
      return existingArtists.get(name) ?? null;
    },
    insertAlbum: async (name) => {
      calls.push(["insert-album", name]);
      const id = nextAlbumId++;
      existingAlbums.set(name, id);
      return id;
    },
    insertAlbumArtistRows: async (rows) => {
      calls.push(["insert-album-artists", rows]);
      for (const row of rows) {
        existingLinks.add(`${row.albumId}:${row.artistId}`);
      }
    },
    insertAlbumSongRows: async (rows) => {
      calls.push(["insert-album-songs", rows]);
    },
    insertArtist: async (name) => {
      calls.push(["insert-artist", name]);
      const id = nextArtistId++;
      existingArtists.set(name, id);
      return id;
    },
    insertArtistSongRows: async (rows) => {
      calls.push(["insert-artist-songs", rows]);
    },
  };

  assert.equal(normalizeSongMetadataRelationshipName("  Title  "), "Title");
  assert.deepEqual(
    splitSongMetadataRelationshipNames(
      " Alpha Artist, Unknown Artist, Alpha Artist, Beta Artist, unknown album ",
    ),
    ["Alpha Artist", "Beta Artist"],
  );

  const stepCalls: unknown[] = [];
  const stepDependencies: Pick<
    SongMetadataRelationshipDependencies,
    | "findAlbumArtistLinkId"
    | "findAlbumIdByName"
    | "findArtistIdByName"
    | "insertAlbum"
    | "insertAlbumArtistRows"
    | "insertArtist"
  > = {
    findAlbumArtistLinkId: async ({ albumId, artistId }) => {
      stepCalls.push(["step-find-link", albumId, artistId]);
      return albumId === 10 && artistId === 20 ? 1 : null;
    },
    findAlbumIdByName: async (name) => {
      stepCalls.push(["step-find-album", name]);
      return name === "Existing Album" ? 10 : null;
    },
    findArtistIdByName: async (name) => {
      stepCalls.push(["step-find-artist", name]);
      return name === "Existing Artist" ? 20 : null;
    },
    insertAlbum: async (name) => {
      stepCalls.push(["step-insert-album", name]);
      return 11;
    },
    insertAlbumArtistRows: async (rows) => {
      stepCalls.push(["step-insert-links", rows]);
    },
    insertArtist: async (name) => {
      stepCalls.push(["step-insert-artist", name]);
      return 21;
    },
  };
  assert.equal(
    await ensureSongMetadataArtist("Existing Artist", stepDependencies),
    20,
  );
  assert.equal(
    await ensureSongMetadataArtist(" New Artist ", stepDependencies),
    21,
  );
  assert.equal(
    await ensureSongMetadataAlbum("Existing Album", stepDependencies),
    10,
  );
  assert.equal(
    await ensureSongMetadataAlbum(" New Album ", stepDependencies),
    11,
  );
  await ensureSongMetadataAlbumArtistLinks(
    { albumIds: [10, 11], artistIds: [20, 21] },
    stepDependencies,
  );
  assert.deepEqual(stepCalls, [
    ["step-find-artist", "Existing Artist"],
    ["step-find-artist", "New Artist"],
    ["step-insert-artist", "New Artist"],
    ["step-find-album", "Existing Album"],
    ["step-find-album", "New Album"],
    ["step-insert-album", "New Album"],
    ["step-find-link", 10, 20],
    ["step-find-link", 10, 21],
    ["step-find-link", 11, 20],
    ["step-find-link", 11, 21],
    [
      "step-insert-links",
      [
        { albumId: 10, artistId: 21 },
        { albumId: 11, artistId: 20 },
        { albumId: 11, artistId: 21 },
      ],
    ],
  ]);

  assert.deepEqual(
    await replaceLibrarySongMetadataRelationshipsWithDependencies(
      {
        albumNames: " Alpha Album, Beta Album, Alpha Album, unknown album ",
        artistNames: " Alpha Artist, Beta Artist, Alpha Artist, unknown ",
        songId: 42,
      },
      dependencies,
    ),
    { albumIds: [8, 30], artistIds: [7, 20] },
  );
  assert.deepEqual(calls, [
    ["delete-artist-songs", 42],
    ["delete-album-songs", 42],
    ["find-artist", "Alpha Artist"],
    ["find-artist", "Beta Artist"],
    ["insert-artist", "Beta Artist"],
    ["find-album", "Alpha Album"],
    ["find-album", "Beta Album"],
    ["insert-album", "Beta Album"],
    [
      "insert-artist-songs",
      [
        { artistId: 7, songId: 42 },
        { artistId: 20, songId: 42 },
      ],
    ],
    [
      "insert-album-songs",
      [
        { albumId: 8, songId: 42 },
        { albumId: 30, songId: 42 },
      ],
    ],
    ["find-album-artist", 8, 7],
    ["find-album-artist", 8, 20],
    ["find-album-artist", 30, 7],
    ["find-album-artist", 30, 20],
    [
      "insert-album-artists",
      [
        { albumId: 8, artistId: 20 },
        { albumId: 30, artistId: 7 },
        { albumId: 30, artistId: 20 },
      ],
    ],
  ]);

  calls.length = 0;
  assert.deepEqual(
    await replaceLibrarySongMetadataRelationshipsWithDependencies(
      {
        albumNames: "Unknown Album, unknown, ",
        artistNames: "Unknown Artist, unknown, ",
        songId: 43,
      },
      dependencies,
    ),
    { albumIds: [], artistIds: [] },
  );
  assert.deepEqual(calls, [
    ["delete-artist-songs", 43],
    ["delete-album-songs", 43],
  ]);
}

async function assertSongMetadataUpdateExecutorSmoke() {
  const calls: unknown[] = [];
  let relationshipAlbumIds: number[] = [7];
  let savedCoverImage: string | null = "saved-cover";
  const dependencies: SongMetadataUpdateDependencies = {
    replaceRelationships: async (params) => {
      calls.push(["relationships", params]);
      return { albumIds: relationshipAlbumIds };
    },
    saveCoverImage: async (coverImageDataUrl) => {
      calls.push(["save-cover", coverImageDataUrl]);
      return savedCoverImage;
    },
    updateAlbumCover: async (params) => {
      calls.push(["album-cover", params]);
    },
    updateSongCover: async (params) => {
      calls.push(["song-cover", params]);
    },
    updateSongTitle: async (params) => {
      calls.push(["song-title", params]);
    },
  };

  assert.equal(normalizeLibrarySongTitle("  Smoke Song  "), "Smoke Song");
  assert.equal(assertLibrarySongTitle("  Smoke Song  "), "Smoke Song");
  assert.throws(() => assertLibrarySongTitle("   "), /Song title is required/);
  assert.equal(
    getLibrarySongCoverUpdateTarget({
      albumIds: [7],
      coverImage: null,
      songId: 2,
    }),
    null,
  );
  assert.deepEqual(
    getLibrarySongCoverUpdateTarget({
      albumIds: [7],
      coverImage: "saved-cover",
      songId: 2,
    }),
    { albumId: 7, coverImage: "saved-cover", kind: "album" },
  );
  assert.deepEqual(
    getLibrarySongCoverUpdateTarget({
      albumIds: [],
      coverImage: "saved-cover",
      songId: 2,
    }),
    { coverImage: "saved-cover", kind: "song", songId: 2 },
  );

  await assert.rejects(
    () =>
      updateLibrarySongMetadataWithDependencies(
        {
          albumNames: "Album",
          artistNames: "Artist",
          id: 1,
          title: " ",
        },
        dependencies,
      ),
    /Song title is required/,
  );
  assert.deepEqual(calls, []);

  await updateLibrarySongMetadataWithDependencies(
    {
      albumNames: " Album ",
      artistNames: " Artist ",
      id: 2,
      title: "  Renamed  ",
    },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["song-title", { songId: 2, title: "Renamed" }],
    [
      "relationships",
      { albumNames: " Album ", artistNames: " Artist ", songId: 2 },
    ],
  ]);

  calls.length = 0;
  await updateLibrarySongMetadataWithDependencies(
    {
      albumNames: "Album",
      artistNames: "Artist",
      coverImageDataUrl: "data:image/png;base64,cover",
      id: 3,
      title: "Cover Song",
    },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["song-title", { songId: 3, title: "Cover Song" }],
    ["relationships", { albumNames: "Album", artistNames: "Artist", songId: 3 }],
    ["save-cover", "data:image/png;base64,cover"],
    ["album-cover", { albumId: 7, coverImage: "saved-cover" }],
  ]);

  calls.length = 0;
  relationshipAlbumIds = [];
  await updateLibrarySongMetadataWithDependencies(
    {
      albumNames: "",
      artistNames: "Artist",
      coverImageDataUrl: "song-cover",
      id: 4,
      title: "Standalone Song",
    },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["song-title", { songId: 4, title: "Standalone Song" }],
    ["relationships", { albumNames: "", artistNames: "Artist", songId: 4 }],
    ["save-cover", "song-cover"],
    ["song-cover", { coverImage: "saved-cover", songId: 4 }],
  ]);

  calls.length = 0;
  savedCoverImage = null;
  await updateLibrarySongMetadataWithDependencies(
    {
      albumNames: "",
      artistNames: "Artist",
      coverImageDataUrl: null,
      id: 5,
      title: "No Cover",
    },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["song-title", { songId: 5, title: "No Cover" }],
    ["relationships", { albumNames: "", artistNames: "Artist", songId: 5 }],
    ["save-cover", null],
  ]);
}

async function assertCollectionUniquenessExecutorSmoke() {
  const calls: unknown[] = [];
  const duplicates = new Set(["album:Existing Album", "playlist:Existing List"]);
  const dependencies: CollectionUniquenessDependencies = {
    hasMatchingAlbumName: async ({ excludeId, name }) => {
      calls.push(["album", name, excludeId ?? null]);
      return duplicates.has(`album:${name}`);
    },
    hasMatchingArtistName: async ({ excludeId, name }) => {
      calls.push(["artist", name, excludeId ?? null]);
      return duplicates.has(`artist:${name}`);
    },
    hasMatchingPlaylistName: async ({ excludeId, name }) => {
      calls.push(["playlist", name, excludeId ?? null]);
      return duplicates.has(`playlist:${name}`);
    },
  };

  await assertUniqueCollectionNameWithDependencies(
    { kind: "artist", name: "New Artist" },
    dependencies,
  );
  assert.deepEqual(calls, [["artist", "New Artist", null]]);

  calls.length = 0;
  await assertUniqueCollectionNameWithDependencies(
    { excludeId: 42, kind: "album", name: "New Album" },
    dependencies,
  );
  assert.deepEqual(calls, [["album", "New Album", 42]]);

  calls.length = 0;
  await assert.rejects(
    () =>
      assertUniqueCollectionNameWithDependencies(
        { kind: "album", name: "Existing Album" },
        dependencies,
      ),
    /An album with this name already exists/,
  );
  assert.deepEqual(calls, [["album", "Existing Album", null]]);

  calls.length = 0;
  await assert.rejects(
    () =>
      assertUniqueCollectionNameWithDependencies(
        { excludeId: 9, kind: "playlist", name: "Existing List" },
        dependencies,
      ),
    /A playlist with this name already exists/,
  );
  assert.deepEqual(calls, [["playlist", "Existing List", 9]]);
}

async function assertCollectionUpdateExecutorSmoke() {
  const calls: unknown[] = [];
  let savedImage: string | null = "saved-image";
  const baseDependencies = {
    assertUniqueCollectionName: async (params: {
      excludeId: number;
      kind: "album" | "artist" | "playlist";
      name: string;
    }) => {
      calls.push(["unique", params]);

      if (params.name === "Duplicate") {
        throw new Error("Duplicate name");
      }
    },
    saveCoverImage: async (image?: string | null) => {
      calls.push(["save-image", image]);
      return savedImage;
    },
  };
  const albumDependencies: AlbumUpdateDependencies = {
    ...baseDependencies,
    replaceAlbumArtists: async (params) => {
      calls.push(["album-artists", params]);
    },
    updateAlbumRow: async (params) => {
      calls.push(["album-row", params]);
    },
  };
  const artistDependencies: ArtistUpdateDependencies = {
    ...baseDependencies,
    updateArtistRow: async (params) => {
      calls.push(["artist-row", params]);
    },
  };
  const playlistDependencies: PlaylistUpdateDependencies = {
    ...baseDependencies,
    isProtectedPlaylistId: (id) => id === 1,
    updatePlaylistRow: async (params) => {
      calls.push(["playlist-row", params]);
    },
  };

  assert.equal(
    await getUniqueCollectionUpdateName({
      dependencies: baseDependencies,
      id: 8,
      kind: "album",
      name: "  Helper Album  ",
    }),
    "Helper Album",
  );
  assert.deepEqual(calls, [
    ["unique", { excludeId: 8, kind: "album", name: "Helper Album" }],
  ]);

  calls.length = 0;
  assert.deepEqual(
    await getOptionalCollectionCoverUpdate({
      coverImage: undefined,
      dependencies: baseDependencies,
    }),
    {},
  );
  assert.deepEqual(calls, []);

  assert.deepEqual(
    await getOptionalCollectionCoverUpdate({
      coverImage: "cover-smoke",
      dependencies: baseDependencies,
    }),
    { coverImage: "saved-image" },
  );
  assert.deepEqual(calls, [["save-image", "cover-smoke"]]);

  calls.length = 0;
  savedImage = null;
  assert.deepEqual(
    await getOptionalCollectionProfileImageUpdate({
      dependencies: baseDependencies,
      profileImage: "profile-smoke",
    }),
    { profileImage: null },
  );
  assert.deepEqual(calls, [["save-image", "profile-smoke"]]);

  calls.length = 0;
  assert.throws(
    () =>
      assertCanUpdatePlaylist({
        id: 1,
        isProtectedPlaylistId: playlistDependencies.isProtectedPlaylistId,
      }),
    /protected playlist/,
  );
  assertCanUpdatePlaylist({
    id: 2,
    isProtectedPlaylistId: playlistDependencies.isProtectedPlaylistId,
  });

  savedImage = "saved-image";
  assert.deepEqual(
    await updateAlbumWithDependencies(
      {
        artistNames: "Alpha Artist, Beta Artist",
        coverImage: "album-cover",
        id: 10,
        name: "  Smoke Album  ",
        year: 2026,
      },
      albumDependencies,
    ),
    { id: 10, name: "Smoke Album", year: 2026 },
  );
  assert.deepEqual(calls, [
    [
      "unique",
      { excludeId: 10, kind: "album", name: "Smoke Album" },
    ],
    ["save-image", "album-cover"],
    [
      "album-row",
      { coverImage: "saved-image", id: 10, name: "Smoke Album", year: 2026 },
    ],
    [
      "album-artists",
      { albumId: 10, artistNames: "Alpha Artist, Beta Artist" },
    ],
  ]);

  calls.length = 0;
  await updateAlbumWithDependencies(
    {
      id: 11,
      name: "No Cover Album",
      year: null,
    },
    albumDependencies,
  );
  assert.deepEqual(calls, [
    [
      "unique",
      { excludeId: 11, kind: "album", name: "No Cover Album" },
    ],
    ["album-row", { id: 11, name: "No Cover Album", year: null }],
  ]);

  calls.length = 0;
  savedImage = null;
  assert.deepEqual(
    await updateArtistWithDependencies(
      {
        id: 12,
        name: "  Smoke Artist  ",
        profileImage: "artist-image",
      },
      artistDependencies,
    ),
    { id: 12, name: "Smoke Artist" },
  );
  assert.deepEqual(calls, [
    [
      "unique",
      { excludeId: 12, kind: "artist", name: "Smoke Artist" },
    ],
    ["save-image", "artist-image"],
    ["artist-row", { id: 12, name: "Smoke Artist", profileImage: null }],
  ]);

  calls.length = 0;
  savedImage = "playlist-image";
  assert.deepEqual(
    await updatePlaylistWithDependencies(
      {
        coverImage: "playlist-cover",
        id: 13,
        name: "  Smoke Playlist  ",
      },
      playlistDependencies,
    ),
    { id: 13, name: "Smoke Playlist" },
  );
  assert.deepEqual(calls, [
    [
      "unique",
      { excludeId: 13, kind: "playlist", name: "Smoke Playlist" },
    ],
    ["save-image", "playlist-cover"],
    [
      "playlist-row",
      { coverImage: "playlist-image", id: 13, name: "Smoke Playlist" },
    ],
  ]);

  calls.length = 0;
  await assert.rejects(
    () =>
      updatePlaylistWithDependencies(
        { id: 1, name: "System Playlist" },
        playlistDependencies,
      ),
    /protected playlist/,
  );
  assert.deepEqual(calls, []);

  await assert.rejects(
    () =>
      updateArtistWithDependencies(
        { id: 14, name: "   " },
        artistDependencies,
      ),
    /Artist name is required/,
  );
  assert.deepEqual(calls, []);

  await assert.rejects(
    () =>
      updateArtistWithDependencies(
        { id: 15, name: "Duplicate" },
        artistDependencies,
      ),
    /Duplicate name/,
  );
  assert.deepEqual(calls, [
    ["unique", { excludeId: 15, kind: "artist", name: "Duplicate" }],
  ]);
}

async function assertCollectionCreateExecutorSmoke() {
  const calls: unknown[] = [];
  let savedImage: string | null = "saved-image";
  let nextId: number | null = 30;
  const dependencies: CollectionCreateDependencies = {
    assertUniqueCollectionName: async (params) => {
      calls.push(["unique", params]);

      if (params.name === "Duplicate") {
        throw new Error("Duplicate name");
      }
    },
    insertAlbumRow: async (params) => {
      calls.push(["insert-album", params]);
      return nextId;
    },
    insertArtistRow: async (params) => {
      calls.push(["insert-artist", params]);
      return nextId;
    },
    insertPlaylistRow: async (params) => {
      calls.push(["insert-playlist", params]);
      return nextId;
    },
    saveCoverImage: async (image?: string | null) => {
      calls.push(["save-image", image]);
      return savedImage;
    },
  };

  assert.equal(
    await getUniqueCollectionCreateName({
      dependencies,
      kind: "album",
      name: "  Helper Album  ",
    }),
    "Helper Album",
  );
  assert.deepEqual(calls, [
    ["unique", { kind: "album", name: "Helper Album" }],
  ]);

  calls.length = 0;
  assert.equal(assertCreatedCollectionId({ id: 29, kind: "Album" }), 29);
  assert.throws(
    () => assertCreatedCollectionId({ id: null, kind: "Playlist" }),
    /Playlist could not be created/,
  );
  assert.deepEqual(calls, []);

  assert.equal(
    await getRequiredCollectionCoverCreate({
      coverImage: "cover-helper",
      dependencies,
    }),
    "saved-image",
  );
  assert.deepEqual(calls, [["save-image", "cover-helper"]]);

  calls.length = 0;
  savedImage = null;
  assert.deepEqual(
    await getOptionalCollectionProfileImageCreate({
      dependencies,
      profileImage: "profile-helper",
    }),
    { profileImage: null },
  );
  assert.deepEqual(calls, [["save-image", "profile-helper"]]);

  calls.length = 0;
  savedImage = "saved-image";
  assert.deepEqual(
    await createAlbumWithDependencies(
      {
        coverImage: "album-image",
        name: "  Smoke Album  ",
        year: 2026,
      },
      dependencies,
    ),
    { id: 30, name: "Smoke Album", year: 2026 },
  );
  assert.deepEqual(calls, [
    ["unique", { kind: "album", name: "Smoke Album" }],
    ["save-image", "album-image"],
    [
      "insert-album",
      { coverImage: "saved-image", name: "Smoke Album", year: 2026 },
    ],
  ]);

  calls.length = 0;
  nextId = 31;
  await createArtistWithDependencies(
    {
      name: "  Plain Artist  ",
    },
    dependencies,
  );
  assert.deepEqual(calls, [
    ["unique", { kind: "artist", name: "Plain Artist" }],
    ["insert-artist", { name: "Plain Artist" }],
  ]);

  calls.length = 0;
  nextId = 32;
  savedImage = null;
  assert.deepEqual(
    await createArtistWithDependencies(
      {
        name: "Image Artist",
        profileImage: "artist-image",
      },
      dependencies,
    ),
    { id: 32, name: "Image Artist" },
  );
  assert.deepEqual(calls, [
    ["unique", { kind: "artist", name: "Image Artist" }],
    ["save-image", "artist-image"],
    ["insert-artist", { name: "Image Artist", profileImage: null }],
  ]);

  calls.length = 0;
  nextId = 33;
  savedImage = "playlist-image";
  assert.deepEqual(
    await createPlaylistWithDependencies(
      {
        coverImage: "playlist-cover",
        name: "  Smoke Playlist  ",
      },
      dependencies,
    ),
    { id: 33, name: "Smoke Playlist" },
  );
  assert.deepEqual(calls, [
    ["unique", { kind: "playlist", name: "Smoke Playlist" }],
    ["save-image", "playlist-cover"],
    [
      "insert-playlist",
      { coverImage: "playlist-image", name: "Smoke Playlist" },
    ],
  ]);

  calls.length = 0;
  await assert.rejects(
    () =>
      createAlbumWithDependencies(
        { name: "   " },
        dependencies,
      ),
    /Album name is required/,
  );
  assert.deepEqual(calls, []);

  await assert.rejects(
    () =>
      createPlaylistWithDependencies(
        { name: "Duplicate" },
        dependencies,
      ),
    /Duplicate name/,
  );
  assert.deepEqual(calls, [["unique", { kind: "playlist", name: "Duplicate" }]]);

  calls.length = 0;
  nextId = null;
  await assert.rejects(
    () =>
      createArtistWithDependencies(
        { name: "Missing Id Artist" },
        dependencies,
      ),
    /Artist could not be created/,
  );
  assert.deepEqual(calls, [
    ["unique", { kind: "artist", name: "Missing Id Artist" }],
    ["insert-artist", { name: "Missing Id Artist" }],
  ]);
}

async function assertCollectionFormMutationSmoke() {
  const createCalls: unknown[] = [];
  const createRepository: CollectionFormCreateRepository = {
    createAlbum: async (params) => {
      createCalls.push(["album", params]);
      return { id: 11 };
    },
    createArtistWithImage: async (params) => {
      createCalls.push(["artist", params]);
      return { id: 12 };
    },
    createPlaylist: async (params) => {
      createCalls.push(["playlist", params]);
      return { id: 13 };
    },
  };

  assert.deepEqual(
    await createCollectionFromForm({
      imageDataUrl: "album-image",
      kind: "album",
      name: "Smoke Album",
      repository: createRepository,
      year: "2026",
    }),
    { id: 11 },
  );
  await createCollectionFromForm({
    imageDataUrl: "artist-image",
    kind: "artist",
    name: "Smoke Artist",
    repository: createRepository,
    year: "",
  });
  await createCollectionFromForm({
    imageDataUrl: "playlist-image",
    kind: "playlist",
    name: "Smoke Playlist",
    repository: createRepository,
    year: "",
  });
  assert.deepEqual(createCalls, [
    [
      "album",
      { coverImage: "album-image", name: "Smoke Album", year: 2026 },
    ],
    ["artist", { name: "Smoke Artist", profileImage: "artist-image" }],
    [
      "playlist",
      { coverImage: "playlist-image", name: "Smoke Playlist" },
    ],
  ]);

  const updateCalls: unknown[] = [];
  const updateRepository: CollectionFormUpdateRepository = {
    updateAlbum: async (params) => {
      updateCalls.push(["album", params]);
    },
    updateArtist: async (params) => {
      updateCalls.push(["artist", params]);
    },
    updatePlaylist: async (params) => {
      updateCalls.push(["playlist", params]);
    },
  };

  await updateCollectionFromForm({
    artistNames: "Alpha Artist, Beta Artist",
    id: 21,
    imageDataUrl: "album-image",
    kind: "album",
    name: "Smoke Album",
    repository: updateRepository,
    year: "",
  });
  await updateCollectionFromForm({
    id: 22,
    imageDataUrl: "artist-image",
    kind: "artist",
    name: "Smoke Artist",
    repository: updateRepository,
    year: "",
  });
  await updateCollectionFromForm({
    id: 23,
    imageDataUrl: "playlist-image",
    kind: "playlist",
    name: "Smoke Playlist",
    repository: updateRepository,
    year: "",
  });
  assert.deepEqual(updateCalls, [
    [
      "album",
      {
        artistNames: "Alpha Artist, Beta Artist",
        coverImage: "album-image",
        id: 21,
        name: "Smoke Album",
        year: null,
      },
    ],
    ["artist", { id: 22, name: "Smoke Artist", profileImage: "artist-image" }],
    [
      "playlist",
      { coverImage: "playlist-image", id: 23, name: "Smoke Playlist" },
    ],
  ]);

  const factoryCreateCalls: unknown[] = [];
  const createCommand = createCollectionFormCommandFactory({
    createAlbum: async (params) => {
      factoryCreateCalls.push(["album", params]);
      return { id: 31 };
    },
    createArtistWithImage: async (params) => {
      factoryCreateCalls.push(["artist", params]);
      return { id: 32 };
    },
    createPlaylist: async (params) => {
      factoryCreateCalls.push(["playlist", params]);
      return { id: 33 };
    },
  });

  assert.deepEqual(
    await createCommand({
      imageDataUrl: "factory-album-image",
      kind: "album",
      name: "Factory Album",
      year: "2001",
    }),
    { id: 31 },
  );
  await createCommand({
    imageDataUrl: "factory-artist-image",
    kind: "artist",
    name: "Factory Artist",
    year: "",
  });
  await createCommand({
    imageDataUrl: "factory-playlist-image",
    kind: "playlist",
    name: "Factory Playlist",
    year: "",
  });
  assert.deepEqual(factoryCreateCalls, [
    [
      "album",
      { coverImage: "factory-album-image", name: "Factory Album", year: 2001 },
    ],
    ["artist", { name: "Factory Artist", profileImage: "factory-artist-image" }],
    [
      "playlist",
      { coverImage: "factory-playlist-image", name: "Factory Playlist" },
    ],
  ]);

  const factoryUpdateCalls: unknown[] = [];
  const updateCommand = updateCollectionFormCommandFactory({
    updateAlbum: async (params) => {
      factoryUpdateCalls.push(["album", params]);
    },
    updateArtist: async (params) => {
      factoryUpdateCalls.push(["artist", params]);
    },
    updatePlaylist: async (params) => {
      factoryUpdateCalls.push(["playlist", params]);
    },
  });

  await updateCommand({
    artistNames: "Factory Artist One, Factory Artist Two",
    id: 41,
    imageDataUrl: "factory-album-image",
    kind: "album",
    name: "Factory Album",
    year: "1999",
  });
  await updateCommand({
    id: 42,
    imageDataUrl: "factory-artist-image",
    kind: "artist",
    name: "Factory Artist",
    year: "",
  });
  await updateCommand({
    id: 43,
    imageDataUrl: "factory-playlist-image",
    kind: "playlist",
    name: "Factory Playlist",
    year: "",
  });
  assert.deepEqual(factoryUpdateCalls, [
    [
      "album",
      {
        artistNames: "Factory Artist One, Factory Artist Two",
        coverImage: "factory-album-image",
        id: 41,
        name: "Factory Album",
        year: 1999,
      },
    ],
    ["artist", { id: 42, name: "Factory Artist", profileImage: "factory-artist-image" }],
    [
      "playlist",
      { coverImage: "factory-playlist-image", id: 43, name: "Factory Playlist" },
    ],
  ]);
}

function assertLibraryCollectionListSmoke() {
  assert.equal(getLibraryCollectionListBackHref(), "/(tabs)/library");
  assert.equal(
    getLibraryCollectionCreateHref("albums"),
    "/(tabs)/library/album/create",
  );
  assert.equal(
    getLibraryCollectionCreateHref("artists"),
    "/(tabs)/library/artist/create",
  );
  assert.equal(
    getLibraryCollectionCreateHref("playlists"),
    "/(tabs)/library/playlist/create",
  );
  assert.deepEqual(getLibraryCollectionListCopy("albums"), {
    backLink: {
      href: "/(tabs)/library",
      label: "Library",
    },
    createLink: {
      href: "/(tabs)/library/album/create",
      label: "Create",
    },
    empty: "No albums in library",
    kicker: "Library",
    placeholder: "Search albums or artists",
    title: "Albums",
  });
  assert.deepEqual(getLibraryCollectionListCopy("artists"), {
    backLink: {
      href: "/(tabs)/library",
      label: "Library",
    },
    createLink: {
      href: "/(tabs)/library/artist/create",
      label: "Create",
    },
    empty: "No artists in library",
    kicker: "Library",
    placeholder: "Search artists",
    title: "Artists",
  });
  assert.deepEqual(getLibraryCollectionListCopy("playlists"), {
    backLink: {
      href: "/(tabs)/library",
      label: "Library",
    },
    createLink: {
      href: "/(tabs)/library/playlist/create",
      label: "Create",
    },
    empty: "No playlists in library",
    kicker: "Library",
    placeholder: "Search playlists",
    title: "Playlists",
  });

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
    rowsToCollectionListPreviews({
      kind: "artists",
      limit: null,
      rows: [
        {
          albumId: 7,
          artistId: 9,
          artistName: "Single Kind Artist",
          profileImage: "profile",
          songId: 4,
        },
      ],
    }),
    [
      {
        detail: "1 song / 1 album",
        id: 9,
        imagePath: null,
        kind: "artists",
        meta: "Artist",
        title: "Single Kind Artist",
      },
    ],
  );
  const collectionListQueryResult = buildLibraryCollectionListQueryResult({
    error: new Error("collection list smoke"),
    kind: "artists",
    limit: null,
    rows: [
      {
        albumId: 7,
        artistId: 9,
        artistName: "Single Kind Artist",
        profileImage: "profile",
        songId: 4,
      },
    ],
    updatedAt: new Date(77),
  });
  assert.deepEqual(
    collectionListQueryResult.collections.map((collection) => collection.id),
    [9],
  );
  assert.equal(collectionListQueryResult.isEmpty, false);
  assert.equal(collectionListQueryResult.updatedAt, 77);
  assert.equal(
    (collectionListQueryResult.error as Error).message,
    "collection list smoke",
  );
  assert.equal(getLibraryCollectionListQueryUpdatedAt(undefined), 0);

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
    getLibraryCollectionListErrors(new Error("collection query smoke")).map(
      (error) => (error as Error).message,
    ),
    ["collection query smoke"],
  );
  assert.deepEqual(getLibraryCollectionListErrors(null), []);
  assert.equal(
    getLibraryCollectionListStatusLabel({
      errors: [],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      updatedAt: 456,
    }),
    "Updated time:456",
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
      visibleRows: [],
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
      visibleRows: [
        {
          collection: collections[0],
          href: "/(tabs)/library/album/1",
        },
        {
          collection: collections[1],
          href: "/(tabs)/library/artist/2",
        },
        {
          collection: collections[2],
          href: "/(tabs)/library/playlist/3",
        },
      ],
    },
  );
  const collectionListControllerState =
    getLibraryCollectionListControllerViewState({
      collections,
      error: null,
      kind: "playlists",
      query: "road",
      updatedAt: 500,
    });
  assert.equal(collectionListControllerState.copy.title, "Playlists");
  assert.equal(collectionListControllerState.copy.empty, "No playlists in library");
  assert.equal(
    collectionListControllerState.listState.emptyLabel,
    "No matching collections",
  );
  assert.deepEqual(
    collectionListControllerState.listState.visibleRows.map((row) => row.href),
    ["/(tabs)/library/playlist/3"],
  );

  assert.deepEqual(initialLibraryCollectionListControlState, {
    query: "",
  });
  assert.deepEqual(getLibraryCollectionListSetQueryAction("jazz"), {
    query: "jazz",
    type: "set-query",
  });
  assert.deepEqual(
    libraryCollectionListControlReducer(
      initialLibraryCollectionListControlState,
      getLibraryCollectionListSetQueryAction("jazz"),
    ),
    {
      query: "jazz",
    },
  );
}

function assertLibraryHomeSmoke() {
  const librarySummaryResult = buildLibrarySummaryQueryResult({
    albumError: new Error("album smoke"),
    albumRows: [{ id: 1 }],
    albumUpdatedAt: new Date(20),
    artistError: null,
    artistRows: [{ id: 1 }, { id: 2 }],
    artistUpdatedAt: new Date(30),
    playlistError: new Error("playlist smoke"),
    playlistRows: [],
    playlistUpdatedAt: new Date(10),
    songError: null,
    songRows: [{ id: 1 }, { id: 2 }, { id: 3 }],
    songUpdatedAt: new Date(40),
  });
  assert.deepEqual(librarySummaryResult.counts, {
    albums: 1,
    artists: 2,
    playlists: 0,
    songs: 3,
  });
  assert.deepEqual(
    librarySummaryResult.errors.map((error) => (error as Error).message),
    ["playlist smoke", "album smoke"],
  );
  assert.equal(librarySummaryResult.updatedAt, 40);
  assert.equal(
    getLibrarySummaryQueryUpdatedAt({
      albumUpdatedAt: null,
      artistUpdatedAt: null,
      playlistUpdatedAt: null,
      songUpdatedAt: null,
    }),
    0,
  );
  assert.deepEqual(
    getLibraryHomeQueryErrors({
      collectionErrors: [new Error("collection smoke")],
      songError: new Error("song smoke"),
      summaryErrors: [new Error("summary smoke")],
    }).map((error) => (error as Error).message),
    ["summary smoke", "collection smoke", "song smoke"],
  );

  assert.deepEqual(getLibraryHomeSetQueryAction("pulse"), {
    query: "pulse",
    type: "set-query",
  });
  assert.deepEqual(getLibraryHomeSetSortAction("title"), {
    sort: "title",
    type: "set-sort",
  });
  assert.deepEqual(getLibraryHomeSetOrderAction("asc"), {
    order: "asc",
    type: "set-order",
  });
  let controls = libraryHomeControlReducer(
    initialLibraryHomeControlState,
    getLibraryHomeSetQueryAction("pulse"),
  );
  assert.deepEqual(controls, {
    order: "desc",
    query: "pulse",
    sort: "recent",
  });
  controls = libraryHomeControlReducer(
    controls,
    getLibraryHomeSetSortAction("title"),
  );
  assert.deepEqual(controls, {
    order: "desc",
    query: "pulse",
    sort: "title",
  });
  assert.deepEqual(
    libraryHomeControlReducer(controls, getLibraryHomeSetOrderAction("asc")),
    {
      order: "asc",
      query: "pulse",
      sort: "title",
    },
  );
  assert.equal(getLibraryHomeImportHref(), "/(tabs)/import");
  assert.deepEqual(getLibraryHomeHeaderActions(), [
    {
      href: "/(tabs)/import",
      label: "Import music",
    },
    {
      href: "/(tabs)/library/playlist/create",
      label: "Create playlist",
    },
    {
      href: "/(tabs)/library/album/create",
      label: "Create album",
    },
    {
      href: "/(tabs)/library/artist/create",
      label: "Create artist",
    },
  ]);
  assert.deepEqual(getLibraryHomeHeaderState(), {
    actions: [
      {
        href: "/(tabs)/import",
        label: "Import music",
      },
      {
        href: "/(tabs)/library/playlist/create",
        label: "Create playlist",
      },
      {
        href: "/(tabs)/library/album/create",
        label: "Create album",
      },
      {
        href: "/(tabs)/library/artist/create",
        label: "Create artist",
      },
    ],
    kicker: "Music Library",
    subtitle:
      "Browse your songs, playlists, albums, and artists as your collection grows.",
    title: "Library",
  });
  assert.deepEqual(
    getLibraryHomeStatusState({
      collectionUpdatedAt: 20,
      errors: [],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      songUpdatedAt: 30,
      summaryUpdatedAt: 10,
    }),
    {
      hasErrors: false,
      isError: false,
      statusLabel: "Updated time:30",
    },
  );
  assert.deepEqual(
    getLibraryHomeStatusState({
      collectionUpdatedAt: 0,
      errors: [],
      songUpdatedAt: 0,
      summaryUpdatedAt: 0,
    }),
    {
      hasErrors: false,
      isError: false,
      statusLabel: "Waiting for library data",
    },
  );
  assert.deepEqual(
    getLibraryHomeStatusState({
      collectionUpdatedAt: 20,
      errors: [new Error("boom")],
      formatUpdatedAt: (updatedAt) => `time:${updatedAt}`,
      songUpdatedAt: 30,
      summaryUpdatedAt: 10,
    }),
    {
      hasErrors: true,
      isError: true,
      statusLabel: "One or more library queries failed.",
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

function assertRewriteFeatureMapSmoke() {
  assert.deepEqual(
    rewriteFeatures.map((feature) => feature.key),
    [
      "app-shell",
      "library",
      "playback",
      "import",
      "backup",
      "premium-settings",
    ],
  );
  assert.deepEqual(rewriteStatusTotals, {
    active: 6,
    done: 0,
    pending: 0,
  });
  assert.deepEqual(
    rewriteReleaseGates.map((gate) => [gate.key, gate.kind]),
    [
      ["verify-rewrite", "automated"],
      ["hard-debt-ratchets", "automated"],
      ["deterministic-parity-smoke", "automated"],
      ["manual-device-smoke", "manual"],
      ["old-app-reference", "automated"],
    ],
  );
  assert.deepEqual(
    rewriteManualSmokeAreas.map((area) => [
      area.key,
      area.flows.length,
    ]),
    [
      ["navigation", 3],
      ["import", 3],
      ["library", 3],
      ["playback", 3],
      ["backup", 3],
      ["premium-settings", 3],
    ],
  );
  assert.deepEqual(rewriteReleaseReadiness, {
    automatedGateCount: 4,
    manualGateCount: 1,
    manualSmokeFlowCount: 18,
    readyStatus: "not-ready",
  });
}

function assertHomeScreenSmoke() {
  const activeTrack = song({ duration: 125_000, id: 1, title: "Home Track" });

  assert.deepEqual(getHomeQuickActions({ songCount: 3 }), [
    {
      detail: "3 songs",
      href: "/(tabs)/library",
      label: "Library",
    },
    {
      detail: "Import from files",
      href: "/(tabs)/import/files",
      label: "Files",
    },
    {
      detail: "Import from computer",
      href: "/(tabs)/import/wifi",
      label: "Wi-Fi",
    },
    {
      detail: "Theme and backup",
      href: "/(tabs)/settings",
      label: "Settings",
    },
    {
      detail: "Unlock listening",
      href: "/premium",
      label: "Premium",
    },
  ]);
  assert.deepEqual(
    getHomeGuideSections().map((section) => ({
      steps: section.steps.length,
      title: section.title,
    })),
    [
      { steps: 3, title: "Spotify Setup" },
      { steps: 3, title: "Export Flow" },
      { steps: 3, title: "Network Transfer" },
    ],
  );
  assert.deepEqual(getHomeNowPlayingActions(), [
    {
      detail: "Open current song",
      href: "/player",
      label: "Player",
    },
    {
      detail: "Review queued songs",
      href: "/queue",
      label: "Queue",
    },
  ]);
  assert.equal(getHomeLibraryHref(), "/(tabs)/library");
  assert.equal(
    getHomeRecentSongHref({ songId: 9 }),
    "/(tabs)/library/song/9",
  );
  assert.deepEqual(
    getHomeRecentSongsSectionState({
      hasLibrary: true,
      songs: [
        {
          album: "Smoke Album",
          artist: "Smoke Artist",
          duration: 65_000,
          id: 9,
          pathToFile: "/tmp/smoke.mp3",
          title: "Smoke Song",
        },
      ],
    }),
    {
      emptyState: {
        body: "Import audio files to see recent songs here.",
        title: "Build your library",
      },
      libraryHref: "/(tabs)/library",
      rows: [
        {
          detailLabel: "Smoke Artist - Smoke Album",
          durationLabel: "1:05",
          href: "/(tabs)/library/song/9",
          song: {
            album: "Smoke Album",
            artist: "Smoke Artist",
            duration: 65_000,
            id: 9,
            pathToFile: "/tmp/smoke.mp3",
            title: "Smoke Song",
          },
        },
      ],
      title: "Recent Songs",
    },
  );
  assert.deepEqual(
    getHomeRecentSongsSectionState({
      hasLibrary: false,
      songs: [],
    }).rows,
    [],
  );

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
  const homeScreenState = getHomeScreenViewState({
    activeTrack,
    recentSongs: [
      {
        album: "Smoke Album",
        artist: "Smoke Artist",
        duration: 65_000,
        id: 9,
        pathToFile: "/tmp/smoke.mp3",
        title: "Smoke Song",
      },
    ],
    state: {
      ...initialPlaybackState,
      isPlaying: true,
    },
    summary: {
      counts: {
        albums: 1,
        artists: 1,
        playlists: 1,
        songs: 3,
      },
      errors: [],
      updatedAt: 10,
    },
  });
  assert.equal(homeScreenState.guideSections.length, 3);
  assert.equal(homeScreenState.nowPlaying.playbackLabel, "Playing now");
  assert.equal(homeScreenState.nowPlayingActions.length, 2);
  assert.equal(homeScreenState.quickActions[0]?.detail, "3 songs");
  assert.equal(homeScreenState.recentSongsSectionState.rows[0]?.href, "/(tabs)/library/song/9");
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
  assert.deepEqual(
    getImportSongDraftForEdit({
      songId: 8,
      songs: [importDraft(7), importDraft(8)],
    }),
    importDraft(8),
  );
  assert.equal(
    getImportSongDraftForEdit({
      songId: 99,
      songs: [importDraft(7), importDraft(8)],
    }),
    null,
  );
  assert.deepEqual(
    getImportSongEditScreenState({
      songId: null,
      songs: [importDraft(7), importDraft(8)],
    }),
    {
      invalidState: {
        kicker: "Import edit",
        links: [
          {
            href: "/(tabs)/import/save",
            label: "Back to save",
          },
        ],
        subtitle: "This route needs a numeric id.",
        title: "Invalid song",
      },
      reason: "invalid-id",
      type: "invalid",
    },
  );
  assert.deepEqual(
    getImportSongEditScreenState({
      songId: 8,
      songs: [importDraft(7), importDraft(8)],
    }),
    {
      song: importDraft(8),
      type: "ready",
    },
  );
  assert.deepEqual(
    getImportSongEditScreenState({
      songId: 99,
      songs: [importDraft(7), importDraft(8)],
    }),
    {
      invalidState: {
        kicker: "Import edit",
        links: [
          {
            href: "/(tabs)/import/files",
            label: "Back to files",
          },
          {
            href: "/(tabs)/import/save",
            label: "Back to save",
          },
        ],
        subtitle: "Choose songs again or return to the current review.",
        title: "Song not staged",
      },
      reason: "not-staged",
      type: "invalid",
    },
  );
  assert.deepEqual(getImportSongEditFieldState(), {
    album: {
      label: "Album",
      placeholder: "Album",
      returnKeyType: "next",
    },
    artist: {
      label: "Artist",
      placeholder: "Artist",
      returnKeyType: "next",
    },
    title: {
      label: "Title",
      placeholder: "Song title",
      returnKeyType: "next",
    },
    track: {
      label: "Track",
      placeholder: "Track number",
      returnKeyType: "done",
    },
  });
  assert.deepEqual(
    getImportSongEditInitialState({
      ...importDraft(8),
      album: "Smoke Album",
      artist: "Smoke Artist",
      title: "Smoke Title",
      track: null,
    }),
    {
      album: "Smoke Album",
      artist: "Smoke Artist",
      error: null,
      title: "Smoke Title",
      track: "",
    },
  );
  assert.deepEqual(
    getImportSongEditInitialState({
      ...importDraft(8),
      track: 7,
    }),
    {
      album: "Smoke Album",
      artist: "Smoke Artist",
      error: null,
      title: "Import 8",
      track: "7",
    },
  );
  const editFormState = getImportSongEditInitialState(importDraft(8));
  assert.deepEqual(
    getImportSongEditChangeFieldAction({
      field: "title",
      value: "Changed",
    }),
    {
      field: "title",
      type: "change-field",
      value: "Changed",
    },
  );
  assert.deepEqual(
    getImportSongEditControllerResultState({ formState: editFormState }),
    {
      actionState: {
        canSave: true,
      },
      album: "Smoke Album",
      artist: "Smoke Artist",
      backLinks: [
        {
          href: "/(tabs)/import/save",
          label: "Back to save",
        },
        {
          href: "/(tabs)/import/files",
          label: "Back to files",
        },
      ],
      error: null,
      fieldState: getImportSongEditFieldState(),
      title: "Import 8",
      track: "8",
    },
  );
  assert.deepEqual(
    importSongEditFormReducer(
      editFormState,
      getImportSongEditChangeFieldAction({
        field: "title",
        value: "Changed",
      }),
    ),
    {
      ...editFormState,
      error: null,
      title: "Changed",
    },
  );
  assert.deepEqual(
    importSongEditFormReducer(editFormState, {
      error: "Title is required.",
      type: "fail",
    }),
    {
      ...editFormState,
      error: "Title is required.",
    },
  );
  assert.deepEqual(
    importSongEditFormReducer(
      {
        ...editFormState,
        error: "Title is required.",
      },
      {
        type: "clear-error",
      },
    ),
    editFormState,
  );
  assert.equal(getImportSongEditHref({ songId: 5 }), "/import/edit/5");
  assert.equal(getImportSongEditSaveHref(), "/(tabs)/import/save");
  assert.equal(getImportSongEditFilesHref(), "/(tabs)/import/files");
  assert.deepEqual(getImportSongEditBackLinks(), [
    {
      href: "/(tabs)/import/save",
      label: "Back to save",
    },
    {
      href: "/(tabs)/import/files",
      label: "Back to files",
    },
  ]);
  assert.deepEqual(getImportSongEditInvalidState("invalid-id"), {
    kicker: "Import edit",
    links: [
      {
        href: "/(tabs)/import/save",
        label: "Back to save",
      },
    ],
    subtitle: "This route needs a numeric id.",
    title: "Invalid song",
  });
  assert.deepEqual(getImportSongEditInvalidState("not-staged"), {
    kicker: "Import edit",
    links: [
      {
        href: "/(tabs)/import/files",
        label: "Back to files",
      },
      {
        href: "/(tabs)/import/save",
        label: "Back to save",
      },
    ],
    subtitle: "Choose songs again or return to the current review.",
    title: "Song not staged",
  });
  assert.equal(getImportSongEditRequiredTitleMessage(), "Title is required.");
  assert.deepEqual(getImportSongEditInvalidSaveCommand(), {
    action: {
      error: "Title is required.",
      type: "fail",
    },
    haptic: "error",
  });
  assert.deepEqual(getImportSongEditSaveSuccessCommand(), {
    haptic: "success",
    href: "/(tabs)/import/save",
  });
  assert.deepEqual(
    getImportSongEditSaveFailureCommand(new Error("Edit smoke failure")),
    {
      action: {
        error: "Edit smoke failure",
        type: "fail",
      },
      haptic: "error",
    },
  );
  assert.equal(
    getImportSongEditErrorMessage(new Error("Edit import smoke failure")),
    "Edit import smoke failure",
  );
  assert.equal(
    getImportSongEditErrorMessage(null),
    "Song could not be updated.",
  );

  const importSongEditCommandEvents: unknown[] = [];
  const dispatchImportSongEditCommand = (action: ImportSongEditFormAction) => {
    importSongEditCommandEvents.push(["dispatch", action]);
  };
  const sendImportSongEditHaptic = (haptic: string) => {
    importSongEditCommandEvents.push(["haptic", haptic]);
  };
  const replaceImportSongEditRoute = (href: string) => {
    importSongEditCommandEvents.push(["route", href]);
  };
  runImportSongEditSaveCommand({
    canSave: false,
    dispatch: dispatchImportSongEditCommand,
    formState: editFormState,
    replaceRoute: replaceImportSongEditRoute,
    sendHaptic: sendImportSongEditHaptic,
    song: importDraft(8),
    updateImportSong: () => {
      importSongEditCommandEvents.push(["unexpected-update"]);
    },
  });
  runImportSongEditSaveCommand({
    canSave: true,
    dispatch: dispatchImportSongEditCommand,
    formState: {
      album: "  Smoke Album  ",
      artist: "  Smoke Artist  ",
      error: null,
      title: "  Edited Smoke  ",
      track: " 7 ",
    },
    replaceRoute: replaceImportSongEditRoute,
    sendHaptic: sendImportSongEditHaptic,
    song: importDraft(8),
    updateImportSong: (song) => {
      importSongEditCommandEvents.push(["update", song]);
    },
  });
  runImportSongEditSaveCommand({
    canSave: true,
    dispatch: dispatchImportSongEditCommand,
    formState: {
      album: "Smoke Album",
      artist: "Smoke Artist",
      error: null,
      title: "Edited Smoke",
      track: "bad-track",
    },
    replaceRoute: replaceImportSongEditRoute,
    sendHaptic: sendImportSongEditHaptic,
    song: importDraft(9),
    updateImportSong: () => {
      importSongEditCommandEvents.push(["unexpected-bad-track-update"]);
    },
  });
  assert.deepEqual(importSongEditCommandEvents, [
    ["haptic", "error"],
    ["dispatch", { error: "Title is required.", type: "fail" }],
    [
      "update",
      {
        ...importDraft(8),
        album: "Smoke Album",
        artist: "Smoke Artist",
        title: "Edited Smoke",
        track: 7,
      },
    ],
    ["haptic", "success"],
    ["route", "/(tabs)/import/save"],
    ["haptic", "error"],
    [
      "dispatch",
      {
        error: "Track must be a positive whole number.",
        type: "fail",
      },
    ],
  ]);

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

async function assertImportFileCacheExecutorSmoke() {
  const calls: string[] = [];
  let cacheDirectory: string | null = "file:///cache/";
  let failDeletePath: string | null = null;
  const dependencies: ImportFileCacheDependencies = {
    get cacheDirectory() {
      return cacheDirectory;
    },
    copyFile: async ({ from, to }) => {
      calls.push(`copy:${from}:${to}`);
    },
    deletePath: async (path, options) => {
      calls.push(`delete:${path}:${String(options.idempotent)}`);
      if (path === failDeletePath) {
        throw new Error("Delete failed.");
      }
    },
    makeDirectory: async (path, options) => {
      calls.push(`mkdir:${path}:${String(options.intermediates)}`);
    },
    now: () => 98765,
    writeBase64File: async (path, data) => {
      calls.push(`write-base64:${path}:${data}`);
    },
  };

  assert.equal(
    sanitizeImportCacheFileName("01 Smoke Song!.mp3"),
    "01_Smoke_Song_.mp3",
  );
  assert.equal(getImportCacheDirectory(dependencies), "file:///cache/import");
  assert.deepEqual(
    getCopyImportCacheDestination({
      dependencies,
      index: 2,
      name: "Bad Name?.m4a",
    }),
    {
      destination: "file:///cache/import/98765-2-Bad_Name_.m4a",
      fileName: "Bad_Name_.m4a",
    },
  );
  assert.deepEqual(
    getBase64ImportCacheDestination({
      dependencies,
      id: 42,
      name: "",
    }),
    {
      destination: "file:///cache/import/42-song-42",
      fileName: "song-42",
    },
  );

  await createImportCacheDirectoryWithDependencies(dependencies);
  assert.deepEqual(calls, [
    "delete:file:///cache/import:true",
    "mkdir:file:///cache/import:true",
  ]);

  calls.length = 0;
  assert.deepEqual(
    await copyAssetToImportCacheWithDependencies({
      dependencies,
      index: 0,
      name: "My Song.mp3",
      uri: "file:///picked/my-song.mp3",
    }),
    {
      destination: "file:///cache/import/98765-0-My_Song.mp3",
      fileName: "My_Song.mp3",
    },
  );
  assert.deepEqual(calls, [
    "copy:file:///picked/my-song.mp3:file:///cache/import/98765-0-My_Song.mp3",
  ]);

  calls.length = 0;
  assert.deepEqual(
    await writeBase64AssetToImportCacheWithDependencies({
      data: "U09ORw==",
      dependencies,
      id: 9,
      name: "Wi-Fi Song.mp3",
    }),
    {
      destination: "file:///cache/import/9-Wi-Fi_Song.mp3",
      fileName: "Wi-Fi_Song.mp3",
    },
  );
  assert.deepEqual(calls, [
    "write-base64:file:///cache/import/9-Wi-Fi_Song.mp3:U09ORw==",
  ]);

  calls.length = 0;
  await clearImportCacheWithDependencies(dependencies);
  assert.deepEqual(calls, ["delete:file:///cache/import:true"]);

  failDeletePath = "file:///cache/import";
  await assert.rejects(
    () => clearImportCacheWithDependencies(dependencies),
    /Import cache cleanup failed: Delete failed/,
  );

  failDeletePath = "file:///cache/song-2.mp3";
  calls.length = 0;
  await assert.rejects(
    () =>
      deleteImportDraftCacheFilesWithDependencies({
        dependencies,
        songs: [
          importDraft(1),
          { ...importDraft(2), cacheUri: "file:///cache/song-2.mp3" },
        ],
      }),
    /Import file cleanup failed: Delete failed/,
  );
  assert.deepEqual(calls, [
    "delete:/tmp/import-1.mp3:true",
    "delete:file:///cache/song-2.mp3:true",
  ]);

  cacheDirectory = null;
  assert.throws(() => getImportCacheDirectory(dependencies), /unavailable/);
}

async function assertImportFileSelectionExecutorSmoke() {
  type SmokeAsset = {
    mimeType?: string | null;
    name: string;
    uri: string;
  };

  const calls: string[] = [];
  let pickResult:
    | { canceled: true }
    | { assets: SmokeAsset[]; canceled: false } = { canceled: true };
  let failingCopyIndex: number | null = null;
  const dependencies: ImportFileSelectionDependencies<SmokeAsset> = {
    copyAssetToImportCache: async ({ asset, index }) => {
      calls.push(`copy:${asset.name}:${asset.uri}:${index}`);
      if (failingCopyIndex === index) {
        throw new Error("Copy failed.");
      }

      return {
        destination: `/cache/${asset.name}`,
        fileName: `cached-${asset.name}`,
      };
    },
    createImportCacheDirectory: async () => {
      calls.push("mkdir");
    },
    now: () => 1_000,
    pickImportFiles: async () => {
      calls.push("pick");
      return pickResult;
    },
    processCachedImportFile: async ({ cacheUri, fileName, fileType, id }) => {
      calls.push(`process:${cacheUri}:${fileName}:${fileType}:${id}`);
      return {
        ...importDraft(id),
        cacheUri,
        fileName,
        fileType,
      };
    },
    writeBase64AssetToImportCache: async ({ data, id, name }) => {
      calls.push(`write:${name}:${data}:${id}`);
      return {
        destination: `/cache/${name}`,
        fileName: `cached-${name}`,
      };
    },
  };

  assert.deepEqual(
    getCachedImportFileProcessParams({
      asset: { mimeType: "audio/mpeg", name: "song.mp3", uri: "file://song" },
      destination: "/cache/song.mp3",
      fileName: "cached-song.mp3",
      id: 50,
    }),
    {
      cacheUri: "/cache/song.mp3",
      fileName: "cached-song.mp3",
      fileType: "audio/mpeg",
      id: 50,
    },
  );
  assert.deepEqual(
    getCachedImportFileProcessParams({
      asset: { mimeType: null, name: "song.wav", uri: "file://song" },
      destination: "/cache/song.wav",
      fileName: "cached-song.wav",
      id: 51,
    }),
    {
      cacheUri: "/cache/song.wav",
      fileName: "cached-song.wav",
      fileType: "cached-song.wav",
      id: 51,
    },
  );
  assert.deepEqual(
    getWifiImportFileProcessParams({
      destination: "/cache/wifi.mp3",
      fileName: "cached-wifi.mp3",
      id: 52,
      type: "",
    }),
    {
      cacheUri: "/cache/wifi.mp3",
      fileName: "cached-wifi.mp3",
      fileType: "cached-wifi.mp3",
      id: 52,
    },
  );
  assert.deepEqual(
    await processImportAssetWithDependencies({
      asset: { mimeType: "audio/wav", name: "direct.wav", uri: "file:///direct.wav" },
      dependencies,
      index: 4,
    }),
    {
      ...importDraft(1_004),
      cacheUri: "/cache/direct.wav",
      fileName: "cached-direct.wav",
      fileType: "audio/wav",
    },
  );
  assert.deepEqual(calls, [
    "copy:direct.wav:file:///direct.wav:4",
    "process:/cache/direct.wav:cached-direct.wav:audio/wav:1004",
  ]);
  calls.length = 0;

  failingCopyIndex = 1;
  assert.deepEqual(
    await processImportAssetsWithDependencies({
      assets: [
        {
          mimeType: "audio/mpeg",
          name: "batch-one.mp3",
          uri: "file:///batch-one.mp3",
        },
        {
          mimeType: "audio/aac",
          name: "batch-bad.m4a",
          uri: "file:///batch-bad.m4a",
        },
      ],
      dependencies,
    }),
    {
      drafts: [
        {
          ...importDraft(1_000),
          cacheUri: "/cache/batch-one.mp3",
          fileName: "cached-batch-one.mp3",
          fileType: "audio/mpeg",
        },
      ],
      skipped: 1,
    },
  );
  assert.deepEqual(calls, [
    "copy:batch-one.mp3:file:///batch-one.mp3:0",
    "process:/cache/batch-one.mp3:cached-batch-one.mp3:audio/mpeg:1000",
    "copy:batch-bad.m4a:file:///batch-bad.m4a:1",
  ]);
  calls.length = 0;
  failingCopyIndex = 2;

  assert.deepEqual(await selectImportFilesWithDependencies(dependencies), {
    drafts: [],
    skipped: 0,
  });
  assert.deepEqual(calls, ["pick"]);

  calls.length = 0;
  failingCopyIndex = 2;
  pickResult = {
    assets: [
      { mimeType: "audio/mpeg", name: "one.mp3", uri: "file:///one.mp3" },
      { mimeType: null, name: "two.wav", uri: "file:///two.wav" },
      { mimeType: "audio/aac", name: "bad.m4a", uri: "file:///bad.m4a" },
    ],
    canceled: false,
  };
  const selected = await selectImportFilesWithDependencies(dependencies);
  assert.equal(selected.skipped, 1);
  assert.deepEqual(
    selected.drafts.map(({ cacheUri, fileName, fileType, id }) => ({
      cacheUri,
      fileName,
      fileType,
      id,
    })),
    [
      {
        cacheUri: "/cache/one.mp3",
        fileName: "cached-one.mp3",
        fileType: "audio/mpeg",
        id: 1_000,
      },
      {
        cacheUri: "/cache/two.wav",
        fileName: "cached-two.wav",
        fileType: "cached-two.wav",
        id: 1_001,
      },
    ],
  );
  assert.deepEqual(calls, [
    "pick",
    "mkdir",
    "copy:one.mp3:file:///one.mp3:0",
    "process:/cache/one.mp3:cached-one.mp3:audio/mpeg:1000",
    "copy:two.wav:file:///two.wav:1",
    "process:/cache/two.wav:cached-two.wav:cached-two.wav:1001",
    "copy:bad.m4a:file:///bad.m4a:2",
  ]);

  calls.length = 0;
  assert.deepEqual(
    await stageWifiImportFileWithDependencies(
      {
        data: "U09ORw==",
        id: 77,
        name: "wifi.mp3",
        type: "",
      },
      dependencies,
    ),
    {
      ...importDraft(77),
      cacheUri: "/cache/wifi.mp3",
      fileName: "cached-wifi.mp3",
      fileType: "cached-wifi.mp3",
    },
  );
  assert.deepEqual(calls, [
    "write:wifi.mp3:U09ORw==:77",
    "process:/cache/wifi.mp3:cached-wifi.mp3:cached-wifi.mp3:77",
  ]);
}

async function assertImportSessionPersistenceExecutorSmoke() {
  const calls: string[] = [];
  const files = new Map<string, string>();
  const existingPaths = new Set<string>();
  let documentDirectory: string | null = "file:///documents/";
  let failClear = false;
  const sessionFile = "file:///documents/import/session.json";
  const dependencies: ImportSessionPersistenceDependencies = {
    deletePath: async (path, options) => {
      calls.push(`delete:${path}:${String(options.idempotent)}`);
      if (failClear) {
        throw new Error("Delete failed.");
      }
      files.delete(path);
    },
    get documentDirectory() {
      return documentDirectory;
    },
    getInfo: async (path) => {
      calls.push(`info:${path}`);
      return { exists: files.has(path) || existingPaths.has(path) };
    },
    makeDirectory: async (path, options) => {
      calls.push(`mkdir:${path}:${String(options.intermediates)}`);
    },
    readAsString: async (path) => {
      calls.push(`read:${path}`);
      const contents = files.get(path);
      if (contents === undefined) {
        throw new Error("Missing file.");
      }

      return contents;
    },
    writeAsString: async (path, contents) => {
      calls.push(`write:${path}:${contents}`);
      files.set(path, contents);
    },
  };
  const first = importDraft(101);
  const second = importDraft(102);
  const reviewingState = {
    error: null,
    phase: "reviewing" as const,
    progress: { current: 2, total: 2 },
    saveSummary: null,
    selectedSongId: first.id,
    shouldSaveToLibrary: true,
    songs: [first, second],
    source: "files" as const,
  };

  assert.equal(
    getImportSessionDirectoryWithDependencies(dependencies),
    "file:///documents/import",
  );
  assert.equal(
    getImportSessionDirectory({ documentDirectory: "file:///documents/" }),
    "file:///documents/import",
  );
  assert.equal(
    getImportSessionFileWithDependencies(dependencies),
    sessionFile,
  );
  assert.equal(
    getImportSessionFile({ documentDirectory: "file:///documents/" }),
    sessionFile,
  );
  assert.deepEqual(
    getRestoredImportSessionState({
      persistedSession: {
        selectedSongId: second.id,
        shouldSaveToLibrary: false,
        songs: [first, second],
        source: "wifi",
      },
      songs: [first],
    }),
    {
      error: null,
      phase: "reviewing",
      progress: { current: 1, total: 1 },
      saveSummary: null,
      selectedSongId: first.id,
      shouldSaveToLibrary: false,
      songs: [first],
      source: "wifi",
    },
  );
  assert.equal(
    getRestoredImportSessionState({
      persistedSession: {
        selectedSongId: second.id,
        shouldSaveToLibrary: false,
        songs: [first, second],
        source: "wifi",
      },
      songs: [],
    }),
    null,
  );
  const filterCalls: string[] = [];
  assert.deepEqual(
    await filterExistingImportDraftsWithDependencies({
      dependencies: {
        getInfo: async (path) => {
          filterCalls.push(path);
          return { exists: path === first.cacheUri };
        },
      },
      songs: [first, second],
    }),
    [first],
  );
  assert.deepEqual(filterCalls, [first.cacheUri, second.cacheUri]);
  assert.equal(
    await loadPersistedImportSessionStateWithDependencies(dependencies),
    null,
  );
  assert.deepEqual(calls, [`info:${sessionFile}`]);

  calls.length = 0;
  files.set(sessionFile, "{not-json");
  assert.equal(
    await loadPersistedImportSessionStateWithDependencies(dependencies),
    null,
  );
  assert.deepEqual(calls, [`info:${sessionFile}`, `read:${sessionFile}`]);

  calls.length = 0;
  files.set(
    sessionFile,
    JSON.stringify({
      selectedSongId: second.id,
      shouldSaveToLibrary: false,
      songs: [first, second],
      source: "wifi",
    }),
  );
  existingPaths.add(first.cacheUri);
  assert.deepEqual(
    await loadPersistedImportSessionStateWithDependencies(dependencies),
    {
      error: null,
      phase: "reviewing",
      progress: { current: 1, total: 1 },
      saveSummary: null,
      selectedSongId: first.id,
      shouldSaveToLibrary: false,
      songs: [first],
      source: "wifi",
    },
  );
  assert.deepEqual(calls, [
    `info:${sessionFile}`,
    `read:${sessionFile}`,
    `info:${first.cacheUri}`,
    `info:${second.cacheUri}`,
  ]);

  calls.length = 0;
  existingPaths.clear();
  assert.equal(
    await loadPersistedImportSessionStateWithDependencies(dependencies),
    null,
  );
  assert.deepEqual(calls, [
    `info:${sessionFile}`,
    `read:${sessionFile}`,
    `info:${first.cacheUri}`,
    `info:${second.cacheUri}`,
    `delete:${sessionFile}:true`,
  ]);

  calls.length = 0;
  await savePersistedImportSessionStateWithDependencies({
    dependencies,
    state: reviewingState,
  });
  assert.deepEqual(calls, [
    "mkdir:file:///documents/import:true",
    `write:${sessionFile}:${JSON.stringify(
      toPersistedImportSession(reviewingState),
      null,
      2,
    )}`,
  ]);

  calls.length = 0;
  await savePersistedImportSessionStateWithDependencies({
    dependencies,
    state: { ...reviewingState, songs: [] },
  });
  assert.deepEqual(calls, [`delete:${sessionFile}:true`]);

  calls.length = 0;
  failClear = true;
  await clearPersistedImportSessionStateWithDependencies(dependencies);
  assert.deepEqual(calls, [`delete:${sessionFile}:true`]);

  documentDirectory = null;
  assert.throws(
    () => getImportSessionDirectoryWithDependencies(dependencies),
    /Document directory is unavailable/,
  );
  assert.equal(
    await loadPersistedImportSessionStateWithDependencies(dependencies),
    null,
  );
}

async function assertImportLibraryFileExecutorSmoke() {
  const calls: string[] = [];
  let documentDirectory: string | null = "file:///documents/";
  let shouldCopyFail = false;
  const dependencies: ImportLibraryFileDependencies = {
    copyFile: async ({ from, to }) => {
      calls.push(`copy:${from}:${to}`);
      if (shouldCopyFail) {
        throw new Error("copy failed");
      }
    },
    deletePath: async (path, options) => {
      calls.push(`delete:${path}:${options?.idempotent === true}`);
    },
    get documentDirectory() {
      return documentDirectory;
    },
    makeDirectory: async (path, options) => {
      calls.push(`mkdir:${path}:${options?.intermediates === true}`);
    },
  };

  const libraryDirectory =
    getImportLibraryDirectoryWithDependencies(dependencies);
  assert.equal(libraryDirectory, "file:///documents/library");
  const songDirectory = getImportLibrarySongDirectory({
    libraryDirectory,
    songId: 42,
  });
  assert.equal(songDirectory, "file:///documents/library/42");
  assert.equal(
    getImportLibrarySongFile({
      fileName: "track.mp3",
      songDirectory,
    }),
    "file:///documents/library/42/track.mp3",
  );

  assert.equal(
    await moveImportAudioToLibraryWithDependencies({
      cacheUri: "file:///cache/import-track.mp3",
      dependencies,
      fileName: "track.mp3",
      songId: 42,
    }),
    "file:///documents/library/42/track.mp3",
  );
  assert.deepEqual(calls, [
    "mkdir:file:///documents/library:true",
    "mkdir:file:///documents/library/42:true",
    "copy:file:///cache/import-track.mp3:file:///documents/library/42/track.mp3",
    "delete:file:///cache/import-track.mp3:true",
  ]);

  calls.length = 0;
  await deleteLibrarySongFilesWithDependencies(42, dependencies);
  assert.deepEqual(calls, ["delete:file:///documents/library/42:true"]);

  calls.length = 0;
  documentDirectory = null;
  await deleteLibrarySongFilesWithDependencies(43, dependencies);
  assert.deepEqual(calls, []);
  assert.throws(
    () => getImportLibraryDirectoryWithDependencies(dependencies),
    /Document directory is unavailable/,
  );
  await assert.rejects(
    () =>
      moveImportAudioToLibraryWithDependencies({
        cacheUri: "file:///cache/missing-document-directory.mp3",
        dependencies,
        fileName: "missing.mp3",
        songId: 43,
      }),
    /Document directory is unavailable/,
  );
  assert.deepEqual(calls, []);

  documentDirectory = "file:///documents/";
  shouldCopyFail = true;
  await assert.rejects(
    () =>
      moveImportAudioToLibraryWithDependencies({
        cacheUri: "file:///cache/failing-track.mp3",
        dependencies,
        fileName: "failing.mp3",
        songId: 44,
      }),
    /copy failed/,
  );
  assert.deepEqual(calls, [
    "mkdir:file:///documents/library:true",
    "mkdir:file:///documents/library/44:true",
    "copy:file:///cache/failing-track.mp3:file:///documents/library/44/failing.mp3",
  ]);
}

async function assertImportLibraryLinkExecutorSmoke() {
  const calls: string[] = [];
  const existingArtists = new Map<string, number>([["Alice", 7]]);
  const existingAlbums = new Map<string, number>([["Existing Album", 70]]);
  let nextArtistId = 100;
  let nextAlbumId = 200;
  let savedCover: string | null = "cover-hash";
  const dependencies: ImportLibraryLinkDependencies = {
    findAlbumIdByName: async (name) => {
      calls.push(`find-album:${name}`);
      return existingAlbums.get(name) ?? null;
    },
    findArtistIdByName: async (name) => {
      calls.push(`find-artist:${name}`);
      return existingArtists.get(name) ?? null;
    },
    insertAlbum: async (name) => {
      calls.push(`insert-album:${name}`);
      const id = nextAlbumId++;
      existingAlbums.set(name, id);
      return id;
    },
    insertArtist: async (name) => {
      calls.push(`insert-artist:${name}`);
      const id = nextArtistId++;
      existingArtists.set(name, id);
      return id;
    },
    linkArtistAlbum: async ({ albumId, artistId }) => {
      calls.push(`link-artist-album:${artistId}:${albumId}`);
    },
    linkSongAlbum: async ({ albumId, songId, track }) => {
      calls.push(`link-song-album:${songId}:${albumId}:${track ?? "none"}`);
    },
    linkSongArtist: async ({ artistId, songId }) => {
      calls.push(`link-song-artist:${songId}:${artistId}`);
    },
    linkSongToLibraryPlaylist: async (songId) => {
      calls.push(`link-playlist:${songId}`);
    },
    saveCoverImage: async (artwork) => {
      calls.push(`save-cover:${artwork ?? "none"}`);
      return savedCover;
    },
    updateAlbumCover: async ({ albumId, coverImage }) => {
      calls.push(`update-album-cover:${albumId}:${coverImage}`);
    },
  };

  assert.deepEqual(
    getImportSongArtistLinkParams({ artistId: 7, songId: 42 }),
    { artistId: 7, songId: 42 },
  );
  assert.deepEqual(
    getImportSongAlbumLinkParams({ albumId: 70, songId: 42, track: null }),
    { albumId: 70, songId: 42, track: null },
  );
  assert.deepEqual(
    getImportArtistAlbumLinkParams({ albumId: 70, artistId: 7 }),
    { albumId: 70, artistId: 7 },
  );
  assert.deepEqual(
    getImportAlbumCoverUpdateParams({
      albumId: 70,
      coverImage: "cover-hash",
    }),
    { albumId: 70, coverImage: "cover-hash" },
  );
  assert.equal(
    getImportAlbumCoverUpdateParams({ albumId: 70, coverImage: null }),
    null,
  );

  await updateImportLibraryAlbumCover({
    albumId: 70,
    artwork: "direct-cover",
    dependencies,
  });
  assert.deepEqual(calls, [
    "save-cover:direct-cover",
    "update-album-cover:70:cover-hash",
  ]);

  calls.length = 0;
  assert.deepEqual(
    await linkImportLibrarySongArtists({
      artistNames: ["Alice", "Direct Artist"],
      dependencies,
      songId: 41,
    }),
    [7, 100],
  );
  assert.deepEqual(calls, [
    "find-artist:Alice",
    "link-song-artist:41:7",
    "find-artist:Direct Artist",
    "insert-artist:Direct Artist",
    "link-song-artist:41:100",
  ]);

  calls.length = 0;
  existingArtists.delete("Direct Artist");
  nextArtistId = 100;
  savedCover = null;
  assert.equal(
    await linkImportLibrarySongAlbum({
      albumName: "Existing Album",
      artistIds: [],
      dependencies,
      song: { ...importDraft(40), artwork: null, track: null },
      songId: 40,
    }),
    true,
  );
  assert.deepEqual(calls, [
    "find-album:Existing Album",
    "link-song-album:40:70:none",
    "save-cover:none",
  ]);

  calls.length = 0;
  savedCover = "cover-hash";
  assert.equal(await ensureImportLibraryArtist(" Alice ", dependencies), 7);
  assert.equal(await ensureImportLibraryArtist(" Charlie ", dependencies), 100);
  assert.equal(
    await ensureImportLibraryAlbum(" Existing Album ", dependencies),
    70,
  );
  assert.equal(
    await ensureImportLibraryAlbum(" Fresh Album ", dependencies),
    200,
  );
  assert.deepEqual(calls, [
    "find-artist:Alice",
    "find-artist:Charlie",
    "insert-artist:Charlie",
    "find-album:Existing Album",
    "find-album:Fresh Album",
    "insert-album:Fresh Album",
  ]);

  calls.length = 0;
  nextArtistId = 101;
  nextAlbumId = 201;
  assert.deepEqual(
    await linkImportSongToLibraryWithDependencies({
      dependencies,
      song: {
        ...importDraft(71),
        album: "  New Album  ",
        artist: " Alice, Bob, Unknown Artist ",
        artwork: "data:image/png;base64,cover",
        track: 3,
      },
      songId: 42,
    }),
    { linkedAlbum: true },
  );
  assert.deepEqual(calls, [
    "find-artist:Alice",
    "link-song-artist:42:7",
    "find-artist:Bob",
    "insert-artist:Bob",
    "link-song-artist:42:101",
    "find-album:New Album",
    "insert-album:New Album",
    "link-song-album:42:201:3",
    "save-cover:data:image/png;base64,cover",
    "update-album-cover:201:cover-hash",
    "link-artist-album:7:201",
    "link-artist-album:101:201",
    "link-playlist:42",
  ]);

  calls.length = 0;
  savedCover = null;
  assert.deepEqual(
    await linkImportSongToLibraryWithDependencies({
      dependencies,
      song: {
        ...importDraft(72),
        album: "Existing Album",
        artist: "Unknown Artist",
        artwork: null,
        track: null,
      },
      songId: 43,
    }),
    { linkedAlbum: true },
  );
  assert.deepEqual(calls, [
    "find-album:Existing Album",
    "link-song-album:43:70:none",
    "save-cover:none",
    "link-playlist:43",
  ]);

  calls.length = 0;
  assert.deepEqual(
    await linkImportSongToLibraryWithDependencies({
      dependencies,
      song: {
        ...importDraft(73),
        album: "Unknown Album",
        artist: " Alice ",
      },
      songId: 44,
    }),
    { linkedAlbum: false },
  );
  assert.deepEqual(calls, [
    "find-artist:Alice",
    "link-song-artist:44:7",
    "link-playlist:44",
  ]);
}

async function assertImportLibrarySongRowExecutorSmoke() {
  const calls: unknown[] = [];
  const dependencies: ImportLibrarySongRowDependencies = {
    deleteAlbumSongRows: async (songId) => {
      calls.push(["delete-album-songs", songId]);
    },
    deleteArtistSongRows: async (songId) => {
      calls.push(["delete-artist-songs", songId]);
    },
    deletePlaylistSongRows: async (songId) => {
      calls.push(["delete-playlist-songs", songId]);
    },
    deleteSongRow: async (songId) => {
      calls.push(["delete-song", songId]);
    },
    insertSongRow: async (values) => {
      calls.push(["insert-song", values]);
      return 42;
    },
    updateSongCover: async (params) => {
      calls.push(["update-cover", params]);
    },
    updateSongPath: async (params) => {
      calls.push(["update-path", params]);
    },
  };
  const song = {
    ...importDraft(81),
    cacheUri: "file:///cache/song.mp3",
    duration: 123_000,
    fileName: "song.mp3",
    fileType: "audio/mpeg",
    title: "Smoke Song",
  };

  assert.deepEqual(getImportSongDraftInsertValues(song), {
    duration: 123_000,
    fileType: "audio/mpeg",
    ingestComplete: 1,
    originalFileName: "song.mp3",
    pathToFile: "file:///cache/song.mp3",
    title: "Smoke Song",
  });
  assert.equal(
    await insertImportSongDraftWithDependencies(song, dependencies),
    42,
  );
  await updateImportLibrarySongPathWithDependencies(
    { pathToFile: "file:///documents/library/42/song.mp3", songId: 42 },
    dependencies,
  );
  await updateImportLibrarySongCoverWithDependencies(
    { coverImage: "cover-hash", songId: 42 },
    dependencies,
  );
  await deleteImportLibrarySongRowsWithDependencies(42, dependencies);
  assert.deepEqual(calls, [
    [
      "insert-song",
      {
        duration: 123_000,
        fileType: "audio/mpeg",
        ingestComplete: 1,
        originalFileName: "song.mp3",
        pathToFile: "file:///cache/song.mp3",
        title: "Smoke Song",
      },
    ],
    [
      "update-path",
      { pathToFile: "file:///documents/library/42/song.mp3", songId: 42 },
    ],
    ["update-cover", { coverImage: "cover-hash", songId: 42 }],
    ["delete-album-songs", 42],
    ["delete-artist-songs", 42],
    ["delete-playlist-songs", 42],
    ["delete-song", 42],
  ]);
}

async function assertImportLibrarySavePlanSmoke() {
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

  const calls: string[] = [];
  const createDependencies = ({
    linkedAlbum,
    moveFails = false,
    savedCover = "cover-hash",
  }: {
    linkedAlbum: boolean;
    moveFails?: boolean;
    savedCover?: string | null;
  }): ImportLibrarySongSaveDependencies => ({
    deleteImportLibrarySongRows: async (songId) => {
      calls.push(`delete-row-${songId}`);
    },
    deleteLibrarySongFiles: async (songId) => {
      calls.push(`delete-files-${songId}`);
    },
    insertImportSongDraft: async (song) => {
      calls.push(`insert-${song.id}`);
      return 42;
    },
    linkImportSongToLibrary: async ({ songId }) => {
      calls.push(`link-${songId}`);
      return { linkedAlbum };
    },
    moveImportAudioToLibrary: async ({ cacheUri, fileName, songId }) => {
      calls.push(`move-${songId}-${fileName}-${cacheUri}`);
      if (moveFails) {
        throw new Error("move failed");
      }
      return `/library/${songId}.mp3`;
    },
    saveCoverImage: async (artwork) => {
      calls.push(`save-cover-${artwork ?? "none"}`);
      return savedCover;
    },
    updateImportLibrarySongCover: async ({ coverImage, songId }) => {
      calls.push(`update-cover-${songId}-${coverImage}`);
    },
    updateImportLibrarySongPath: async ({ pathToFile, songId }) => {
      calls.push(`update-path-${songId}-${pathToFile}`);
    },
  });

  const artworkSong = {
    ...importDraft(3),
    artwork: "data:image/jpeg;base64,abc",
  };
  assert.equal(
    getImportLibrarySongSaveErrorMessage(new Error("step failure")),
    "step failure",
  );
  assert.equal(
    getImportLibrarySongSaveErrorMessage("string failure"),
    "string failure",
  );

  await deleteFailedImportLibrarySong(
    41,
    createDependencies({ linkedAlbum: false }),
  );
  assert.deepEqual(calls, ["delete-row-41", "delete-files-41"]);
  calls.length = 0;

  await updateImportLibrarySongCoverFromArtwork({
    artwork: "data:image/jpeg;base64,cover",
    dependencies: createDependencies({ linkedAlbum: false }),
    songId: 41,
  });
  assert.deepEqual(calls, [
    "save-cover-data:image/jpeg;base64,cover",
    "update-cover-41-cover-hash",
  ]);
  calls.length = 0;

  await updateImportLibrarySongCoverFromArtwork({
    artwork: null,
    dependencies: createDependencies({
      linkedAlbum: false,
      savedCover: null,
    }),
    songId: 41,
  });
  assert.deepEqual(calls, ["save-cover-none"]);
  calls.length = 0;

  assert.equal(
    await saveImportSongToLibrary(
      artworkSong,
      createDependencies({ linkedAlbum: false }),
    ),
    42,
  );
  assert.deepEqual(calls, [
    "insert-3",
    "move-42-import-3.mp3-/tmp/import-3.mp3",
    "update-path-42-/library/42.mp3",
    "link-42",
    "save-cover-data:image/jpeg;base64,abc",
    "update-cover-42-cover-hash",
  ]);
  calls.length = 0;

  assert.equal(
    await saveImportSongToLibrary(
      artworkSong,
      createDependencies({ linkedAlbum: true }),
    ),
    42,
  );
  assert.deepEqual(calls, [
    "insert-3",
    "move-42-import-3.mp3-/tmp/import-3.mp3",
    "update-path-42-/library/42.mp3",
    "link-42",
  ]);
  calls.length = 0;

  await assert.rejects(
    () =>
      saveImportSongToLibrary(
        importDraft(4),
        createDependencies({ linkedAlbum: false, moveFails: true }),
      ),
    /Audio file could not be saved: move failed/,
  );
  assert.deepEqual(calls, [
    "insert-4",
    "move-42-import-4.mp3-/tmp/import-4.mp3",
    "delete-row-42",
    "delete-files-42",
  ]);
  calls.length = 0;

  assert.deepEqual(
    await saveImportSongsToLibrary(
      [importDraft(5), importDraft(6)],
      {
        ...createDependencies({ linkedAlbum: true }),
        deleteImportDraftCacheFiles: async (songs) => {
          calls.push(`delete-cache-${songs.map((song) => song.id).join(",")}`);
        },
      },
    ),
    {
      discarded: 0,
      saved: 2,
      savedSongIds: [42, 42],
    },
  );
  assert.deepEqual(calls, [
    "insert-5",
    "move-42-import-5.mp3-/tmp/import-5.mp3",
    "update-path-42-/library/42.mp3",
    "link-42",
    "insert-6",
    "move-42-import-6.mp3-/tmp/import-6.mp3",
    "update-path-42-/library/42.mp3",
    "link-42",
    "delete-cache-5,6",
  ]);
  calls.length = 0;

  await assert.rejects(
    () =>
      saveImportSongsToLibrary(
        [importDraft(9), importDraft(10)],
        {
          ...createDependencies({ linkedAlbum: false, moveFails: true }),
          deleteImportDraftCacheFiles: async (songs) => {
            calls.push(`delete-cache-${songs.map((song) => song.id).join(",")}`);
          },
        },
      ),
    /Audio file could not be saved: move failed/,
  );
  assert.deepEqual(calls, [
    "insert-9",
    "move-42-import-9.mp3-/tmp/import-9.mp3",
    "delete-row-42",
    "delete-files-42",
  ]);
  calls.length = 0;

  assert.deepEqual(
    await discardImportSongs(
      [importDraft(7), importDraft(8)],
      {
        deleteImportDraftCacheFiles: async (songs) => {
          calls.push(`delete-cache-${songs.map((song) => song.id).join(",")}`);
        },
      },
    ),
    {
      discarded: 2,
      saved: 0,
      savedSongIds: [],
    },
  );
  assert.deepEqual(calls, ["delete-cache-7,8"]);
}

async function assertBackupScreenSmoke() {
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
    getBackupSessionStartAction("backup"),
  );
  assert.deepEqual(getBackupSessionStartAction("backup"), {
    operation: "backup",
    type: "start",
  });
  assert.deepEqual(
    getBackupSessionSucceedAction({
      message: "Backup complete.",
      operation: "backup",
    }),
    {
      result: {
        message: "Backup complete.",
        operation: "backup",
      },
      type: "succeed",
    },
  );
  assert.deepEqual(
    getBackupSessionFailAction({
      error: "Backup failed.",
      operation: "backup",
    }),
    {
      error: "Backup failed.",
      operation: "backup",
      type: "fail",
    },
  );
  assert.deepEqual(getBackupSessionResetAction(), { type: "reset" });

  assert.deepEqual(
    backupActionCards.map((card) => card.operation),
    ["backup", "restore", "erase"],
  );
  assert.deepEqual(getBackupScreenState(), {
    backLink: {
      href: "/(tabs)/settings",
      label: "Back to Settings",
    },
  });
  assert.deepEqual(startedBackupState, {
    error: null,
    lastOperation: "backup",
    message: null,
    phase: "running",
    requiresPremium: true,
  });
  assert.deepEqual(
    backupSessionReducer(
      startedBackupState,
      getBackupSessionSucceedAction({
        message: "Backup complete.",
        operation: "backup",
      }),
    ),
    successState,
  );
  assert.deepEqual(
    backupSessionReducer(
      startedBackupState,
      getBackupSessionFailAction({
        error: "Backup failed.",
        operation: "backup",
      }),
    ),
    {
      error: "Backup failed.",
      lastOperation: "backup",
      message: null,
      phase: "failure",
      requiresPremium: true,
    },
  );
  assert.deepEqual(
    backupSessionReducer(successState, getBackupSessionResetAction()),
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
  const backupSessionCommandEvents: BackupSessionAction[] = [];
  await runBackupSessionOperationCommand({
    dispatch: (action) => {
      backupSessionCommandEvents.push(action);
    },
    operation: "backup",
    runBackupCommand: async (operation) => ({
      message: "Command complete.",
      operation,
    }),
  });
  await runBackupSessionOperationCommand({
    dispatch: (action) => {
      backupSessionCommandEvents.push(action);
    },
    operation: "restore",
    runBackupCommand: async () => {
      throw new Error("Restore exploded");
    },
  });
  runBackupSessionResetCommand({
    dispatch: (action) => {
      backupSessionCommandEvents.push(action);
    },
  });
  assert.deepEqual(backupSessionCommandEvents, [
    { operation: "backup", type: "start" },
    {
      result: { message: "Command complete.", operation: "backup" },
      type: "succeed",
    },
    { operation: "restore", type: "start" },
    { error: "Restore exploded", operation: "restore", type: "fail" },
    { type: "reset" },
  ]);
  assert.deepEqual(getBackupCommandResult("backup"), {
    message: "Backup archive was created and handed to the share sheet.",
    operation: "backup",
  });
  assert.deepEqual(getBackupCommandResult("erase"), {
    message: "Local library files and database rows were erased.",
    operation: "erase",
  });
  assert.deepEqual(getBackupCommandResult("restore"), {
    message: "Backup archive was restored into the local library.",
    operation: "restore",
  });
  assert.deepEqual(getCancelledBackupRestoreResult(), {
    message: "Restore was cancelled.",
    operation: "restore",
  });
  assert.equal(
    getPickedBackupArchiveUri({
      assets: [{ uri: "file:///backup.zip" }],
      canceled: false,
    }),
    "file:///backup.zip",
  );
  assert.equal(
    getPickedBackupArchiveUri({
      assets: [],
      canceled: false,
    }),
    null,
  );
  assert.equal(
    getPickedBackupArchiveUri({
      assets: [{ uri: "file:///backup.zip" }],
      canceled: true,
    }),
    null,
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
  assert.deepEqual(getBackupViewState({ premiumActive: false, state: idleState }), {
    actionCards: [
      {
        ...backupActionCards[0],
        actionState: {
          buttonLabel: "Backup",
          isDanger: false,
          isDisabled: false,
          showPremiumBadge: true,
        },
      },
      {
        ...backupActionCards[1],
        actionState: {
          buttonLabel: "Restore",
          isDanger: false,
          isDisabled: false,
          showPremiumBadge: true,
        },
      },
      {
        ...backupActionCards[2],
        actionState: {
          buttonLabel: "Erase",
          isDanger: true,
          isDisabled: false,
          showPremiumBadge: true,
        },
      },
    ],
    screenState: getBackupScreenState(),
    statusState: getBackupStatusState(idleState),
  });
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
  assert.deepEqual(getBackupOperationStartCommand("backup"), {
    haptic: "light",
  });
  assert.deepEqual(getBackupOperationStartCommand("restore"), {
    haptic: "light",
  });
  assert.deepEqual(getBackupOperationStartCommand("erase"), {
    haptic: "medium",
  });
  assert.deepEqual(getBackupOperationConfirmCommand("restore"), {
    haptic: "medium",
  });
  assert.deepEqual(getBackupOperationConfirmCommand("erase"), {
    haptic: "heavy",
  });
  assert.deepEqual(getBackupResetStatusCommand(), {
    haptic: "light",
  });
  const backupScreenActionEvents: unknown[] = [];
  const backupScreenActionDependencies = {
    runOperation: (operation: string) => {
      backupScreenActionEvents.push(["run", operation]);
    },
    sendHaptic: (haptic: string) => {
      backupScreenActionEvents.push(["haptic", haptic]);
    },
    showConfirmation: (params: { onConfirm: () => void; title: string }) => {
      backupScreenActionEvents.push(["confirm", params.title]);
      params.onConfirm();
    },
  };
  runBackupOperationAction({
    operation: "backup",
    ...backupScreenActionDependencies,
  });
  runBackupOperationAction({
    operation: "restore",
    ...backupScreenActionDependencies,
  });
  runBackupOperationAction({
    operation: "erase",
    ...backupScreenActionDependencies,
  });
  runBackupResetStatusAction({
    reset: () => {
      backupScreenActionEvents.push(["reset"]);
    },
    sendHaptic: backupScreenActionDependencies.sendHaptic,
  });
  assert.deepEqual(backupScreenActionEvents, [
    ["haptic", "light"],
    ["run", "backup"],
    ["haptic", "light"],
    ["confirm", "Restore library"],
    ["haptic", "medium"],
    ["run", "restore"],
    ["haptic", "medium"],
    ["confirm", "Erase library"],
    ["haptic", "heavy"],
    ["run", "erase"],
    ["haptic", "light"],
    ["reset"],
  ]);
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
      currentState: { ...successState, lastOperation: "erase" },
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
  const backupPhaseEffectEvents: unknown[] = [];
  runBackupPhaseTransitionEffects({
    currentState: idleState,
    previousPhase: "idle",
    reloadCustomizationSettings: () => {
      backupPhaseEffectEvents.push(["unexpected-reload"]);
    },
    resetPlaybackSession: () => {
      backupPhaseEffectEvents.push(["unexpected-reset-playback"]);
    },
    resetSession: () => {
      backupPhaseEffectEvents.push(["unexpected-reset-import"]);
    },
    sendHaptic: (haptic) => {
      backupPhaseEffectEvents.push(["unexpected-haptic", haptic]);
    },
  });
  assert.deepEqual(
    runBackupPhaseTransitionEffects({
      currentState: { ...successState, lastOperation: "restore" },
      previousPhase: "running",
      reloadCustomizationSettings: () => {
        backupPhaseEffectEvents.push(["reload-customization"]);
      },
      resetPlaybackSession: () => {
        backupPhaseEffectEvents.push(["reset-playback"]);
      },
      resetSession: () => {
        backupPhaseEffectEvents.push(["reset-import"]);
      },
      sendHaptic: (haptic) => {
        backupPhaseEffectEvents.push(["haptic", haptic]);
      },
    }),
    {
      haptic: "success",
      shouldResetRuntimeSessions: true,
    },
  );
  runBackupPhaseTransitionEffects({
    currentState: failureState,
    previousPhase: "running",
    reloadCustomizationSettings: () => {
      backupPhaseEffectEvents.push(["unexpected-failure-reload"]);
    },
    resetPlaybackSession: () => {
      backupPhaseEffectEvents.push(["unexpected-failure-reset-playback"]);
    },
    resetSession: () => {
      backupPhaseEffectEvents.push(["unexpected-failure-reset-import"]);
    },
    sendHaptic: (haptic) => {
      backupPhaseEffectEvents.push(["haptic", haptic]);
    },
  });
  assert.deepEqual(backupPhaseEffectEvents, [
    ["haptic", "success"],
    ["reset-import"],
    ["reset-playback"],
    ["reload-customization"],
    ["haptic", "error"],
  ]);
  assert.deepEqual(
    getBackupDocumentDirectoryDeletePaths({
      documentDirectory: "file:///doc/",
      items: [
        "SQLite",
        "import",
        "playback",
        "settings",
        "songs",
      ],
    }),
    [
      "file:///doc/SQLite",
      "file:///doc/import",
      "file:///doc/playback",
      "file:///doc/settings",
      "file:///doc/songs",
    ],
  );
  assert.deepEqual(
    assertBackupRestoreStagedItems([
      "SQLite",
      "import",
      "playback",
      "settings",
      "songs",
    ]),
    [
      "SQLite",
      "import",
      "playback",
      "settings",
      "songs",
    ],
  );
  assert.throws(
    () => assertBackupRestoreStagedItems([]),
    /Backup archive did not contain any library files/,
  );
  assert.deepEqual(
    getBackupRestoreStagedItemMoves({
      documentDirectory: "file:///doc/",
      stagedItems: [
        "SQLite",
        "import/session.json",
        "playback/session.json",
        "settings/customization.json",
        "songs/track.mp3",
      ],
      stagingDirectory: "file:///cache/restore/",
    }),
    [
      {
        from: "file:///cache/restore/SQLite",
        to: "file:///doc/SQLite",
      },
      {
        from: "file:///cache/restore/import/session.json",
        to: "file:///doc/import/session.json",
      },
      {
        from: "file:///cache/restore/playback/session.json",
        to: "file:///doc/playback/session.json",
      },
      {
        from: "file:///cache/restore/settings/customization.json",
        to: "file:///doc/settings/customization.json",
      },
      {
        from: "file:///cache/restore/songs/track.mp3",
        to: "file:///doc/songs/track.mp3",
      },
    ],
  );
}

async function assertBackupFileSystemExecutorSmoke() {
  const calls: string[] = [];
  let cacheDirectory: string | null = "file:///cache/";
  let documentDirectory: string | null = "file:///doc/";
  let failCleanup = false;
  const directories = new Map<string, string[]>([
    ["file:///doc/", ["SQLite", "settings", "songs"]],
    ["file:///cache/synq-restore-123/", ["SQLite", "songs/track.mp3"]],
  ]);
  const dependencies: BackupFileSystemDependencies = {
    get cacheDirectory() {
      return cacheDirectory;
    },
    deletePath: async (path, options) => {
      calls.push(`delete:${path}:${options?.idempotent === true}`);
      if (failCleanup && path === "file:///cache/synq-restore-123/") {
        throw new Error("cleanup failed");
      }
    },
    get documentDirectory() {
      return documentDirectory;
    },
    makeDirectory: async (path, options) => {
      calls.push(`mkdir:${path}:${options?.intermediates === true}`);
    },
    movePath: async ({ from, to }) => {
      calls.push(`move:${from}:${to}`);
    },
    now: () => 123,
    readDirectory: async (path) => {
      calls.push(`read:${path}`);
      return directories.get(path) ?? [];
    },
  };

  assert.equal(
    getBackupDocumentDirectoryWithDependencies(dependencies),
    "file:///doc/",
  );
  assert.equal(
    getBackupRestoreStagingDirectoryWithDependencies(dependencies),
    "file:///cache/synq-restore-123/",
  );
  assert.equal(
    getBackupArchivePathWithDependencies(dependencies),
    "file:///cache/synq-backup-123.zip",
  );

  await clearBackupDocumentDirectoryWithDependencies(dependencies);
  assert.deepEqual(calls, [
    "read:file:///doc/",
    "delete:file:///doc/SQLite:true",
    "delete:file:///doc/settings:true",
    "delete:file:///doc/songs:true",
  ]);

  calls.length = 0;
  assert.equal(
    await prepareBackupRestoreStagingDirectoryWithDependencies(dependencies),
    "file:///cache/synq-restore-123/",
  );
  assert.deepEqual(calls, [
    "delete:file:///cache/synq-restore-123/:true",
    "mkdir:file:///cache/synq-restore-123/:true",
  ]);

  calls.length = 0;
  assert.deepEqual(
    await assertBackupRestoreStagingDirectoryHasFilesWithDependencies(
      "file:///cache/synq-restore-123/",
      dependencies,
    ),
    ["SQLite", "songs/track.mp3"],
  );
  assert.deepEqual(calls, ["read:file:///cache/synq-restore-123/"]);

  calls.length = 0;
  await replaceBackupDocumentDirectoryWithStagedItemsWithDependencies({
    dependencies,
    stagedItems: ["SQLite", "songs/track.mp3"],
    stagingDirectory: "file:///cache/synq-restore-123/",
  });
  assert.deepEqual(calls, [
    "read:file:///doc/",
    "delete:file:///doc/SQLite:true",
    "delete:file:///doc/settings:true",
    "delete:file:///doc/songs:true",
    "move:file:///cache/synq-restore-123/SQLite:file:///doc/SQLite",
    "move:file:///cache/synq-restore-123/songs/track.mp3:file:///doc/songs/track.mp3",
  ]);

  calls.length = 0;
  failCleanup = true;
  await cleanupBackupRestoreStagingDirectoryWithDependencies(
    "file:///cache/synq-restore-123/",
    dependencies,
  );
  assert.deepEqual(calls, ["delete:file:///cache/synq-restore-123/:true"]);

  documentDirectory = null;
  assert.throws(
    () => getBackupDocumentDirectoryWithDependencies(dependencies),
    /Document directory is unavailable/,
  );
  cacheDirectory = null;
  assert.throws(
    () => getBackupArchivePathWithDependencies(dependencies),
    /Cache directory is unavailable/,
  );
}

async function assertBackupCommandExecutorSmoke() {
  const calls: string[] = [];
  const record = (message: string) => {
    calls.push(message);
  };
  const createDependencies = (
    overrides: Partial<BackupCommandExecutorDependencies> = {},
  ): BackupCommandExecutorDependencies => ({
    assertRestoreStagingDirectoryHasFiles: async (stagingDirectory) => {
      record(`assert-staged:${stagingDirectory}`);

      return ["SQLite", "songs/track.mp3"];
    },
    cleanupRestoreStagingDirectory: async (stagingDirectory) => {
      record(`cleanup:${stagingDirectory}`);
    },
    clearDocumentDirectory: async () => {
      record("clear-document");
    },
    getArchivePath: () => "file:///cache/synq-backup.zip",
    getDocumentDirectory: () => "file:///doc/",
    isSharingAvailable: async () => true,
    pickArchive: async () => "file:///picked.zip",
    prepareRestoreStagingDirectory: async () => {
      record("prepare-staging");

      return "file:///cache/restore/";
    },
    replaceDocumentDirectoryWithStagedItems: async (
      stagingDirectory,
      stagedItems,
    ) => {
      record(`replace:${stagingDirectory}:${stagedItems.join(",")}`);
    },
    resetDatabaseConnection: async () => {
      record("reset-db");
    },
    shareArchive: async (archivePath, options) => {
      record(
        `share:${archivePath}:${options.mimeType}:${options.UTI}:${options.dialogTitle}`,
      );
    },
    unzipArchive: async (archiveUri, stagingDirectory) => {
      record(`unzip:${archiveUri}:${stagingDirectory}`);
    },
    zipDirectory: async (sourceDirectory, archivePath) => {
      record(`zip:${sourceDirectory}:${archivePath}`);

      return archivePath;
    },
    ...overrides,
  });

  await assert.rejects(
    runBackupCommandWithDependencies(
      "backup",
      createDependencies({
        isSharingAvailable: async () => false,
      }),
    ),
    /Sharing is unavailable/,
  );
  assert.deepEqual(calls, []);

  assert.deepEqual(
    await runBackupCommandWithDependencies("backup", createDependencies()),
    getBackupCommandResult("backup"),
  );
  assert.deepEqual(calls, [
    "zip:file:///doc/:file:///cache/synq-backup.zip",
    "share:file:///cache/synq-backup.zip:application/zip:com.pkware.zip-archive:Share SYNQ backup",
  ]);
  calls.length = 0;

  assert.deepEqual(
    await runBackupCommandWithDependencies("erase", createDependencies()),
    getBackupCommandResult("erase"),
  );
  assert.deepEqual(calls, ["clear-document", "reset-db"]);
  calls.length = 0;

  assert.deepEqual(
    await runBackupCommandWithDependencies(
      "restore",
      createDependencies({
        pickArchive: async () => null,
      }),
    ),
    getCancelledBackupRestoreResult(),
  );
  assert.deepEqual(calls, []);

  assert.deepEqual(
    await runBackupCommandWithDependencies("restore", createDependencies()),
    getBackupCommandResult("restore"),
  );
  assert.deepEqual(calls, [
    "prepare-staging",
    "unzip:file:///picked.zip:file:///cache/restore/",
    "assert-staged:file:///cache/restore/",
    "replace:file:///cache/restore/:SQLite,songs/track.mp3",
    "reset-db",
    "cleanup:file:///cache/restore/",
  ]);
  calls.length = 0;

  await assert.rejects(
    runBackupCommandWithDependencies(
      "restore",
      createDependencies({
        unzipArchive: async (archiveUri, stagingDirectory) => {
          record(`unzip:${archiveUri}:${stagingDirectory}`);
          throw new Error("Unzip failed");
        },
      }),
    ),
    /Unzip failed/,
  );
  assert.deepEqual(calls, [
    "prepare-staging",
    "unzip:file:///picked.zip:file:///cache/restore/",
    "cleanup:file:///cache/restore/",
  ]);
}

async function assertPremiumScreenSmoke() {
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
  assert.deepEqual(initialPremiumEntitlementState, {
    active: false,
    error: null,
    message: null,
    phase: "checking",
    tierId: "monthly",
  });
  assert.deepEqual(
    premiumEntitlementReducer(
      {
        active: true,
        error: "Previous error.",
        message: "Previous message.",
        phase: "failure",
        tierId: "yearly",
      },
      getPremiumEntitlementCheckingAction(),
    ),
    {
      active: true,
      error: null,
      message: "Previous message.",
      phase: "checking",
      tierId: "yearly",
    },
  );
  assert.deepEqual(
    premiumEntitlementReducer(
      initialPremiumEntitlementState,
      getPremiumEntitlementSucceedAction({
        active: true,
        message: "Premium smoke active.",
        tierId: "lifetime",
      }),
    ),
    {
      active: true,
      error: null,
      message: "Premium smoke active.",
      phase: "ready",
      tierId: "lifetime",
    },
  );
  assert.deepEqual(
    premiumEntitlementReducer(
      initialPremiumEntitlementState,
      getPremiumEntitlementFailAction("Premium entitlement failed."),
    ),
    {
      active: false,
      error: "Premium entitlement failed.",
      message: null,
      phase: "failure",
      tierId: "monthly",
    },
  );
  assert.deepEqual(getPremiumEntitlementCheckingAction(), {
    type: "checking",
  });
  assert.deepEqual(
    getPremiumEntitlementSucceedAction({
      active: true,
      message: "Applied.",
      tierId: "yearly",
    }),
    {
      status: {
        active: true,
        message: "Applied.",
        tierId: "yearly",
      },
      type: "succeed",
    },
  );
  assert.deepEqual(getPremiumEntitlementFailAction("Check failed"), {
    error: "Check failed",
    type: "fail",
  });
  const premiumEntitlementCommandEvents: unknown[] = [];
  const dispatchPremiumEntitlementCommand = (
    action: PremiumEntitlementAction,
  ) => {
    premiumEntitlementCommandEvents.push(action);
  };
  runPremiumEntitlementApplyCommand({
    dispatch: dispatchPremiumEntitlementCommand,
    status: {
      active: true,
      message: "Applied.",
      tierId: "yearly",
    },
  });
  await runPremiumEntitlementRefreshCommand({
    checkPremiumEntitlement: async () => ({
      active: true,
      message: "Checked.",
      tierId: "lifetime",
    }),
    dispatch: dispatchPremiumEntitlementCommand,
  });
  await runPremiumEntitlementRefreshCommand({
    checkPremiumEntitlement: async () => {
      throw new Error("Check failed");
    },
    dispatch: dispatchPremiumEntitlementCommand,
  });
  assert.deepEqual(premiumEntitlementCommandEvents, [
    {
      status: {
        active: true,
        message: "Applied.",
        tierId: "yearly",
      },
      type: "succeed",
    },
    { type: "checking" },
    {
      status: {
        active: true,
        message: "Checked.",
        tierId: "lifetime",
      },
      type: "succeed",
    },
    { type: "checking" },
    { error: "Check failed", type: "fail" },
  ]);
  assert.deepEqual(
    getInitialPremiumPurchaseState({
      active: true,
      tierId: "yearly",
    }),
    {
      active: true,
      error: null,
      message: null,
      phase: "idle",
      selectedTierId: "yearly",
    },
  );
  assert.deepEqual(getPremiumPurchaseSelectAction("lifetime"), {
    tierId: "lifetime",
    type: "select",
  });
  assert.deepEqual(getPremiumPurchaseStartAction(), { type: "start" });
  assert.deepEqual(
    getPremiumPurchaseSucceedAction({
      active: true,
      message: "Premium smoke active.",
      tierId: "yearly",
    }),
    {
      result: {
        active: true,
        message: "Premium smoke active.",
        tierId: "yearly",
      },
      type: "succeed",
    },
  );
  assert.deepEqual(
    getPremiumPurchaseSyncEntitlementAction({
      active: true,
      message: "Synced entitlement.",
      tierId: "yearly",
    }),
    {
      active: true,
      message: "Synced entitlement.",
      tierId: "yearly",
      type: "sync-entitlement",
    },
  );
  assert.deepEqual(getPremiumPurchaseFailAction("Premium failed."), {
    error: "Premium failed.",
    type: "fail",
  });
  assert.deepEqual(getPremiumPurchaseResetAction(), { type: "reset" });
  let reducerState = premiumPurchaseReducer(
    getInitialPremiumPurchaseState(),
    getPremiumPurchaseSelectAction("lifetime"),
  );
  assert.deepEqual(reducerState, {
    active: false,
    error: null,
    message: null,
    phase: "idle",
    selectedTierId: "lifetime",
  });
  reducerState = premiumPurchaseReducer(
    reducerState,
    getPremiumPurchaseStartAction(),
  );
  assert.equal(reducerState.phase, "loading");
  assert.deepEqual(
    premiumPurchaseReducer(
      reducerState,
      getPremiumPurchaseSucceedAction({
        active: true,
        message: "Premium smoke active.",
        tierId: "yearly",
      }),
    ),
    {
      active: true,
      error: null,
      message: "Premium smoke active.",
      phase: "success",
      selectedTierId: "yearly",
    },
  );
  assert.deepEqual(
    premiumPurchaseReducer(
      reducerState,
      getPremiumPurchaseFailAction("Premium failed."),
    ),
    {
      active: false,
      error: "Premium failed.",
      message: null,
      phase: "failure",
      selectedTierId: "lifetime",
    },
  );
  assert.deepEqual(
    premiumPurchaseReducer(
      getInitialPremiumPurchaseState(),
      getPremiumPurchaseSyncEntitlementAction({
        active: true,
        message: "Synced entitlement.",
        tierId: "yearly",
      }),
    ),
    {
      active: true,
      error: null,
      message: "Synced entitlement.",
      phase: "idle",
      selectedTierId: "yearly",
    },
  );
  const premiumPurchaseCommandEvents: unknown[] = [];
  const dispatchPremiumPurchaseCommand = (action: PremiumPurchaseAction) => {
    premiumPurchaseCommandEvents.push(["dispatch", action]);
  };
  const applyPremiumStatus = (status: PremiumEntitlementStatus) => {
    premiumPurchaseCommandEvents.push(["apply", status]);
  };
  runPremiumTierSelectionCommand({
    dispatch: dispatchPremiumPurchaseCommand,
    tierId: "yearly",
  });
  await runPremiumPurchaseCommand({
    applyStatus: applyPremiumStatus,
    dispatch: dispatchPremiumPurchaseCommand,
    purchasePremiumTier: async (tierId) => ({
      active: true,
      message: "Purchased.",
      tierId,
    }),
    selectedTierId: "monthly",
  });
  await runPremiumPurchaseCommand({
    applyStatus: applyPremiumStatus,
    dispatch: dispatchPremiumPurchaseCommand,
    purchasePremiumTier: async () => {
      throw new Error("Purchase failed");
    },
    selectedTierId: "lifetime",
  });
  await runPremiumRestoreCommand({
    applyStatus: applyPremiumStatus,
    dispatch: dispatchPremiumPurchaseCommand,
    restorePremiumPurchase: async () => ({
      active: true,
      message: "Restored.",
      tierId: "yearly",
    }),
  });
  await runPremiumRestoreCommand({
    applyStatus: applyPremiumStatus,
    dispatch: dispatchPremiumPurchaseCommand,
    restorePremiumPurchase: async () => {
      throw new Error("Restore failed");
    },
  });
  runPremiumPurchaseResetCommand({
    dispatch: dispatchPremiumPurchaseCommand,
  });
  assert.deepEqual(premiumPurchaseCommandEvents, [
    ["dispatch", { tierId: "yearly", type: "select" }],
    ["dispatch", { type: "start" }],
    ["apply", { active: true, message: "Purchased.", tierId: "monthly" }],
    [
      "dispatch",
      {
        result: { active: true, message: "Purchased.", tierId: "monthly" },
        type: "succeed",
      },
    ],
    ["dispatch", { type: "start" }],
    ["dispatch", { error: "Purchase failed", type: "fail" }],
    ["dispatch", { type: "start" }],
    ["apply", { active: true, message: "Restored.", tierId: "yearly" }],
    [
      "dispatch",
      {
        result: { active: true, message: "Restored.", tierId: "yearly" },
        type: "succeed",
      },
    ],
    ["dispatch", { type: "start" }],
    ["dispatch", { error: "Restore failed", type: "fail" }],
    ["dispatch", { type: "reset" }],
  ]);
  assert.deepEqual(getInitialPremiumTierLoadState(tiers), {
    tiers,
  });
  assert.deepEqual(
    premiumTierLoadReducer(getInitialPremiumTierLoadState([]), {
      tiers,
      type: "resolve",
    }),
    {
      tiers,
    },
  );
  assert.deepEqual(getPremiumTierLoadResolveAction(tiers), {
    tiers,
    type: "resolve",
  });
  const premiumTierLoadCommandEvents: unknown[] = [];
  const dispatchPremiumTierLoadCommand = (action: PremiumTierLoadAction) => {
    premiumTierLoadCommandEvents.push(action);
  };
  await runPremiumTierLoadCommand({
    dispatch: dispatchPremiumTierLoadCommand,
    fallbackTiers: premiumTiers,
    isCurrent: () => true,
    loadPremiumTiers: async () => tiers,
  });
  await runPremiumTierLoadCommand({
    dispatch: dispatchPremiumTierLoadCommand,
    fallbackTiers: premiumTiers,
    isCurrent: () => true,
    loadPremiumTiers: async () => {
      throw new Error("Tier load failed");
    },
  });
  await runPremiumTierLoadCommand({
    dispatch: dispatchPremiumTierLoadCommand,
    fallbackTiers: premiumTiers,
    isCurrent: () => false,
    loadPremiumTiers: async () => tiers,
  });
  await runPremiumTierLoadCommand({
    dispatch: dispatchPremiumTierLoadCommand,
    fallbackTiers: premiumTiers,
    isCurrent: () => false,
    loadPremiumTiers: async () => {
      throw new Error("Tier load failed");
    },
  });
  assert.deepEqual(premiumTierLoadCommandEvents, [
    { tiers, type: "resolve" },
    { tiers: premiumTiers, type: "resolve" },
  ]);
  assert.deepEqual(
    premiumTiers.map((tier) => tier.id),
    ["monthly", "yearly", "lifetime"],
  );
  assert.deepEqual(premiumOfferingNames, {
    lifetime: "Premium Lifetime",
    monthly: "Premium Monthly",
    yearly: "Premium Yearly",
  });
  assert.equal(getTierIdFromProduct("SYNQPremiumLifetime"), "lifetime");
  assert.equal(getTierIdFromProduct("SYNQPremiumMonthly"), "monthly");
  assert.equal(getTierIdFromProduct("SYNQPremiumYearly"), "yearly");
  assert.equal(getTierIdFromProduct("unknown-product"), "monthly");
  assert.deepEqual(
    hydratePremiumTierPrices({
      monthly: "$1.99",
      yearly: "$19.99",
    }).map((tier) => ({ id: tier.id, price: tier.price })),
    [
      { id: "monthly", price: "$1.99" },
      { id: "yearly", price: "$19.99" },
      { id: "lifetime", price: "$∞" },
    ],
  );
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
  assert.deepEqual(getPremiumScreenState(), {
    backLink: {
      href: "/(tabs)/settings",
      label: "Back to Settings",
    },
    header: {
      kicker: "SYNQ Premium",
      subtitle: "Unlock the full library workflow and keep the app sustainable.",
      title: "Premium",
    },
  });
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
  assert.deepEqual(getPremiumViewState({ state: idleState, tiers }), {
    actionState: {
      canPurchase: true,
      canRestore: true,
      purchaseLabel: "Choose Yearly",
    },
    screenState: getPremiumScreenState(),
    statusState: {
      canReset: false,
      isFailure: false,
      message: "Choose a plan or restore a previous purchase.",
    },
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

async function assertPremiumPurchaseExecutorSmoke() {
  const monthlyPackage: PremiumPurchasePackage = {
    product: { priceString: "$1.99" },
  };
  const yearlyPackage: PremiumPurchasePackage = {
    product: { priceString: "$19.99" },
  };
  const lifetimePackage: PremiumPurchasePackage = {
    product: { priceString: "$49.99" },
  };
  const purchasedPackages: PremiumPurchasePackage[] = [];
  let restoredProductIdentifier: string | null = null;
  let checkedProductIdentifier: string | null = null;
  let purchasedProductIdentifier: string | null = "SYNQPremiumYearly";
  const getCustomerInfo = (
    productIdentifier: string | null,
  ): PremiumCustomerInfo => ({
    entitlements: {
      active: productIdentifier
        ? { Premium: { productIdentifier } }
        : {},
    },
  });
  const createDependencies = (
    packages: Partial<
      Record<keyof typeof premiumOfferingNames, PremiumPurchasePackage>
    >,
  ): PremiumPurchaseExecutorDependencies => ({
    getCustomerInfo: async () => getCustomerInfo(checkedProductIdentifier),
    getOfferings: async () => ({
      all: Object.fromEntries(
        Object.entries(packages).map(([tierId, purchasePackage]) => [
          premiumOfferingNames[tierId as keyof typeof premiumOfferingNames],
          purchasePackage ? { availablePackages: [purchasePackage] } : undefined,
        ]),
      ),
    }),
    purchasePackage: async (purchasePackage) => {
      purchasedPackages.push(purchasePackage);
      return { customerInfo: getCustomerInfo(purchasedProductIdentifier) };
    },
    restorePurchases: async () => getCustomerInfo(restoredProductIdentifier),
  });
  const dependencies = createDependencies({
    lifetime: lifetimePackage,
    monthly: monthlyPackage,
    yearly: yearlyPackage,
  });

  assert.deepEqual(
    (await loadPremiumTiersWithDependencies(dependencies)).map((tier) => ({
      id: tier.id,
      price: tier.price,
    })),
    [
      { id: "monthly", price: "$1.99" },
      { id: "yearly", price: "$19.99" },
      { id: "lifetime", price: "$49.99" },
    ],
  );
  assert.deepEqual(
    await purchasePremiumTierWithDependencies("yearly", dependencies),
    {
      active: true,
      message: "Premium is active.",
      tierId: "yearly",
    },
  );
  assert.deepEqual(purchasedPackages, [yearlyPackage]);

  purchasedProductIdentifier = null;
  await assert.rejects(
    () => purchasePremiumTierWithDependencies("monthly", dependencies),
    /Premium entitlement was not activated/,
  );
  assert.throws(
    () => getPremiumPurchaseActivationResult(getCustomerInfo(null)),
    /Premium entitlement was not activated/,
  );
  assert.deepEqual(
    getPremiumPurchaseActivationResult(getCustomerInfo("SYNQPremiumYearly")),
    {
      active: true,
      message: "Premium is active.",
      tierId: "yearly",
    },
  );

  await assert.rejects(
    () =>
      purchasePremiumTierWithDependencies(
        "lifetime",
        createDependencies({ monthly: monthlyPackage, yearly: yearlyPackage }),
      ),
    /Premium Lifetime is unavailable/,
  );

  assert.deepEqual(await restorePremiumPurchaseWithDependencies(dependencies), {
    active: false,
    message: "No active premium purchase was found.",
    tierId: "monthly",
  });
  assert.deepEqual(getPremiumRestoreResult(getCustomerInfo(null)), {
    active: false,
    message: "No active premium purchase was found.",
    tierId: "monthly",
  });

  restoredProductIdentifier = "unmapped-product";
  assert.deepEqual(await restorePremiumPurchaseWithDependencies(dependencies), {
    active: true,
    message: "Premium purchase restored.",
    tierId: "monthly",
  });
  assert.deepEqual(getPremiumRestoreResult(getCustomerInfo("unmapped-product")), {
    active: true,
    message: "Premium purchase restored.",
    tierId: "monthly",
  });

  assert.deepEqual(await checkPremiumEntitlementWithDependencies(dependencies), {
    active: false,
    message: "Premium is inactive.",
    tierId: "monthly",
  });
  assert.deepEqual(getPremiumEntitlementStatusResult(getCustomerInfo(null)), {
    active: false,
    message: "Premium is inactive.",
    tierId: "monthly",
  });

  checkedProductIdentifier = "SYNQPremiumLifetime";
  assert.deepEqual(await checkPremiumEntitlementWithDependencies(dependencies), {
    active: true,
    message: "Premium is active.",
    tierId: "lifetime",
  });
  assert.deepEqual(
    getPremiumEntitlementStatusResult(getCustomerInfo("SYNQPremiumLifetime")),
    {
      active: true,
      message: "Premium is active.",
      tierId: "lifetime",
    },
  );
}

async function assertSettingsScreenSmoke() {
  const initialSettings = { allowAnalytics: true };
  const loadedSettings = { allowAnalytics: false };

  assert.deepEqual(defaultCustomizationSettings, {
    appIcon: "blue",
    hapticsEnabled: true,
    theme: "blue",
  });
  assert.deepEqual(
    customizationOptions.map((option) => option.key),
    ["blue", "mint", "orange", "pink", "purple", "red", "yellow"],
  );
  assert.equal(getCustomizationOption("mint").color, "#61ae7f");
  assert.equal(getCustomizationOption("blue").label, "Blue");
  assert.deepEqual(normalizeCustomizationSettings(null), {
    appIcon: "blue",
    hapticsEnabled: true,
    theme: "blue",
  });
  assert.deepEqual(
    normalizeCustomizationSettings({
      appIcon: "not-a-color",
      hapticsEnabled: false,
      theme: "pink",
    }),
    {
      appIcon: "blue",
      hapticsEnabled: false,
      theme: "pink",
    },
  );
  assert.deepEqual(defaultPrivacySettings, {
    allowAnalytics: true,
  });
  assert.deepEqual(normalizePrivacySettings(null), {
    allowAnalytics: true,
  });
  assert.deepEqual(normalizePrivacySettings({ allowAnalytics: false }), {
    allowAnalytics: false,
  });
  assert.deepEqual(normalizePrivacySettings({ allowAnalytics: "yes" }), {
    allowAnalytics: true,
  });

  const initialPersistenceState =
    createInitialSettingsPersistenceState(initialSettings);

  assert.deepEqual(initialPersistenceState, {
    error: null,
    settings: initialSettings,
    status: "idle",
  });

  assert.deepEqual(getSettingsPersistenceLoadAction(), { type: "load" });
  assert.deepEqual(getSettingsPersistenceLoadSuccessAction(loadedSettings), {
    settings: loadedSettings,
    type: "load-success",
  });
  assert.deepEqual(getSettingsPersistenceLoadFailureAction("Load failed"), {
    error: "Load failed",
    type: "load-failure",
  });
  assert.deepEqual(getSettingsPersistenceSaveAction(loadedSettings), {
    settings: loadedSettings,
    type: "save",
  });
  assert.deepEqual(getSettingsPersistenceSaveSuccessAction(loadedSettings), {
    settings: loadedSettings,
    type: "save-success",
  });
  assert.deepEqual(
    getSettingsPersistenceSaveFailureAction({
      error: "Save failed",
      settings: initialSettings,
    }),
    {
      error: "Save failed",
      settings: initialSettings,
      type: "save-failure",
    },
  );

  const loadingState = settingsPersistenceReducer(
    initialPersistenceState,
    getSettingsPersistenceLoadAction(),
  );
  assert.deepEqual(loadingState, {
    error: null,
    settings: initialSettings,
    status: "loading",
  });

  assert.deepEqual(
    settingsPersistenceReducer(
      loadingState,
      getSettingsPersistenceLoadSuccessAction(loadedSettings),
    ),
    {
      error: null,
      settings: loadedSettings,
      status: "idle",
    },
  );

  assert.deepEqual(
    settingsPersistenceReducer(
      loadingState,
      getSettingsPersistenceLoadFailureAction("Load failed"),
    ),
    {
      error: "Load failed",
      settings: initialSettings,
      status: "error",
    },
  );

  const savingState = settingsPersistenceReducer(
    initialPersistenceState,
    getSettingsPersistenceSaveAction(loadedSettings),
  );
  assert.deepEqual(savingState, {
    error: null,
    settings: loadedSettings,
    status: "saving",
  });

  assert.deepEqual(
    settingsPersistenceReducer(
      savingState,
      getSettingsPersistenceSaveSuccessAction(loadedSettings),
    ),
    {
      error: null,
      settings: loadedSettings,
      status: "idle",
    },
  );

  assert.deepEqual(
    settingsPersistenceReducer(
      savingState,
      getSettingsPersistenceSaveFailureAction({
        error: "Save failed",
        settings: initialSettings,
      }),
    ),
    {
      error: "Save failed",
      settings: initialSettings,
      status: "error",
    },
  );
  const settingsLoadCommandEvents: unknown[] = [];
  const dispatchSettingsLoadCommand = (
    action: SettingsPersistenceAction<typeof initialSettings>,
  ) => {
    settingsLoadCommandEvents.push(action);
  };
  await runSettingsLoadCommand({
    dispatch: dispatchSettingsLoadCommand,
    getErrorMessage: getCustomizationSettingsErrorMessage,
    isCurrent: () => true,
    loadSettings: async () => loadedSettings,
  });
  await runSettingsLoadCommand({
    dispatch: dispatchSettingsLoadCommand,
    getErrorMessage: getCustomizationSettingsErrorMessage,
    isCurrent: () => true,
    loadSettings: async () => {
      throw new Error("Load command failed");
    },
  });
  await runSettingsLoadCommand({
    dispatch: dispatchSettingsLoadCommand,
    getErrorMessage: getCustomizationSettingsErrorMessage,
    isCurrent: () => false,
    loadSettings: async () => loadedSettings,
  });
  await runSettingsLoadCommand({
    dispatch: dispatchSettingsLoadCommand,
    getErrorMessage: getCustomizationSettingsErrorMessage,
    isCurrent: () => false,
    loadSettings: async () => {
      throw new Error("Stale load failed");
    },
  });
  assert.deepEqual(settingsLoadCommandEvents, [
    { type: "load" },
    { settings: loadedSettings, type: "load-success" },
    { type: "load" },
    { error: "Load command failed", type: "load-failure" },
    { type: "load" },
    { type: "load" },
  ]);
  const settingsSaveCommandEvents: unknown[] = [];
  const dispatchSettingsSaveCommand = (
    action: SettingsPersistenceAction<typeof initialSettings>,
  ) => {
    settingsSaveCommandEvents.push(["dispatch", action]);
  };
  await runSettingsSaveCommand({
    beforeSave: () => {
      settingsSaveCommandEvents.push(["before-save"]);
    },
    currentSettings: initialSettings,
    dispatch: dispatchSettingsSaveCommand,
    getErrorMessage: getCustomizationSettingsErrorMessage,
    saveSettings: async (settings) => {
      settingsSaveCommandEvents.push(["save", settings]);
    },
    settings: loadedSettings,
  });
  await runSettingsSaveCommand({
    currentSettings: initialSettings,
    dispatch: dispatchSettingsSaveCommand,
    getErrorMessage: getCustomizationSettingsErrorMessage,
    saveSettings: async () => {
      throw new Error("Save command failed");
    },
    settings: loadedSettings,
  });
  await runSettingsSaveCommand({
    beforeSave: () => {
      throw new Error("Before-save failed");
    },
    currentSettings: initialSettings,
    dispatch: dispatchSettingsSaveCommand,
    getErrorMessage: getCustomizationSettingsErrorMessage,
    saveSettings: async (settings) => {
      settingsSaveCommandEvents.push(["skipped-save", settings]);
    },
    settings: loadedSettings,
  });
  assert.deepEqual(settingsSaveCommandEvents, [
    ["dispatch", { settings: loadedSettings, type: "save" }],
    ["before-save"],
    ["save", loadedSettings],
    ["dispatch", { settings: loadedSettings, type: "save-success" }],
    ["dispatch", { settings: loadedSettings, type: "save" }],
    [
      "dispatch",
      {
        error: "Save command failed",
        settings: initialSettings,
        type: "save-failure",
      },
    ],
    ["dispatch", { settings: loadedSettings, type: "save" }],
    [
      "dispatch",
      {
        error: "Before-save failed",
        settings: initialSettings,
        type: "save-failure",
      },
    ],
  ]);

  assert.equal(getSettingsHomeHref(), "/(tabs)/settings");
  assert.equal(getSettingsPremiumHref(), "/premium");
  assert.deepEqual(getSettingsBackLink(), {
    href: "/(tabs)/settings",
    label: "Back to Settings",
  });
  assert.equal(
    isSettingsDeveloperPremiumToggleVisible({ isDev: true }),
    true,
  );
  assert.equal(
    isSettingsDeveloperPremiumToggleVisible({ isDev: true, showToggle: false }),
    false,
  );
  assert.equal(
    isSettingsDeveloperPremiumToggleVisible({ isDev: false }),
    false,
  );
  assert.deepEqual(
    getSettingsDeveloperPremiumToggleState({ premiumActive: true }),
    {
      description:
        "Override premium entitlement while running a development build.",
      disabled: false,
      title: "Developer Premium Toggle",
      value: true,
    },
  );
  assert.deepEqual(
    getSettingsHomeControllerViewState({
      isDev: true,
      premiumActive: true,
    }),
    {
      developerPremiumToggleState:
        getSettingsDeveloperPremiumToggleState({ premiumActive: true }),
      routes: settingsRoutes,
      screenState: {
        premiumStatusLabel: "Premium active",
      },
    },
  );
  assert.equal(
    getSettingsHomeControllerViewState({
      isDev: false,
      premiumActive: false,
    }).developerPremiumToggleState,
    null,
  );
  assert.deepEqual(getPrivacyScreenViewState(), {
    backLink: {
      href: "/(tabs)/settings",
      label: "Back to Settings",
    },
    header: {
      kicker: "Preferences",
      subtitle: "Control local preferences for analytics and diagnostics.",
      title: "Privacy",
    },
    localFirstPanel: {
      body:
        "Your library, imports, backups, theme, and privacy preferences are stored on this device unless you choose to export or restore them.",
      title: "Local-first by default",
    },
    preference: {
      description:
        "Allow anonymous usage signals to help prioritize reliability and feature work.",
      title: "Analytics",
    },
  });
  assert.deepEqual(
    getPrivacyScreenControllerViewState({ status: "saving" }),
    {
      screenState: {
        isAnalyticsDisabled: false,
        statusLabel: "Saving",
      },
      viewState: getPrivacyScreenViewState(),
    },
  );
  assert.deepEqual(getSupportScreenViewState(), {
    backLink: {
      href: "/(tabs)/settings",
      label: "Back to Settings",
    },
    bugReportPanel: {
      body:
        "Include your device model, iOS or Android version, what you tapped before the issue, and whether the song file lives locally on-device.",
      title: "Before you send a bug",
    },
    header: {
      kicker: "Help",
      subtitle: "Get help, send feedback, or follow along with the project.",
      title: "Support",
    },
  });
  assert.deepEqual(getSupportScreenControllerViewState(), {
    actionRows: supportActions.map((action) => ({
      ...action,
      key: action.type === "url" ? action.url : action.type,
    })),
    viewState: getSupportScreenViewState(),
  });
  assert.deepEqual(
    supportActions.map((action) => action.label),
    ["Leave a Review", "Contact Support", "X", "Instagram", "Discord"],
  );
  assert.equal(getSupportActionKey(supportActions[0]!), "review");
  const supportActionCalls: string[] = [];
  let reviewAvailable = false;
  const supportActionDependencies: SettingsSupportActionDependencies = {
    isReviewAvailable: async () => {
      supportActionCalls.push("review-available");
      return reviewAvailable;
    },
    openUrl: async (url) => {
      supportActionCalls.push(`open:${url}`);
    },
    requestReview: async () => {
      supportActionCalls.push("request-review");
    },
  };
  await runSettingsSupportActionWithDependencies(
    supportActions[1]!,
    supportActionDependencies,
  );
  assert.deepEqual(supportActionCalls, [
    "open:https://directedbyshawn.com/synq-support",
  ]);

  supportActionCalls.length = 0;
  await runSettingsSupportActionWithDependencies(
    supportActions[0]!,
    supportActionDependencies,
  );
  assert.deepEqual(supportActionCalls, ["review-available"]);

  supportActionCalls.length = 0;
  reviewAvailable = true;
  await runSettingsSupportActionWithDependencies(
    supportActions[0]!,
    supportActionDependencies,
  );
  assert.deepEqual(supportActionCalls, [
    "review-available",
    "request-review",
  ]);
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
      premiumPanel: {
        body: "Unlock theme and app icon choices with Premium.",
        href: "/premium",
        title: "Premium customization locked",
      },
      showPremiumPanel: true,
      statusLabel: "Preferences saved locally",
      themeControlsDisabled: true,
    },
  );
  assert.deepEqual(
    getCustomizationScreenState({ premiumActive: true, status: "loading" }),
    {
      hapticsDisabled: true,
      premiumPanel: {
        body: "Unlock theme and app icon choices with Premium.",
        href: "/premium",
        title: "Premium customization locked",
      },
      showPremiumPanel: false,
      statusLabel: "Preferences saved locally",
      themeControlsDisabled: true,
    },
  );
  assert.deepEqual(
    getCustomizationScreenState({ premiumActive: true, status: "saving" }),
    {
      hapticsDisabled: false,
      premiumPanel: {
        body: "Unlock theme and app icon choices with Premium.",
        href: "/premium",
        title: "Premium customization locked",
      },
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
  const customizationColorControlsState = getCustomizationColorControlsState({
    appIcon: "red",
    disabled: true,
    themeKey: "mint",
  });
  assert.equal(customizationColorControlsState.rows.length, 2);
  assert.equal(customizationColorControlsState.rows[0].title, "Theme");
  assert.equal(customizationColorControlsState.rows[1].title, "App Icon");
  assert.equal(customizationColorControlsState.rows[0].options.length, 7);
  assert.deepEqual(
    customizationColorControlsState.rows[0].options.map((option) => ({
      isSelected: option.optionState.isSelected,
      key: option.key,
    })),
    [
      { isSelected: false, key: "blue" },
      { isSelected: true, key: "mint" },
      { isSelected: false, key: "orange" },
      { isSelected: false, key: "pink" },
      { isSelected: false, key: "purple" },
      { isSelected: false, key: "red" },
      { isSelected: false, key: "yellow" },
    ],
  );
  assert.deepEqual(
    customizationColorControlsState.rows[1].options.map((option) => ({
      disabled: option.optionState.accessibilityState.disabled,
      isSelected: option.optionState.isSelected,
      key: option.key,
    })),
    [
      { disabled: true, isSelected: false, key: "blue" },
      { disabled: true, isSelected: false, key: "mint" },
      { disabled: true, isSelected: false, key: "orange" },
      { disabled: true, isSelected: false, key: "pink" },
      { disabled: true, isSelected: false, key: "purple" },
      { disabled: true, isSelected: true, key: "red" },
      { disabled: true, isSelected: false, key: "yellow" },
    ],
  );
  const customizationControllerState =
    getCustomizationScreenControllerViewState({
      premiumActive: true,
      settings: {
        appIcon: "red",
        hapticsEnabled: true,
        theme: "mint",
      },
      status: "idle",
    });
  assert.equal(
    customizationControllerState.screenState.themeControlsDisabled,
    false,
  );
  assert.equal(
    customizationControllerState.colorControlsState.rows[0].options.find(
      (option) => option.key === "mint",
    )?.optionState.isSelected,
    true,
  );
  assert.equal(
    customizationControllerState.colorControlsState.rows[1].options.find(
      (option) => option.key === "red",
    )?.optionState.isSelected,
    true,
  );
  assert.equal(
    shouldSendHapticForHapticsToggle({ hapticsEnabled: true }),
    true,
  );
  assert.equal(
    shouldSendHapticForHapticsToggle({ hapticsEnabled: false }),
    false,
  );
  assert.deepEqual(getSettingsHapticCommand(), {
    haptic: "light",
  });
  assert.deepEqual(
    getCustomizationHapticsToggleCommand({ hapticsEnabled: true }),
    {
      haptic: "light",
    },
  );
  assert.equal(
    getCustomizationHapticsToggleCommand({ hapticsEnabled: false }),
    null,
  );
  const settingsInteractionEvents: unknown[] = [];
  runSettingsInteractionAction({
    action: () => {
      settingsInteractionEvents.push(["action", "theme"]);
    },
    sendHaptic: (haptic) => {
      settingsInteractionEvents.push(["haptic", haptic]);
    },
  });
  runCustomizationHapticsToggleAction({
    currentHapticsEnabled: true,
    nextHapticsEnabled: false,
    sendHaptic: (haptic) => {
      settingsInteractionEvents.push(["haptic", haptic]);
    },
    setHapticsEnabled: (hapticsEnabled) => {
      settingsInteractionEvents.push(["haptics-enabled", hapticsEnabled]);
    },
  });
  runCustomizationHapticsToggleAction({
    currentHapticsEnabled: false,
    nextHapticsEnabled: true,
    sendHaptic: (haptic) => {
      settingsInteractionEvents.push(["unexpected-haptic", haptic]);
    },
    setHapticsEnabled: (hapticsEnabled) => {
      settingsInteractionEvents.push(["haptics-enabled", hapticsEnabled]);
    },
  });
  assert.deepEqual(settingsInteractionEvents, [
    ["haptic", "light"],
    ["action", "theme"],
    ["haptic", "light"],
    ["haptics-enabled", false],
    ["haptics-enabled", true],
  ]);
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
    getPrivacySettingsErrorMessage(
      new Error("Privacy smoke failure"),
    ),
    "Privacy smoke failure",
  );
  assert.equal(
    getPrivacySettingsErrorMessage(undefined),
    "Privacy settings failed.",
  );
}

async function assertSettingsJsonFileStoreSmoke() {
  const calls: string[] = [];
  const files = new Map<string, string>();
  let documentDirectory: string | null = "file:///documents/";
  const dependencies: SettingsJsonFileStoreDependencies = {
    get documentDirectory() {
      return documentDirectory;
    },
    getInfo: async (path) => {
      calls.push(`info:${path}`);
      return { exists: files.has(path) };
    },
    makeDirectory: async (path, options) => {
      calls.push(`mkdir:${path}:${String(options.intermediates)}`);
    },
    readAsString: async (path) => {
      calls.push(`read:${path}`);
      const contents = files.get(path);
      if (contents === undefined) {
        throw new Error("Missing settings file.");
      }

      return contents;
    },
    writeAsString: async (path, contents) => {
      calls.push(`write:${path}:${contents}`);
      files.set(path, contents);
    },
  };
  const defaultSettings = {
    allowAnalytics: false,
    theme: "blue",
  };
  const normalizeSettings = (value: unknown) => {
    if (!value || typeof value !== "object") {
      return defaultSettings;
    }

    const candidate = value as Partial<typeof defaultSettings>;

    return {
      allowAnalytics:
        typeof candidate.allowAnalytics === "boolean"
          ? candidate.allowAnalytics
          : defaultSettings.allowAnalytics,
      theme: candidate.theme === "mint" ? "mint" : defaultSettings.theme,
    };
  };
  const loadSettings = () =>
    loadSettingsFromJsonFileWithDependencies({
      defaultSettings,
      dependencies,
      fileName: "preferences.json",
      normalizeSettings,
    });
  const saveSettings = (settings: typeof defaultSettings) =>
    saveSettingsToJsonFileWithDependencies({
      dependencies,
      fileName: "preferences.json",
      normalizeSettings,
      settings,
    });

  assert.deepEqual(await loadSettings(), defaultSettings);
  assert.deepEqual(calls, [
    "info:file:///documents/settings/preferences.json",
  ]);

  files.set("file:///documents/settings/preferences.json", "{not-json");
  calls.length = 0;
  assert.deepEqual(await loadSettings(), defaultSettings);
  assert.deepEqual(calls, [
    "info:file:///documents/settings/preferences.json",
    "read:file:///documents/settings/preferences.json",
  ]);

  files.set(
    "file:///documents/settings/preferences.json",
    JSON.stringify({ allowAnalytics: true, theme: "mint" }),
  );
  calls.length = 0;
  assert.deepEqual(await loadSettings(), {
    allowAnalytics: true,
    theme: "mint",
  });
  assert.deepEqual(calls, [
    "info:file:///documents/settings/preferences.json",
    "read:file:///documents/settings/preferences.json",
  ]);

  calls.length = 0;
  await saveSettings({ allowAnalytics: true, theme: "invalid" });
  assert.deepEqual(calls, [
    "mkdir:file:///documents/settings:true",
    `write:file:///documents/settings/preferences.json:${JSON.stringify(
      { allowAnalytics: true, theme: "blue" },
      null,
      2,
    )}`,
  ]);

  documentDirectory = null;
  calls.length = 0;
  assert.deepEqual(await loadSettings(), defaultSettings);
  await assert.rejects(() => saveSettings(defaultSettings), /document directory/);
}

async function assertShareExportFilesExecutorSmoke() {
  const calls: string[] = [];
  let cacheDirectory: string | null = "file:///cache/";
  let failCopyFrom: string | null = null;
  const dependencies: ShareExportFilesDependencies = {
    get cacheDirectory() {
      return cacheDirectory;
    },
    copyFile: async ({ from, to }) => {
      calls.push(`copy:${from}:${to}`);
      if (from === failCopyFrom) {
        throw new Error("Copy failed.");
      }
    },
    deletePath: async (path, options) => {
      calls.push(`delete:${path}:${String(options.idempotent)}`);
    },
    makeDirectory: async (path, options) => {
      calls.push(`mkdir:${path}:${String(options.intermediates)}`);
    },
    now: () => 12345,
    sharePath: async (path) => {
      calls.push(`share:${path}`);
    },
  };
  const shareFiles = (files: { fileNameFallback: string; sourceUri: string }[]) =>
    shareExportFilesWithDependencies({
      dependencies,
      directoryPrefix: "synq-smoke-export",
      files,
      noFilesMessage: "No smoke files are available.",
    });

  assert.equal(sanitizeExportFileName("  Smoke Song!.mp3  "), "Smoke-Song-.mp3");
  assert.equal(sanitizeExportFileName("   "), "song");
  assert.equal(
    getExportFileNameFromPath("file:///cache/My%20Song.m4a", "Fallback Song"),
    "My-Song.m4a",
  );
  assert.equal(
    getShareExportFileName(
      { fileNameFallback: "Fallback Song", sourceUri: "file:///tmp/Track 1.mp3" },
      0,
    ),
    "1-Track-1.mp3",
  );

  await assert.rejects(() => shareFiles([]), /No smoke files/);

  assert.deepEqual(
    await shareFiles([
      {
        fileNameFallback: "Only Song",
        sourceUri: "file:///tmp/only.mp3",
      },
    ]),
    { exported: 1 },
  );
  assert.deepEqual(calls, ["share:file:///tmp/only.mp3"]);

  calls.length = 0;
  assert.deepEqual(
    await shareFiles([
      {
        fileNameFallback: "First Song",
        sourceUri: "file:///tmp/first.mp3",
      },
      {
        fileNameFallback: "Second Song",
        sourceUri: "file:///tmp/second song.mp3",
      },
    ]),
    { exported: 2 },
  );
  assert.deepEqual(calls, [
    "mkdir:file:///cache/synq-smoke-export-12345:true",
    "copy:file:///tmp/first.mp3:file:///cache/synq-smoke-export-12345/1-first.mp3",
    "copy:file:///tmp/second song.mp3:file:///cache/synq-smoke-export-12345/2-second-song.mp3",
    "share:file:///cache/synq-smoke-export-12345",
    "delete:file:///cache/synq-smoke-export-12345:true",
  ]);

  cacheDirectory = null;
  await assert.rejects(
    () =>
      shareFiles([
        { fileNameFallback: "First Song", sourceUri: "file:///tmp/first.mp3" },
        { fileNameFallback: "Second Song", sourceUri: "file:///tmp/second.mp3" },
      ]),
    /Cache directory is unavailable/,
  );

  cacheDirectory = "file:///cache/";
  calls.length = 0;
  failCopyFrom = "file:///tmp/second.mp3";
  await assert.rejects(
    () =>
      shareFiles([
        { fileNameFallback: "First Song", sourceUri: "file:///tmp/first.mp3" },
        { fileNameFallback: "Second Song", sourceUri: "file:///tmp/second.mp3" },
      ]),
    /Copy failed/,
  );
  assert.deepEqual(calls, [
    "mkdir:file:///cache/synq-smoke-export-12345:true",
    "copy:file:///tmp/first.mp3:file:///cache/synq-smoke-export-12345/1-first.mp3",
    "copy:file:///tmp/second.mp3:file:///cache/synq-smoke-export-12345/2-second.mp3",
    "delete:file:///cache/synq-smoke-export-12345:true",
  ]);
}

async function assertLibraryExportShareExecutorSmoke() {
  const calls: unknown[] = [];
  let sharingAvailable = true;
  const songs = [
    { id: 1, pathToFile: "file:///music/first.mp3", title: "First" },
    { id: 2, pathToFile: null, title: "Missing File" },
    { id: 3, pathToFile: "file:///music/third.mp3", title: "Third" },
  ];
  const dependencies: LibraryExportShareDependencies = {
    assertSharingAvailable: async () => {
      calls.push(["available"]);

      if (!sharingAvailable) {
        throw new Error("Sharing is unavailable on this device.");
      }
    },
    prepareLibrarySongForExport: async (song) => {
      calls.push(["prepare", song.id]);
      return `file:///prepared/${song.id}.mp3`;
    },
    shareExportFiles: async (params) => {
      calls.push(["share", params]);
      return { exported: params.files.length };
    },
  };

  assert.deepEqual(
    getPlayableLibraryExportSongs(songs).map((song) => song.id),
    [1, 3],
  );
  assert.deepEqual(
    await shareLibrarySongsWithDependencies(songs, dependencies),
    { exported: 2 },
  );
  assert.deepEqual(calls, [
    ["available"],
    ["prepare", 1],
    ["prepare", 3],
    [
      "share",
      {
        directoryPrefix: "synq-export",
        files: [
          { fileNameFallback: "First", sourceUri: "file:///prepared/1.mp3" },
          { fileNameFallback: "Third", sourceUri: "file:///prepared/3.mp3" },
        ],
        noFilesMessage: "No playable songs are available to export.",
      },
    ],
  ]);

  calls.length = 0;
  await shareLibrarySongsWithDependencies(
    [{ id: 4, pathToFile: null, title: "Silent" }],
    dependencies,
  );
  assert.deepEqual(calls, [
    ["available"],
    [
      "share",
      {
        directoryPrefix: "synq-export",
        files: [],
        noFilesMessage: "No playable songs are available to export.",
      },
    ],
  ]);

  calls.length = 0;
  sharingAvailable = false;
  await assert.rejects(
    () => shareLibrarySongsWithDependencies(songs, dependencies),
    /Sharing is unavailable/,
  );
  assert.deepEqual(calls, [["available"]]);
}

async function assertImportDraftExportExecutorSmoke() {
  const calls: unknown[] = [];
  let sharingAvailable = true;
  const drafts = [
    importDraft(1),
    {
      ...importDraft(2),
      cacheUri: "file:///cache/fallback.mp3",
      fileName: "",
      title: "Fallback Title",
    },
  ];
  const dependencies: ImportDraftExportDependencies = {
    assertSharingAvailable: async () => {
      calls.push(["available"]);

      if (!sharingAvailable) {
        throw new Error("Sharing is unavailable on this device.");
      }
    },
    shareExportFiles: async (params) => {
      calls.push(["share", params]);
      return { exported: params.files.length };
    },
  };

  assert.deepEqual(getImportDraftExportFiles(drafts), [
    {
      fileNameFallback: "import-1.mp3",
      sourceUri: "/tmp/import-1.mp3",
    },
    {
      fileNameFallback: "Fallback Title",
      sourceUri: "file:///cache/fallback.mp3",
    },
  ]);
  assert.deepEqual(
    await shareImportDraftSongsWithDependencies(drafts, dependencies),
    { exported: 2 },
  );
  assert.deepEqual(calls, [
    ["available"],
    [
      "share",
      {
        directoryPrefix: "synq-import-export",
        files: [
          {
            fileNameFallback: "import-1.mp3",
            sourceUri: "/tmp/import-1.mp3",
          },
          {
            fileNameFallback: "Fallback Title",
            sourceUri: "file:///cache/fallback.mp3",
          },
        ],
        noFilesMessage: "No staged songs are available to export.",
      },
    ],
  ]);

  calls.length = 0;
  sharingAvailable = false;
  await assert.rejects(
    () => shareImportDraftSongsWithDependencies(drafts, dependencies),
    /Sharing is unavailable/,
  );
  assert.deepEqual(calls, [["available"]]);
}

async function assertLibraryExportMetadataExecutorSmoke() {
  const calls: string[] = [];
  let stale = true;
  let songRow: LibraryExportSongMetadataRow = {
    coverImage: null,
    fileType: "audio/mpeg",
    pathToFile: "file:///library/song.mp3",
    title: null,
  };
  let artworkExists = true;
  let writeFails = false;
  const dependencies: LibraryExportMetadataDependencies = {
    getImagePathFromHash: (hash) => ({
      pathToFullImage: `file:///documents/images/${hash}-full.jpg`,
    }),
    getInfo: async (path) => {
      calls.push(`info:${path}`);
      return { exists: artworkExists };
    },
    isLibrarySongSnapshotStale: async (songId) => {
      calls.push(`stale:${songId}`);
      return stale;
    },
    loadAlbumRows: async (songId) => {
      calls.push(`albums:${songId}`);
      return [
        { coverImage: "album-cover", name: "Beta Album" },
        { coverImage: null, name: "Alpha Album" },
        { coverImage: null, name: null },
      ];
    },
    loadArtistRows: async (songId) => {
      calls.push(`artists:${songId}`);
      return [{ name: "Beta Artist" }, { name: "Alpha Artist" }];
    },
    loadSongRow: async (songId) => {
      calls.push(`song:${songId}`);
      return songRow;
    },
    markLibrarySongAsExported: async (songId) => {
      calls.push(`mark:${songId}`);
    },
    readAsString: async (path, options) => {
      calls.push(`read:${path}:${options.encoding}`);
      return "base64-cover";
    },
    writeTags: async ({ filePath, fileType, tags }) => {
      calls.push(
        `write:${filePath}:${fileType}:${tags.title}:${tags.artist}:${tags.album}:${tags.APIC?.imageBuffer ?? "none"}`,
      );
      if (writeFails) {
        throw new Error("tag write failed");
      }
    },
  };

  assert.equal(formatLibraryExportNames(["Beta", "", "Alpha"]), "Alpha, Beta");
  assert.deepEqual(
    buildLibrarySongExportMetadata({
      albums: [
        { coverImage: "album-cover", name: "Album" },
        { coverImage: null, name: null },
      ],
      artists: [{ name: "Artist" }],
      song: {
        coverImage: "song-cover",
        fileType: "audio/mpeg",
        pathToFile: "file:///library/song.mp3",
        title: null,
      },
    }),
    {
      album: "Album",
      artist: "Artist",
      coverImage: "song-cover",
      fileType: "audio/mpeg",
      pathToFile: "file:///library/song.mp3",
      title: "Untitled song",
    },
  );
  assert.deepEqual(
    await loadArtworkTagWithDependencies("cover-hash", dependencies),
    {
      description: "Album Cover",
      imageBuffer: "base64-cover",
      mime: "image/jpeg",
    },
  );
  assert.deepEqual(calls, [
    "info:file:///documents/images/cover-hash-full.jpg",
    "read:file:///documents/images/cover-hash-full.jpg:base64",
  ]);

  assert.deepEqual(
    buildLibraryExportAudioTags({
      artwork: {
        description: "Album Cover",
        imageBuffer: "base64-cover",
        mime: "image/jpeg",
      },
      metadata: {
        album: "Smoke Album",
        artist: "Smoke Artist",
        coverImage: "cover-hash",
        fileType: "audio/mpeg",
        pathToFile: "file:///song.mp3",
        title: "Smoke Song",
      },
    }),
    {
      APIC: {
        description: "Album Cover",
        imageBuffer: "base64-cover",
        mime: "image/jpeg",
      },
      album: "Smoke Album",
      artist: "Smoke Artist",
      title: "Smoke Song",
    },
  );
  assert.deepEqual(
    buildLibraryExportAudioTags({
      artwork: null,
      metadata: {
        album: "",
        artist: "",
        coverImage: null,
        fileType: null,
        pathToFile: "file:///song.mp3",
        title: "Untitled song",
      },
    }),
    {
      album: "",
      artist: "",
      title: "Untitled song",
    },
  );

  calls.length = 0;
  artworkExists = false;
  assert.equal(
    await loadArtworkTagWithDependencies("missing-cover", dependencies),
    null,
  );
  assert.deepEqual(calls, [
    "info:file:///documents/images/missing-cover-full.jpg",
  ]);

  calls.length = 0;
  stale = false;
  assert.equal(
    await prepareLibrarySongForExportWithDependencies(
      { id: 42, pathToFile: "file:///original.mp3" },
      dependencies,
    ),
    "file:///original.mp3",
  );
  assert.deepEqual(calls, ["stale:42"]);

  calls.length = 0;
  stale = true;
  artworkExists = true;
  assert.equal(
    await prepareLibrarySongForExportWithDependencies(
      { id: 43, pathToFile: "file:///fallback.mp3" },
      dependencies,
    ),
    "file:///library/song.mp3",
  );
  assert.deepEqual(calls, [
    "stale:43",
    "song:43",
    "artists:43",
    "albums:43",
    "info:file:///documents/images/album-cover-full.jpg",
    "read:file:///documents/images/album-cover-full.jpg:base64",
    "write:file:///library/song.mp3:audio/mpeg:Untitled song:Alpha Artist, Beta Artist:Alpha Album, Beta Album:base64-cover",
    "mark:43",
  ]);

  calls.length = 0;
  songRow = { ...songRow, pathToFile: null };
  assert.equal(
    await prepareLibrarySongForExportWithDependencies(
      { id: 44, pathToFile: "file:///fallback.mp3" },
      dependencies,
    ),
    "file:///fallback.mp3",
  );
  assert.deepEqual(calls, ["stale:44", "song:44", "artists:44", "albums:44"]);

  calls.length = 0;
  songRow = {
    coverImage: "song-cover",
    fileType: "audio/mp4",
    pathToFile: "file:///library/song.m4a",
    title: "Tagged Song",
  };
  writeFails = true;
  assert.equal(
    await prepareLibrarySongForExportWithDependencies(
      { id: 45, pathToFile: "file:///fallback.m4a" },
      dependencies,
    ),
    "file:///library/song.m4a",
  );
  assert.deepEqual(calls, [
    "stale:45",
    "song:45",
    "artists:45",
    "albums:45",
    "info:file:///documents/images/song-cover-full.jpg",
    "read:file:///documents/images/song-cover-full.jpg:base64",
    "write:file:///library/song.m4a:audio/mp4:Tagged Song:Alpha Artist, Beta Artist:Alpha Album, Beta Album:base64-cover",
  ]);
}

async function assertImageStorageExecutorSmoke() {
  const calls: string[] = [];
  const existingFiles = new Set<string>();
  let storedImageHash = false;
  let imageDirectory: string | null = "file:///documents/images";
  const dependencies: ImageStorageDependencies = {
    createDirectory: async (path, options) => {
      calls.push(`mkdir:${path}:${String(options.intermediates)}`);
    },
    digestImageSample: async (sample) => {
      calls.push(`digest:${sample}`);
      return "hash-123";
    },
    get getInfo() {
      return async (path: string) => {
        calls.push(`info:${path}`);
        return { exists: existingFiles.has(path) };
      };
    },
    hasStoredImageHash: async (hash) => {
      calls.push(`has-row:${hash}`);
      return storedImageHash;
    },
    get imageDirectory() {
      return imageDirectory;
    },
    insertStoredImageHash: async (hash) => {
      calls.push(`insert-row:${hash}`);
      storedImageHash = true;
    },
    writeImageVariant: async ({ base64, compress, path, width }) => {
      calls.push(`write:${path}:${width}:${compress}:${base64}`);
      existingFiles.add(path);
    },
  };
  const paths = {
    pathToFullImage: "file:///documents/images/hash-123-full.jpg",
    pathToSmallImage: "file:///documents/images/hash-123-small.jpg",
  };

  assert.deepEqual(splitImageData("data:image/png;base64,abc123"), {
    buffer: "abc123",
    mime: "image/png",
  });
  assert.deepEqual(
    getImagePathFromDirectory({
      hash: "hash-123",
      imageDirectory: "file:///documents/images",
    }),
    paths,
  );
  assert.deepEqual(getImagePathFromHashWithDependencies("hash-123", dependencies), paths);
  assert.deepEqual(getImageStorageVariants({ base64: "abc123", paths }), [
    {
      base64: "abc123",
      compress: 1,
      path: paths.pathToFullImage,
      width: 1500,
    },
    {
      base64: "abc123",
      compress: 0.5,
      path: paths.pathToSmallImage,
      width: 200,
    },
  ]);

  assert.equal(await saveCoverImageWithDependencies(null, dependencies), null);
  assert.deepEqual(calls, []);

  assert.equal(
    await checkStoredImageExistsWithDependencies("hash-123", dependencies),
    false,
  );
  assert.deepEqual(calls, [
    `info:${paths.pathToFullImage}`,
    `info:${paths.pathToSmallImage}`,
    "has-row:hash-123",
  ]);

  calls.length = 0;
  assert.equal(
    await saveCoverImageWithDependencies(
      "data:image/jpeg;base64,cover-data",
      dependencies,
    ),
    "hash-123",
  );
  assert.deepEqual(calls, [
    "mkdir:file:///documents/images:true",
    "digest:data:image/jpeg;base64,cover-data",
    `info:${paths.pathToFullImage}`,
    `info:${paths.pathToSmallImage}`,
    "has-row:hash-123",
    `write:${paths.pathToFullImage}:1500:1:cover-data`,
    `write:${paths.pathToSmallImage}:200:0.5:cover-data`,
    "insert-row:hash-123",
  ]);

  calls.length = 0;
  existingFiles.add(paths.pathToFullImage);
  existingFiles.add(paths.pathToSmallImage);
  storedImageHash = true;
  assert.equal(
    await saveCoverImageWithDependencies(
      "data:image/jpeg;base64,cover-data",
      dependencies,
    ),
    "hash-123",
  );
  assert.deepEqual(calls, [
    "mkdir:file:///documents/images:true",
    "digest:data:image/jpeg;base64,cover-data",
    `info:${paths.pathToFullImage}`,
    `info:${paths.pathToSmallImage}`,
    "has-row:hash-123",
  ]);

  calls.length = 0;
  await assert.rejects(
    () =>
      writeImageToFileSystemWithDependencies({
        base64Image: "data:image/gif;base64,abc123",
        dependencies,
        hash: "hash-123",
      }),
    /Invalid image format: image\/gif/,
  );
  assert.deepEqual(calls, []);

  imageDirectory = null;
  assert.throws(
    () => getImagePathFromHashWithDependencies("hash-123", dependencies),
    /Document directory is unavailable/,
  );
}

assertDurationFormatSmoke();
assertRouteParamSmoke();
assertRewriteFeatureMapSmoke();
assertHomeScreenSmoke();
assertImportSongFormSmoke();
assertPlaybackNativeStatusSmoke();
assertPlaybackNativePlayerStateSmoke();
assertPlaybackNativeCommandPlanSmoke();
assertPlaybackPlayerStateSmoke();
void assertImportLibrarySavePlanSmoke().then(async () => {
  await assertPlaybackSessionSmoke();
  await assertBackupScreenSmoke();
  await assertPremiumScreenSmoke();
  await assertSettingsScreenSmoke();
  await assertPlaybackPersistenceExecutorSmoke();
  await assertImportFileCacheExecutorSmoke();
  await assertImportFileSelectionExecutorSmoke();
  await assertImportSessionPersistenceExecutorSmoke();
  await assertImportLibraryFileExecutorSmoke();
  await assertImportLibraryLinkExecutorSmoke();
  await assertImportLibrarySongRowExecutorSmoke();
  await assertWifiImportRequestSmoke();
  await assertBackupFileSystemExecutorSmoke();
  await assertBackupCommandExecutorSmoke();
  await assertPremiumPurchaseExecutorSmoke();
  await assertSettingsJsonFileStoreSmoke();
  await assertShareExportFilesExecutorSmoke();
  await assertLibraryExportShareExecutorSmoke();
  await assertImportDraftExportExecutorSmoke();
  await assertLibraryExportMetadataExecutorSmoke();
  await assertImageStorageExecutorSmoke();
  await assertImportSessionSmoke();
  assertLibraryCollectionDetailSmoke();
  await assertLibraryCollectionInteractionSmoke();
  await assertCollectionDeleteExecutorSmoke();
  await assertCollectionSongMembershipExecutorSmoke();
  await assertCollectionSongAddExecutorSmoke();
  await assertCollectionSongRelationshipExecutorSmoke();
  assertLibraryCollectionPreviewSmoke();
  assertLibrarySongPreviewSmoke();
  assertAddableCollectionSongsSmoke();
  await assertLibrarySongDetailSmoke();
  await assertLibrarySongDeleteExecutorSmoke();
  await assertLibrarySongExportSnapshotExecutorSmoke();
  assertEditCollectionQuerySmoke();
  await assertCollectionFormSmoke();
  await assertCollectionImagePickerExecutorSmoke();
  await assertAlbumArtistUpdateExecutorSmoke();
  await assertSongMetadataRelationshipExecutorSmoke();
  await assertSongMetadataUpdateExecutorSmoke();
  await assertCollectionUniquenessExecutorSmoke();
  await assertCollectionCreateExecutorSmoke();
  await assertCollectionUpdateExecutorSmoke();
  await assertCollectionFormMutationSmoke();
  assertLibraryCollectionListSmoke();
  assertLibraryHomeSmoke();
  console.log("Rewrite deterministic smoke checks passed.");
});
