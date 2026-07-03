import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportSessionState } from "../types/import-session";
import {
  getImportHomeHref,
  getImportSaveHref,
} from "./import-navigation-service";

export const getImportWifiState = ({
  error,
  isReady,
  state,
}: {
  error: string | null;
  isReady: boolean;
  state: ImportSessionState;
}) => {
  const hasSongs = state.songs.length > 0;
  const isTransferring =
    state.source === "wifi" && state.phase === "processing";
  const progressLabel =
    state.progress.total > 0
      ? `${state.progress.current}/${state.progress.total} received`
      : "Waiting";
  const statusLabel = error
    ? "Server failed"
    : isReady
      ? isTransferring
        ? "Receiving files"
        : "Server ready"
      : "Starting server";

  return {
    canReviewSave: hasSongs,
    hasSongs,
    isTransferring,
    progressLabel,
    statusLabel,
  };
};

export const getImportWifiActionState = () => ({
  backLink: {
    href: getImportHomeHref(),
    label: "Back to import",
  },
  reviewSave: {
    href: getImportSaveHref(),
    label: "Review save",
  },
});

export const getImportWifiReviewSaveHaptic = (): HapticFeedbackType => "light";
