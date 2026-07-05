import type { ImportSessionState } from "../types/import-session";
import type { ImportSessionHydrateAction } from "./import-session-action-types-service";

export const getHydrateImportSessionAction = (
  state: ImportSessionState,
): ImportSessionHydrateAction => ({
  state,
  type: "hydrate",
});
