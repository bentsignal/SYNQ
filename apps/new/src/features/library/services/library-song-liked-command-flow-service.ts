import type { LibrarySongDetailActionState } from "./library-song-detail-action-state-service";
import {
  getLibrarySongDetailMutationBlockedCommand,
  getLibrarySongLikedSuccessCommand,
} from "./library-song-detail-mutation-command-state-service";
import {
  runLibrarySongDetailMutationAttempt,
  type LibrarySongDetailMutationDispatch,
  type LibrarySongDetailMutationHapticSender,
} from "./library-song-detail-mutation-runtime-service";
import type { LibrarySongDetail } from "./library-song-detail-types-service";

export const runLibrarySongLikedCommand = async ({
  actionState,
  detail,
  dispatch,
  sendHaptic,
  songId,
  toggleLibrarySongLiked,
}: {
  actionState: LibrarySongDetailActionState;
  detail: Pick<LibrarySongDetail, "isLiked">;
  dispatch: LibrarySongDetailMutationDispatch;
  sendHaptic: LibrarySongDetailMutationHapticSender;
  songId: number;
  toggleLibrarySongLiked: (params: {
    liked: boolean;
    songId: number;
  }) => Promise<unknown>;
}) => {
  if (!actionState.canToggleLiked) {
    sendHaptic(getLibrarySongDetailMutationBlockedCommand().haptic);
    return;
  }

  await runLibrarySongDetailMutationAttempt({
    dispatch,
    mutation: "toggle-liked",
    onSuccess: () => {
      sendHaptic(getLibrarySongLikedSuccessCommand().haptic);
    },
    run: () =>
      toggleLibrarySongLiked({
        liked: !detail.isLiked,
        songId,
      }),
    sendHaptic,
  });
};
