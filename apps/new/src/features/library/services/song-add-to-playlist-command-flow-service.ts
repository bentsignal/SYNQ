import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getSongAddToPlaylistFailureCommand,
  getSongAddToPlaylistSuccessCommand,
  type SongAddToPlaylistMutationState,
} from "./song-add-to-playlist-service";

type SongAddToPlaylistMutationStateSetter = (
  state: SongAddToPlaylistMutationState,
) => void;

type HapticSender = (type: HapticFeedbackType) => void;

type LibraryPlaylistSongAdder = (params: {
  collectionId: number;
  kind: "playlist";
  songId: number;
}) => Promise<void>;

export const runSongAddToPlaylistCommand = async ({
  addLibraryCollectionSong,
  playlistId,
  sendHaptic,
  setMutationState,
  songId,
}: {
  addLibraryCollectionSong: LibraryPlaylistSongAdder;
  playlistId: number;
  sendHaptic: HapticSender;
  setMutationState: SongAddToPlaylistMutationStateSetter;
  songId: number;
}) => {
  setMutationState({
    error: null,
    pendingPlaylistId: playlistId,
    successPlaylistId: null,
  });

  try {
    await addLibraryCollectionSong({
      collectionId: playlistId,
      kind: "playlist",
      songId,
    });
    sendHaptic(getSongAddToPlaylistSuccessCommand().haptic);
    setMutationState({
      error: null,
      pendingPlaylistId: null,
      successPlaylistId: playlistId,
    });
  } catch (caughtError) {
    sendHaptic(getSongAddToPlaylistFailureCommand().haptic);
    setMutationState({
      error: caughtError,
      pendingPlaylistId: null,
      successPlaylistId: null,
    });
  }
};
