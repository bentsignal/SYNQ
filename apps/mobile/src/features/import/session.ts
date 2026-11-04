import { useSyncExternalStore } from "react";
import { Alert } from "react-native";

import type { ImportState } from "./queue";
import { track } from "~/features/analytics/analytics";
import { successFeedback } from "~/lib/haptics";
import { queryClient } from "~/lib/query-client";
import {
  clearImportStaging,
  discardSource,
  importSong,
  readSource,
} from "./pipeline";
import { failureReport } from "./progress";
import {
  getImportState,
  installImportQueue,
  subscribeImportState,
} from "./queue";
import { recordFinishedImport } from "./review";

export type { ImportState } from "./queue";

/** The app's one import queue (`queue.ts`), joined to the rest of the app. */
installImportQueue({
  add: importSong,
  clearStaging: clearImportStaging,
  discard: discardSource,
  onFinished: ({ appeared, failed, imported, isImporting, received }) => {
    track("import_finish", { numberOfSongs: imported });
    recordFinishedImport({
      appeared,
      isImporting,
      mayAskForReview: failed === 0,
    });
    if (received > 0) successFeedback();
  },
  onNothingImported: () => track("import_cancel"),
  read: readSource,
  refreshLibrary: () =>
    queryClient.invalidateQueries({ queryKey: ["library"] }),
  reportFailures: (names) => {
    const report = failureReport(names);
    Alert.alert(report.title, report.message);
  },
});

export {
  addImportSources,
  getImportState,
  onTransferStart,
  setIncomingImports,
  setTransfersOn,
  subscribeImportState,
  uploadFailed,
  uploadReceived,
  uploadStarted,
  uploadsStopped,
} from "./queue";

/**
 * Part of the import state, re-rendering when it changes. `select` returns
 * a primitive or part of the state as it is.
 */
export function useImportState<Selected>(
  select: (current: ImportState) => Selected,
) {
  return useSyncExternalStore(subscribeImportState, () =>
    select(getImportState()),
  );
}
