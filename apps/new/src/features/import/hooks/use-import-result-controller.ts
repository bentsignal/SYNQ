import {
  getImportFailureViewState,
  getImportSuccessViewState,
} from "../services/import-result-view-state-service";
import { useImportSessionSelector } from "./use-import-session";

export function useImportSuccessController() {
  const state = useImportSessionSelector((store) => store.state);

  return getImportSuccessViewState(state);
}

export function useImportFailureController() {
  const state = useImportSessionSelector((store) => store.state);

  return getImportFailureViewState(state);
}
