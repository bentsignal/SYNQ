import {
  getImportSongEditInvalidState,
  type ImportSongEditInvalidReason,
} from "./import-song-edit-navigation-service";
import type { ImportSongDraft } from "../types/import-session";

export type ImportSongEditInvalidState = ReturnType<
  typeof getImportSongEditInvalidState
>;

export const getImportSongDraftForEdit = ({
  songId,
  songs,
}: {
  songId: number;
  songs: ImportSongDraft[];
}) => songs.find((draft) => draft.id === songId) ?? null;

export type ImportSongEditScreenState =
  | {
      invalidState: ImportSongEditInvalidState;
      reason: ImportSongEditInvalidReason;
      type: "invalid";
    }
  | {
      song: ImportSongDraft;
      type: "ready";
    };

export const getImportSongEditScreenState = ({
  songId,
  songs,
}: {
  songId: number | null;
  songs: ImportSongDraft[];
}): ImportSongEditScreenState => {
  if (songId === null) {
    return {
      invalidState: getImportSongEditInvalidState("invalid-id"),
      reason: "invalid-id",
      type: "invalid",
    };
  }

  const song = getImportSongDraftForEdit({ songId, songs });

  if (!song) {
    return {
      invalidState: getImportSongEditInvalidState("not-staged"),
      reason: "not-staged",
      type: "invalid",
    };
  }

  return {
    song,
    type: "ready",
  };
};
