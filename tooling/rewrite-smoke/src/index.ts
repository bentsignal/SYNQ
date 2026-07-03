import assert from "node:assert/strict";
import {
  formatDurationMs,
  formatRemainingDurationMs,
} from "../../../apps/new/src/features/app-shell/services/duration-format-service";
import {
  getHomeGuideSections,
  getHomeLibraryHref,
  getHomeNowPlayingActions,
  getHomeNowPlayingState,
  getHomeQuickActions,
  getHomeRecentSongHref,
} from "../../../apps/new/src/features/app-shell/services/home-screen-service";
import { parseNumericRouteParam } from "../../../apps/new/src/features/app-shell/services/route-param-service";
import {
  getActiveTrack,
  getNextQueueIndex,
} from "../../../apps/new/src/features/playback/services/playback-queue-service";
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
  getPlaybackQueueRowPresentation,
  getPlaybackQueueRowState,
} from "../../../apps/new/src/features/playback/services/playback-queue-row-service";
import {
  initialPlaybackState,
} from "../../../apps/new/src/features/playback/services/playback-initial-state-service";
import {
  playbackReducer,
} from "../../../apps/new/src/features/playback/services/playback-session-service";
import {
  addPlaybackQueueSong,
  clearPlaybackQueue,
  movePlaybackQueueSong,
  removePlaybackQueueSong,
} from "../../../apps/new/src/features/playback/services/playback-session-queue-service";
import {
  normalizePlaybackState,
  toPersistedPlaybackState,
} from "../../../apps/new/src/features/playback/services/playback-persistence-codec-service";
import {
  clearPersistedPlaybackStateWithDependencies,
  getPlaybackStateDirectoryWithDependencies,
  getPlaybackStateFileWithDependencies,
  loadPersistedPlaybackStateWithDependencies,
  savePersistedPlaybackStateWithDependencies,
  type PlaybackPersistenceDependencies,
} from "../../../apps/new/src/features/playback/services/playback-persistence-executor-service";
import {
  getFreeListeningRemainingMs,
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
  getPlaybackAdBreakPanelState,
  getPlaybackMiniPlayerState,
  getPlaybackPlayerHref,
  getPlaybackPlayerScreenState,
  getPlaybackPremiumHref,
  getPlaybackQueueEmptyState,
  getPlaybackQueueHref,
  getPlaybackQueueScreenState,
} from "../../../apps/new/src/features/playback/services/playback-screen-state-service";
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
  getImportSaveExportFailureCommand,
  getImportSaveExportSuccessCommand,
  importSaveExportReducer,
  initialImportSaveExportState,
} from "../../../apps/new/src/features/import/services/import-save-export-state-service";
import {
  getImportDiscardResultCommand,
  getImportFinishResultCommand,
  getImportSaveSessionStartHaptic,
  getImportSaveToggleCommand,
} from "../../../apps/new/src/features/import/services/import-save-session-command-service";
import {
  getImportSaveBackLink,
  getImportSaveActionState,
  getImportSaveHeaderState,
  getImportSaveLibraryToggleState,
  getImportSongPreviewEmptyState,
} from "../../../apps/new/src/features/import/services/import-save-screen-state-service";
import {
  getImportFailureState,
  getImportFailureViewState,
  getImportSuccessState,
  getImportSuccessViewState,
} from "../../../apps/new/src/features/import/services/import-result-screen-state-service";
import {
  getImportFilesActionState,
  getImportFilesActionLinks,
} from "../../../apps/new/src/features/import/services/import-files-screen-state-service";
import {
  getImportHomeRouteSelectCommand,
  getImportHomeState,
} from "../../../apps/new/src/features/import/services/import-home-screen-state-service";
import {
  getImportPremiumGateActionCommand,
  getImportPremiumGateState,
} from "../../../apps/new/src/features/import/services/import-premium-gate-state-service";
import {
  getImportWifiActionState,
  getImportWifiReviewSaveHaptic,
  getImportWifiState,
} from "../../../apps/new/src/features/import/services/import-wifi-screen-state-service";
import {
  importSessionReducer,
} from "../../../apps/new/src/features/import/services/import-session-state-service";
import {
  initialImportSessionState,
} from "../../../apps/new/src/features/import/services/import-session-initial-state-service";
import {
  getBeginFilePickAction,
  getBeginWifiTransferAction,
  getFailImportSessionAction,
  getFinishWifiTransferAction,
  getImportSessionCommandErrorMessage,
  getReceiveWifiSongAction,
  getRemoveImportSongsAction,
  getReviewImportSongsAction,
  getSetImportSaveToLibraryAction,
  getUpdateImportSongAction,
} from "../../../apps/new/src/features/import/services/import-session-command-service";
import {
  discardImportSessionLifecycle,
  getFinishImportSessionAction,
  resetImportSessionLifecycle,
  saveImportSessionLifecycle,
} from "../../../apps/new/src/features/import/services/import-session-lifecycle-service";
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
import {
  buildEditedImportSongDraft,
  getImportSongEditActionState,
  getImportSongEditErrorMessage,
  getImportSongEditFieldState,
  getImportSongEditInitialState,
  getImportSongEditRequiredTitleMessage,
  importSongEditFormReducer,
  parseImportTrackInput,
} from "../../../apps/new/src/features/import/services/import-song-edit-form-state-service";
import {
  getImportSongDraftForEdit,
  getImportSongEditScreenState,
} from "../../../apps/new/src/features/import/services/import-song-edit-screen-state-service";
import {
  getImportSongEditInvalidSaveCommand,
  getImportSongEditSaveFailureCommand,
  getImportSongEditSaveSuccessCommand,
} from "../../../apps/new/src/features/import/services/import-song-edit-command-service";
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
  linkImportSongToLibraryWithDependencies,
  type ImportLibraryLinkDependencies,
} from "../../../apps/new/src/features/import/services/import-library-link-executor-service";
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
  getBase64ImportCacheDestination,
  getCopyImportCacheDestination,
  getImportCacheDirectory,
  sanitizeImportCacheFileName,
  writeBase64AssetToImportCacheWithDependencies,
  type ImportFileCacheDependencies,
} from "../../../apps/new/src/features/import/services/import-file-cache-executor-service";
import {
  getImportFileCommandErrorMessage,
  getImportFileRemovalResultCommand,
  getImportFileRemovalStartHaptic,
  getImportFileSelectionResultCommand,
  getImportFileSelectionStartHaptic,
} from "../../../apps/new/src/features/import/services/import-file-command-service";
import {
  getWifiImportServerStartErrorMessage,
  getWifiStartTransferDecision,
  getWifiTransferSize,
  getWifiUploadDecision,
  getWifiUploadFailureResponse,
  isWifiImportTransferPathname,
  wifiImportFinishResponse,
  wifiImportPrepareFailureResponse,
  wifiImportResetResponse,
} from "../../../apps/new/src/features/import/services/wifi-import-request-service";
import {
  getWifiImportServerAddress,
  initialWifiImportServerState,
  wifiImportServerReducer,
} from "../../../apps/new/src/features/import/services/wifi-import-server-state-service";
import {
  createWifiImportRouteHandlers,
  createWifiImportRouteRuntimeState,
  type WifiBridgeRequest,
  type WifiBridgeResponse,
} from "../../../apps/new/src/features/import/services/wifi-import-route-handler-service";
import type { ImportSongDraft } from "../../../apps/new/src/features/import/types/import-session";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
} from "../../../apps/new/src/features/library/services/library-collection-detail-service";
import { rowsToCollectionDetailSongs } from "../../../apps/new/src/features/library/services/library-collection-detail-song-service";
import {
  getAddableSongRowState,
  getAddableSongSelectionState,
  getSelectedAddableSongIds,
  removeSongIdSelection,
  toggleSongIdSelection,
} from "../../../apps/new/src/features/library/services/add-collection-songs-selection-service";
import {
  addCollectionSongsControllerReducer,
  initialAddCollectionSongsControllerState,
} from "../../../apps/new/src/features/library/services/add-collection-songs-state-service";
import {
  addCollectionSongsSearchReducer,
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
  canEditLibraryCollection,
  canDeleteLibraryCollection,
  canMutateLibraryCollectionMembership,
  getCollectionDetailActionState,
  getPlayableCollectionSongs,
} from "../../../apps/new/src/features/library/services/library-collection-action-state-service";
import {
  getCollectionDetailStatusState,
  getCollectionDetailViewState,
  getDeleteCollectionConfirmationCopy,
  getLibraryCollectionSongEmptyState,
} from "../../../apps/new/src/features/library/services/library-collection-interaction-service";
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
import {
  collectionDetailMutationReducer,
  getCollectionDetailMutationErrorMessage,
  initialCollectionDetailMutationState,
} from "../../../apps/new/src/features/library/services/library-collection-mutation-state-service";
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
  getCollectionSongListState,
  getCollectionSongOrderUpdate,
  getCollectionSongRowActionState,
  reorderCollectionSongs,
} from "../../../apps/new/src/features/library/services/library-collection-song-mutation-service";
import {
  getCollectionPlaybackCommandPlan,
  getCollectionPlaybackPlan,
  getCollectionQueueCommandPlan,
  getCollectionQueuePlan,
} from "../../../apps/new/src/features/library/services/library-collection-playback-service";
import {
  albumRowsToPreview,
  artistRowsToPreview,
  playlistRowsToPreview,
} from "../../../apps/new/src/features/library/services/library-collection-preview-row-service";
import {
  getLibraryCollectionPreviewEmptyState,
  getLibraryCollectionPreviewHref,
} from "../../../apps/new/src/features/library/services/library-collection-preview-service";
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
  getCollectionFormBeginSaveCommand,
  getCollectionFormBlockedSaveCommand,
  getCollectionFormFailureCommand,
  getCollectionFormImagePickedCommand,
  getCollectionFormImagePickFailureCommand,
  getCollectionFormImagePickStartCommand,
  getCollectionFormSuccessCommand,
} from "../../../apps/new/src/features/library/services/collection-form-command-state-service";
import {
  getCollectionFormActionState,
  getCollectionFormFieldState,
  getCollectionFormImageLabel,
  getCollectionFormPreviewInitial,
  getCollectionFormSaveLabel,
  getSavedCollectionFormImageLabel,
} from "../../../apps/new/src/features/library/services/collection-form-interaction-service";
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
  getAddCollectionSongsBackHref,
  getAddCollectionSongsBackLink,
  getAddCollectionSongsHeaderState,
  getAddCollectionSongsStatusState,
  getAddCollectionSongsUpdatedLabel,
} from "../../../apps/new/src/features/library/services/addable-collection-songs-screen-state-service";
import { buildEditCollectionState } from "../../../apps/new/src/features/library/services/edit-collection-query-service";
import {
  filterCollectionPreviews,
  getLibraryCollectionCreateHref,
  getLibraryCollectionListBackHref,
  getLibraryCollectionListCopy,
  getLibraryCollectionListState,
} from "../../../apps/new/src/features/library/services/library-collection-list-service";
import {
  initialLibraryCollectionListControlState,
  libraryCollectionListControlReducer,
} from "../../../apps/new/src/features/library/services/library-collection-list-control-state-service";
import {
  rowsToCollectionListPreviews,
} from "../../../apps/new/src/features/library/services/library-collection-list-query-service";
import {
  getLibraryHomeHeaderActions,
  getLibraryHomeHeaderState,
  getLibraryHomeImportHref,
  getLibraryHomeStatusState,
  initialLibraryHomeControlState,
  libraryHomeControlReducer,
} from "../../../apps/new/src/features/library/services/library-home-service";
import {
  buildLibrarySongDetail,
} from "../../../apps/new/src/features/library/services/library-song-detail-service";
import {
  getLibrarySongDetailActionState,
  getLibrarySongDetailStatusState,
} from "../../../apps/new/src/features/library/services/library-song-detail-state-service";
import {
  getLibraryInvalidSongState,
  getLibrarySongDeleteConfirmationCopy,
  getLibrarySongDeleteSuccessHref,
  getLibrarySongDetailBackHref,
  getLibrarySongDetailHref,
  getLibrarySongDetailPlayerHref,
  getLibrarySongDetailViewState,
  getLibrarySongEditHref,
  getLibrarySongRelationshipHref,
} from "../../../apps/new/src/features/library/services/library-song-interaction-service";
import {
  getLibrarySongPlaybackBlockedCommand,
  getLibrarySongPlayCommand,
  getLibrarySongQueueCommand,
  toLibrarySongDetailPlaybackItem,
  toLibrarySongExportItem,
} from "../../../apps/new/src/features/library/services/library-song-playback-state-service";
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
  initialLibrarySongDetailMutationState,
  librarySongDetailMutationReducer,
} from "../../../apps/new/src/features/library/services/library-song-detail-mutation-service";
import {
  buildLibrarySongEditFormState,
  getInitialLibrarySongEditControllerState,
  librarySongEditControllerReducer,
} from "../../../apps/new/src/features/library/services/library-song-form-service";
import {
  getLibrarySongEditBlockedCommand,
  getLibrarySongEditCoverPickedCommand,
  getLibrarySongEditErrorMessage,
  getLibrarySongEditFailureCommand,
  getLibrarySongEditSaveSuccessCommand,
} from "../../../apps/new/src/features/library/services/library-song-form-command-state-service";
import {
  getLibrarySongEditActionState,
  getLibrarySongEditFieldState,
  getLibrarySongEditStatusState,
} from "../../../apps/new/src/features/library/services/library-song-edit-screen-state-service";
import {
  type LibrarySongCommandDependencies,
  deleteLibrarySongCommandWithDependencies,
  exportLibrarySongCommandWithDependencies,
  toggleLibrarySongLikedCommandWithDependencies,
  updateLibrarySongMetadataCommandWithDependencies,
} from "../../../apps/new/src/features/library/services/library-song-command-executor-service";
import {
  deleteLibrarySongWithDependencies,
  getLibrarySongDirectoryPath,
  type LibrarySongDeleteDependencies,
} from "../../../apps/new/src/features/library/repository/library-song-delete-executor-repository";
import {
  rowsToSongPreviews,
} from "../../../apps/new/src/features/library/services/library-song-preview-service";
import {
  getLibrarySongListControlsState,
  getLibrarySongPreviewDetailHref,
  getLibrarySongPreviewEmptyState,
  getLibrarySongPreviewListState,
  getLibrarySongPreviewPlayCommand,
  getLibrarySongPreviewPlayerHref,
  getLibrarySongPreviewQueueCommand,
  getLibrarySongPreviewRowState,
  toLibrarySongPlaybackItem,
} from "../../../apps/new/src/features/library/services/library-song-preview-state-service";
import {
  backupActionCards,
  getBackupActionState,
  getBackupConfirmationState,
  getBackupOperationConfirmCommand,
  getBackupPhaseTransitionEffects,
  getBackupOperationLabel,
  getBackupOperationStartCommand,
  getBackupResetStatusCommand,
  getBackupScreenState,
  getBackupStatusState,
} from "../../../apps/new/src/features/backup/services/backup-screen-service";
import {
  backupSessionReducer,
  getBackupSessionErrorMessage,
  initialBackupSessionState,
} from "../../../apps/new/src/features/backup/services/backup-session-state-service";
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
  getPremiumMutationErrorMessage,
  getPremiumScreenState,
  getPremiumStatusState,
  getSelectedPremiumTier,
  premiumFeatureCopy,
} from "../../../apps/new/src/features/premium/services/premium-screen-service";
import {
  getInitialPremiumPurchaseState,
  getInitialPremiumTierLoadState,
  premiumPurchaseReducer,
  premiumTierLoadReducer,
} from "../../../apps/new/src/features/premium/services/premium-purchase-state-service";
import {
  initialPremiumEntitlementState,
  premiumEntitlementReducer,
} from "../../../apps/new/src/features/premium/services/premium-entitlement-state-service";
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
  type PremiumCustomerInfo,
  type PremiumPurchaseExecutorDependencies,
  type PremiumPurchasePackage,
} from "../../../apps/new/src/features/premium/services/premium-purchase-executor-service";
import type {
  PremiumPurchaseState,
  PremiumTier,
} from "../../../apps/new/src/features/premium/types/premium-purchase";
import {
  getCustomizationSettingsErrorMessage,
  getCustomizationHapticsToggleCommand,
  getCustomizationOptionState,
  getCustomizationScreenState,
  getPrivacyScreenViewState,
  getPrivacyScreenState,
  getPrivacySettingsErrorMessage,
  getSettingsInteractionCommand,
  getSupportScreenViewState,
  shouldSendHapticForHapticsToggle,
} from "../../../apps/new/src/features/settings/services/settings-screen-service";
import {
  getSettingsBackLink,
  getSettingsHomeHref,
  getSettingsPremiumHref,
  getSupportActionKey,
  supportActions,
} from "../../../apps/new/src/features/settings/services/settings-navigation-service";
import {
  createInitialSettingsPersistenceState,
  settingsPersistenceReducer,
} from "../../../apps/new/src/features/settings/services/settings-persistence-state-service";
import {
  loadSettingsFromJsonFileWithDependencies,
  saveSettingsToJsonFileWithDependencies,
  type SettingsJsonFileStoreDependencies,
} from "../../../apps/new/src/features/settings/services/settings-json-file-store-service";
import {
  checkStoredImageExistsWithDependencies,
  getImagePathFromDirectory,
  getImagePathFromHashWithDependencies,
  getImageStorageVariants,
  saveCoverImageWithDependencies,
  splitImageData,
  writeImageToFileSystemWithDependencies,
  type ImageStorageDependencies,
} from "../../../apps/new/src/features/images/services/image-storage-executor-service";
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

  state = playbackReducer(state, { song: second, type: "add-to-queue" });
  state = playbackReducer(state, { song: third, type: "add-to-queue" });
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

  state = playbackReducer(state, {
    premiumActive: false,
    status: {
      didJustFinish: false,
      duration: 30_000,
      isLoaded: true,
      isPlaying: true,
      position: 12_000,
      songId: null,
      source: "ad",
    },
    type: "native-status",
  });
  assert.equal(state.adGate.playbackDuration, 30_000);
  assert.equal(state.adGate.playbackPosition, 12_000);
  assert.equal(state.isPlaying, false);

  state = playbackReducer(state, { error: "Ad failure", type: "native-failure" });
  state = playbackReducer(state, { type: "complete-ad-break" });
  assert.equal(state.adGate.active, false);
  assert.equal(state.adGate.due, false);
  assert.equal(state.error, null);
  assert.equal(state.isPlaying, true);

  state = playbackReducer(state, { targetIndex: 1, type: "native-finished" });
  assert.equal(state.activeTrackId, second.id);
  assert.equal(state.activeQueueIndex, 1);
  assert.equal(state.position, 0);
  assert.equal(state.isPlaying, true);

  state = playbackReducer(state, { targetIndex: null, type: "native-finished" });
  assert.equal(state.activeTrackId, second.id);
  assert.equal(state.position, state.duration);
  assert.equal(state.isPlaying, false);

  state = playbackReducer(state, { type: "begin-ad-break" });
  state = playbackReducer(state, { premiumActive: true, type: "sync-premium" });
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
    header: {
      kicker: "Playback queue",
      subtitle:
        "Reorder upcoming songs, remove tracks, or jump to a different song.",
      title: "Now Playing",
    },
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
  assert.deepEqual(
    getPlaybackPlayerActionState({
      activeTrack: null,
      state: initialPlaybackState,
    }),
    {
      adBreakActive: false,
      canEditActiveTrack: false,
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
      canEditActiveTrack: true,
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
      canEditActiveTrack: false,
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
        canEditActiveTrack: true,
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

async function assertImportSessionSmoke() {
  const first = importDraft(1);
  const second = importDraft(2);

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
      body: "Unlock file and Wi-Fi import before staging new songs.",
      canAccessImport: false,
      error: null,
      kicker: "Checking premium",
      title: "Import is a Premium feature",
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
      body: "Unlock file and Wi-Fi import before staging new songs.",
      canAccessImport: false,
      error: "Premium check failed.",
      kicker: "Premium import",
      title: "Import is a Premium feature",
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
      body: "Unlock file and Wi-Fi import before staging new songs.",
      canAccessImport: true,
      error: null,
      kicker: "Premium import",
      title: "Import is a Premium feature",
    },
  );
  assert.deepEqual(getImportPremiumGateActionCommand(), {
    haptic: "light",
  });
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
  assert.deepEqual(getImportSongPreviewEmptyState(), {
    body: "Choose songs to review them before saving.",
    title: "No songs staged",
  });
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
  assert.deepEqual(
    await saveImportSessionLifecycle(
      {
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
  assert.deepEqual(initialImportSaveExportState, {
    error: null,
    isExporting: false,
  });
  assert.deepEqual(
    importSaveExportReducer(initialImportSaveExportState, { type: "begin" }),
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
      { type: "finish" },
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
  assert.equal(getImportWifiReviewSaveHaptic(), "light");
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

  assert.deepEqual(wifiImportServerReducer(serverState, { type: "stop" }), {
    error: null,
    ipAddress: "192.168.1.4",
    isReady: false,
    port: null,
  });
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
}

function assertLibraryCollectionInteractionSmoke() {
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
  assert.equal(getCollectionListHref("album"), "/(tabs)/library/albums");
  assert.equal(getCollectionListHref("artist"), "/(tabs)/library/artists");
  assert.equal(getCollectionListHref("playlist"), "/(tabs)/library/playlists");
  assert.equal(getLibraryCollectionBackHref(), "/(tabs)/library");
  assert.deepEqual(getCollectionDetailViewState({ songs }), {
    backLink: {
      href: "/(tabs)/library",
      label: "Back to Library",
    },
    songSection: {
      meta: "3 songs",
      title: "Songs",
    },
  });
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
  assert.deepEqual(
    addCollectionSongsSearchReducer(initialAddCollectionSongsSearchState, {
      query: "ambient",
      type: "set-query",
    }),
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
      { type: "finish-add-selection" },
    ),
    selectedAddControllerState,
  );
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
      { type: "finish-add-song" },
    ),
    selectedAddControllerState,
  );
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

  assert.deepEqual(getLibraryCollectionPreviewEmptyState(), {
    body: "Create a playlist, album, or artist once you have songs to organize.",
    title: "No collections yet",
  });

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
  assert.deepEqual(getLibrarySongPreviewEmptyState(), {
    body: "Import audio files to start building your song library.",
    link: {
      href: "/(tabs)/import",
      label: "Import music",
    },
    title: "No songs yet",
  });
  assert.deepEqual(getLibrarySongPreviewListState({ songs: previews }), {
    meta: "1 shown",
    title: "Recent Songs",
  });
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
  assert.deepEqual(getAddCollectionSongsHeaderState({ kind: "album" }), {
    kicker: "Add songs",
    searchInput: {
      placeholder: "Search songs, artists, or albums",
      returnKeyType: "search",
    },
    subtitle: "Search your songs and add them to this collection.",
    title: "Add to album",
  });

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
  assert.deepEqual(
    Array.from(
      rowsToLinkedSongIds([{ songId: 7 }, { songId: null }, { songId: 9 }]),
    ),
    [7, 9],
  );
}

function assertLibrarySongDetailSmoke() {
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
  assert.deepEqual(getLibrarySongDetailViewState(detail), {
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
            id: 2,
            title: "Beta Album",
          },
          {
            detail: "2026 / track 1",
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
          { id: 2, title: "Beta Artist" },
          { id: 1, title: "Alpha Artist" },
        ],
        kind: "artist",
        title: "Artists",
      },
      playlists: {
        emptyLabel: "No playlists linked",
        items: [
          { id: 5, title: "Smoke Playlist" },
          { id: 6, title: "Untitled playlist" },
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
  assert.deepEqual(
    librarySongEditControllerReducer(songEditState, {
      detail,
      songId: 42,
      type: "hydrate",
    }),
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
      {
        detail,
        songId: 42,
        type: "hydrate",
      },
    ),
    {
      ...songEditState,
      loadedSongId: 42,
      title: "Local Edit",
    },
  );
  assert.deepEqual(
    librarySongEditControllerReducer(songEditState, {
      field: "title",
      type: "change-field",
      value: "Updated",
    }),
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
    librarySongEditControllerReducer(songEditState, { type: "begin-save" }),
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
      { type: "finish-save" },
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
      title: " Alpha ",
    }),
    { canPickCoverImage: true, canSave: true, saveLabel: "Save" },
  );
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail,
      isSaving: false,
      title: "   ",
    }),
    { canPickCoverImage: true, canSave: false, saveLabel: "Save" },
  );
  assert.deepEqual(
    getLibrarySongEditActionState({
      detail,
      isSaving: true,
      title: "Alpha",
    }),
    { canPickCoverImage: false, canSave: false, saveLabel: "Saving" },
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
      title: "Recovered title",
    }),
    { canPickCoverImage: false, canSave: false, saveLabel: "Save" },
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
  let documentDirectory: string | null = "file:///documents/";
  const dependencies: LibrarySongDeleteDependencies = {
    get documentDirectory() {
      return documentDirectory;
    },
    deleteAlbumSongRows: async (songId) => {
      calls.push(`album-songs:${songId}`);
    },
    deleteArtistSongRows: async (songId) => {
      calls.push(`artist-songs:${songId}`);
    },
    deleteLibrarySongFiles: async (songId) => {
      calls.push(`files:${songId}`);
    },
    deletePlaylistSongRows: async (songId) => {
      calls.push(`playlist-songs:${songId}`);
    },
    deleteSongRow: async (songId) => {
      calls.push(`song:${songId}`);
    },
  };

  assert.equal(
    getLibrarySongDirectoryPath({
      documentDirectory: "file:///documents/",
      songId: 42,
    }),
    "file:///documents/library/42",
  );

  await deleteLibrarySongWithDependencies(42, dependencies);
  assert.deepEqual(calls, [
    "album-songs:42",
    "artist-songs:42",
    "playlist-songs:42",
    "song:42",
    "files:42",
  ]);

  calls.length = 0;
  documentDirectory = null;
  await deleteLibrarySongWithDependencies(43, dependencies);
  assert.deepEqual(calls, [
    "album-songs:43",
    "artist-songs:43",
    "playlist-songs:43",
    "song:43",
  ]);
}

function assertEditCollectionQuerySmoke() {
  const getImagePath = (hash: string) => `/images/${hash}-small.jpg`;

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

function assertCollectionFormSmoke() {
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
  assert.deepEqual(
    collectionFormReducer(collectionFormState, {
      artistNames: "Hydrated Artist",
      name: "Hydrated Album",
      type: "hydrate",
      year: "2026",
    }),
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
      {
        artistNames: "Hydrated Artist",
        name: "Hydrated Album",
        type: "hydrate",
        year: "2026",
      },
    ),
    {
      ...collectionFormState,
      isDirty: true,
      name: "Local Edit",
    },
  );
  assert.deepEqual(
    collectionFormReducer(collectionFormState, {
      field: "artistNames",
      type: "change-field",
      value: "Alpha Artist, Beta Artist",
    }),
    {
      ...collectionFormState,
      artistNames: "Alpha Artist, Beta Artist",
      error: null,
      isDirty: true,
    },
  );
  assert.deepEqual(
    collectionFormReducer(collectionFormState, {
      field: "name",
      type: "change-field",
      value: "Smoke Album",
    }),
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
      { type: "finish-save" },
    ),
    collectionFormState,
  );
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

  assert.deepEqual(initialLibraryCollectionListControlState, {
    query: "",
  });
  assert.deepEqual(
    libraryCollectionListControlReducer(
      initialLibraryCollectionListControlState,
      {
        query: "jazz",
        type: "set-query",
      },
    ),
    {
      query: "jazz",
    },
  );
}

function assertLibraryHomeSmoke() {
  let controls = libraryHomeControlReducer(initialLibraryHomeControlState, {
    query: "pulse",
    type: "set-query",
  });
  assert.deepEqual(controls, {
    order: "desc",
    query: "pulse",
    sort: "recent",
  });
  controls = libraryHomeControlReducer(controls, {
    sort: "title",
    type: "set-sort",
  });
  assert.deepEqual(controls, {
    order: "desc",
    query: "pulse",
    sort: "title",
  });
  assert.deepEqual(
    libraryHomeControlReducer(controls, {
      order: "asc",
      type: "set-order",
    }),
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
      songUpdatedAt: new Date(30),
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
      songUpdatedAt: null,
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
      songUpdatedAt: new Date(30),
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
    importSongEditFormReducer(editFormState, {
      field: "title",
      type: "change-field",
      value: "Changed",
    }),
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
    getImportSessionFileWithDependencies(dependencies),
    sessionFile,
  );
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
    "link-song-artist:42:100",
    "find-album:New Album",
    "insert-album:New Album",
    "link-song-album:42:200:3",
    "save-cover:data:image/png;base64,cover",
    "update-album-cover:200:cover-hash",
    "link-artist-album:7:200",
    "link-artist-album:100:200",
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
      { type: "checking" },
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
    premiumEntitlementReducer(initialPremiumEntitlementState, {
      status: {
        active: true,
        message: "Premium smoke active.",
        tierId: "lifetime",
      },
      type: "succeed",
    }),
    {
      active: true,
      error: null,
      message: "Premium smoke active.",
      phase: "ready",
      tierId: "lifetime",
    },
  );
  assert.deepEqual(
    premiumEntitlementReducer(initialPremiumEntitlementState, {
      error: "Premium entitlement failed.",
      type: "fail",
    }),
    {
      active: false,
      error: "Premium entitlement failed.",
      message: null,
      phase: "failure",
      tierId: "monthly",
    },
  );
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
  let reducerState = premiumPurchaseReducer(getInitialPremiumPurchaseState(), {
    tierId: "lifetime",
    type: "select",
  });
  assert.deepEqual(reducerState, {
    active: false,
    error: null,
    message: null,
    phase: "idle",
    selectedTierId: "lifetime",
  });
  reducerState = premiumPurchaseReducer(reducerState, { type: "start" });
  assert.equal(reducerState.phase, "loading");
  assert.deepEqual(
    premiumPurchaseReducer(reducerState, {
      result: {
        active: true,
        message: "Premium smoke active.",
        tierId: "yearly",
      },
      type: "succeed",
    }),
    {
      active: true,
      error: null,
      message: "Premium smoke active.",
      phase: "success",
      selectedTierId: "yearly",
    },
  );
  assert.deepEqual(
    premiumPurchaseReducer(reducerState, {
      error: "Premium failed.",
      type: "fail",
    }),
    {
      active: false,
      error: "Premium failed.",
      message: null,
      phase: "failure",
      selectedTierId: "lifetime",
    },
  );
  assert.deepEqual(
    premiumPurchaseReducer(getInitialPremiumPurchaseState(), {
      active: true,
      message: "Synced entitlement.",
      tierId: "yearly",
      type: "sync-entitlement",
    }),
    {
      active: true,
      error: null,
      message: "Synced entitlement.",
      phase: "idle",
      selectedTierId: "yearly",
    },
  );
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

  restoredProductIdentifier = "unmapped-product";
  assert.deepEqual(await restorePremiumPurchaseWithDependencies(dependencies), {
    active: true,
    message: "Premium purchase restored.",
    tierId: "monthly",
  });

  assert.deepEqual(await checkPremiumEntitlementWithDependencies(dependencies), {
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
}

function assertSettingsScreenSmoke() {
  const initialSettings = { allowAnalytics: true };
  const loadedSettings = { allowAnalytics: false };
  const initialPersistenceState =
    createInitialSettingsPersistenceState(initialSettings);

  assert.deepEqual(initialPersistenceState, {
    error: null,
    settings: initialSettings,
    status: "idle",
  });

  const loadingState = settingsPersistenceReducer(initialPersistenceState, {
    type: "load",
  });
  assert.deepEqual(loadingState, {
    error: null,
    settings: initialSettings,
    status: "loading",
  });

  assert.deepEqual(
    settingsPersistenceReducer(loadingState, {
      settings: loadedSettings,
      type: "load-success",
    }),
    {
      error: null,
      settings: loadedSettings,
      status: "idle",
    },
  );

  assert.deepEqual(
    settingsPersistenceReducer(loadingState, {
      error: "Load failed",
      type: "load-failure",
    }),
    {
      error: "Load failed",
      settings: initialSettings,
      status: "error",
    },
  );

  const savingState = settingsPersistenceReducer(initialPersistenceState, {
    settings: loadedSettings,
    type: "save",
  });
  assert.deepEqual(savingState, {
    error: null,
    settings: loadedSettings,
    status: "saving",
  });

  assert.deepEqual(
    settingsPersistenceReducer(savingState, {
      settings: loadedSettings,
      type: "save-success",
    }),
    {
      error: null,
      settings: loadedSettings,
      status: "idle",
    },
  );

  assert.deepEqual(
    settingsPersistenceReducer(savingState, {
      error: "Save failed",
      settings: initialSettings,
      type: "save-failure",
    }),
    {
      error: "Save failed",
      settings: initialSettings,
      status: "error",
    },
  );

  assert.equal(getSettingsHomeHref(), "/(tabs)/settings");
  assert.equal(getSettingsPremiumHref(), "/premium");
  assert.deepEqual(getSettingsBackLink(), {
    href: "/(tabs)/settings",
    label: "Back to Settings",
  });
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
  assert.deepEqual(
    supportActions.map((action) => action.label),
    ["Leave a Review", "Contact Support", "X", "Instagram", "Discord"],
  );
  assert.equal(getSupportActionKey(supportActions[0]!), "review");
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
  assert.deepEqual(getSettingsInteractionCommand(), {
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
assertHomeScreenSmoke();
assertImportSongFormSmoke();
assertBackupScreenSmoke();
assertPremiumScreenSmoke();
assertSettingsScreenSmoke();
assertPlaybackSessionSmoke();
assertPlaybackNativeStatusSmoke();
assertPlaybackNativeCommandPlanSmoke();
assertPlaybackPlayerStateSmoke();
void assertImportLibrarySavePlanSmoke().then(async () => {
  await assertPlaybackPersistenceExecutorSmoke();
  await assertImportFileCacheExecutorSmoke();
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
  await assertLibraryExportMetadataExecutorSmoke();
  await assertImageStorageExecutorSmoke();
  await assertImportSessionSmoke();
  assertLibraryCollectionDetailSmoke();
  assertLibraryCollectionInteractionSmoke();
  assertLibraryCollectionPreviewSmoke();
  assertLibrarySongPreviewSmoke();
  assertAddableCollectionSongsSmoke();
  assertLibrarySongDetailSmoke();
  await assertLibrarySongDeleteExecutorSmoke();
  assertEditCollectionQuerySmoke();
  assertCollectionFormSmoke();
  await assertCollectionImagePickerExecutorSmoke();
  await assertCollectionFormMutationSmoke();
  assertLibraryCollectionListSmoke();
  assertLibraryHomeSmoke();
  console.log("Rewrite deterministic smoke checks passed.");
});
