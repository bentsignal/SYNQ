import type { ReactNode } from "react";
import { createStore } from "rostra";
import {
  useImportSessionStore,
  type ImportSessionValue,
} from "../hooks/use-import-session-store";

const { Store, useStore } = createStore<object, ImportSessionValue>(
  useImportSessionStore,
);

export function ImportSessionProvider({ children }: { children: ReactNode }) {
  return <Store>{children}</Store>;
}

export function useImportSessionSelector<SelectedValue>(
  selector: (store: ImportSessionValue) => SelectedValue,
) {
  return useStore(selector);
}

export function useImportSession() {
  return useImportSessionSelector((store) => store);
}
