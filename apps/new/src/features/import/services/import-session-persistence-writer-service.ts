import type { ImportSessionState } from "../types/import-session";
import type {
  ImportSessionPersistenceDependencies,
} from "./import-session-persistence-dependencies-service";
import { toPersistedImportSession } from "./import-session-persistence-normalizer-service";

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
    JSON.stringify(toPersistedImportSession(state), null, 2),
  );
};
