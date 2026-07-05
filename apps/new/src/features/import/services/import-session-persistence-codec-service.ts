import type { ImportSessionState } from "../types/import-session";
import {
  normalizePersistedImportSession,
  toPersistedImportSession,
  type PersistedImportSession,
} from "./import-session-persistence-normalizer-service";

export const parsePersistedImportSession = (
  contents: string,
): PersistedImportSession | null =>
  normalizePersistedImportSession(JSON.parse(contents));

export const stringifyPersistedImportSession = (state: ImportSessionState) =>
  JSON.stringify(toPersistedImportSession(state), null, 2);
