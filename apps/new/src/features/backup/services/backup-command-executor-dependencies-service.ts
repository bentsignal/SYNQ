export type BackupCommandExecutorDependencies = {
  assertRestoreStagingDirectoryHasFiles: (
    stagingDirectory: string,
  ) => Promise<string[]>;
  cleanupRestoreStagingDirectory: (stagingDirectory: string) => Promise<void>;
  clearDocumentDirectory: () => Promise<void>;
  getArchivePath: () => string;
  getDocumentDirectory: () => string;
  isSharingAvailable: () => Promise<boolean>;
  pickArchive: () => Promise<string | null>;
  prepareRestoreStagingDirectory: () => Promise<string>;
  replaceDocumentDirectoryWithStagedItems: (
    stagingDirectory: string,
    stagedItems: string[],
  ) => Promise<void>;
  resetDatabaseConnection: () => Promise<void>;
  shareArchive: (
    archivePath: string,
    options: {
      UTI: string;
      dialogTitle: string;
      mimeType: string;
    },
  ) => Promise<void>;
  unzipArchive: (
    archiveUri: string,
    stagingDirectory: string,
  ) => Promise<unknown>;
  zipDirectory: (sourceDirectory: string, archivePath: string) => Promise<string>;
};
