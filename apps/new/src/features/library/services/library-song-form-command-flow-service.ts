import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getLibrarySongEditBlockedCommand,
  getLibrarySongEditFailureCommand,
  getLibrarySongEditSaveSuccessCommand,
} from "./library-song-form-command-state-service";
import {
  getLibrarySongEditBeginSaveAction,
  getLibrarySongEditFinishSaveAction,
  type LibrarySongEditControllerAction,
  type LibrarySongEditControllerState,
} from "./library-song-edit-controller-reducer-service";
import type { LibrarySongDetailHref } from "./library-song-navigation-service";

type LibrarySongEditDispatch = (
  action: LibrarySongEditControllerAction,
) => void;

type HapticSender = (type: HapticFeedbackType) => void;

type NativeRouteReplacer = (href: LibrarySongDetailHref) => void;

type LibrarySongMetadataUpdater = (params: {
  albumNames: string;
  artistNames: string;
  coverImageDataUrl?: string | null;
  id: number;
  title: string;
}) => Promise<unknown>;

export const runLibrarySongEditSaveCommand = async ({
  canSave,
  dispatch,
  formState,
  replaceRoute,
  sendHaptic,
  songId,
  updateLibrarySongMetadata,
}: {
  canSave: boolean;
  dispatch: LibrarySongEditDispatch;
  formState: LibrarySongEditControllerState;
  replaceRoute: NativeRouteReplacer;
  sendHaptic: HapticSender;
  songId: number;
  updateLibrarySongMetadata: LibrarySongMetadataUpdater;
}) => {
  if (!canSave) {
    sendHaptic(getLibrarySongEditBlockedCommand().haptic);
    return;
  }

  dispatch(getLibrarySongEditBeginSaveAction());

  try {
    await updateLibrarySongMetadata({
      albumNames: formState.albumNames,
      artistNames: formState.artistNames,
      coverImageDataUrl: formState.coverImage?.dataUrl,
      id: songId,
      title: formState.title,
    });
    const command = getLibrarySongEditSaveSuccessCommand({ songId });
    sendHaptic(command.haptic);
    replaceRoute(command.href);
  } catch (caughtError) {
    const command = getLibrarySongEditFailureCommand(caughtError);
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getLibrarySongEditFinishSaveAction());
  }
};
