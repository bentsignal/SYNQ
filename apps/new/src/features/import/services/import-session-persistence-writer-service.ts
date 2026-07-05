import type { ImportSessionState } from "../types/import-session";
import type {
  ImportSessionPersistenceDependencies,
} from "./import-session-persistence-dependencies-service";
import {
  stringifyPersistedImportSession,
} from "./import-session-persistence-codec-service";

const importSessionFileName = "session.json";

export const writePersistedImportSessionState = async ({
  dependencies,
  importSessionDirectory,
  state,
}: {
  dependencies: ImportSessionPersistenceDependencies;
  importSessionDirectory: string;
  state: ImportSessionState;
}) => {
  await dependencies.makeDirectory(importSessionDirectory, {
    intermediates: true,
  });
  await dependencies.writeAsString(
    `${importSessionDirectory}/${importSessionFileName}`,
    stringifyPersistedImportSession(state),
  );
};
