import type { ImportSessionAction } from "./import-session-action-types-service";

export const getSavingImportSessionAction = (): ImportSessionAction => ({
  type: "saving",
});
