import { getExportFileNameFromPath } from "./export-file-name-service";

export type ShareExportFile = {
  fileNameFallback: string;
  sourceUri: string;
};

export type ShareExportFilesDependencies = {
  cacheDirectory: string | null;
  copyFile: (options: { from: string; to: string }) => Promise<void>;
  deletePath: (
    path: string,
    options: { idempotent: true },
  ) => Promise<void>;
  makeDirectory: (
    path: string,
    options: { intermediates: true },
  ) => Promise<void>;
  now: () => number;
  sharePath: (path: string) => Promise<void>;
};

type ShareExportFilesOptions = {
  dependencies: ShareExportFilesDependencies;
  directoryPrefix: string;
  files: ShareExportFile[];
  noFilesMessage: string;
};

export const getShareExportFileName = (
  file: ShareExportFile,
  index: number,
) =>
  `${index + 1}-${getExportFileNameFromPath(
    file.sourceUri,
    `${index + 1}-${file.fileNameFallback}`,
  )}`;

export async function shareExportFilesWithDependencies({
  dependencies,
  directoryPrefix,
  files,
  noFilesMessage,
}: ShareExportFilesOptions) {
  if (files.length === 0) {
    throw new Error(noFilesMessage);
  }

  if (files.length === 1) {
    await dependencies.sharePath(files[0].sourceUri);
    return {
      exported: 1,
    };
  }

  if (!dependencies.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  const exportDirectory = `${dependencies.cacheDirectory}${directoryPrefix}-${dependencies.now()}`;
  await dependencies.makeDirectory(exportDirectory, { intermediates: true });

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      await dependencies.copyFile({
        from: file.sourceUri,
        to: `${exportDirectory}/${getShareExportFileName(file, index)}`,
      });
    }

    await dependencies.sharePath(exportDirectory);

    return {
      exported: files.length,
    };
  } finally {
    await dependencies.deletePath(exportDirectory, { idempotent: true });
  }
}
