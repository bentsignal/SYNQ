import type { BackupFileSystemDependencies } from "./backup-file-system-dependencies-service";
import { getBackupDocumentDirectoryDeletePaths } from "./backup-file-system-plan-service";
import { getBackupDocumentDirectoryWithDependencies } from "./backup-file-system-path-service";

export const clearBackupDocumentDirectoryWithDependencies = async (
  dependencies: BackupFileSystemDependencies,
) => {
  const documentDirectory =
    getBackupDocumentDirectoryWithDependencies(dependencies);
  const items = await dependencies.readDirectory(documentDirectory);

  for (const path of getBackupDocumentDirectoryDeletePaths({
    documentDirectory,
    items,
  })) {
    await dependencies.deletePath(path, {
      idempotent: true,
    });
  }
};
