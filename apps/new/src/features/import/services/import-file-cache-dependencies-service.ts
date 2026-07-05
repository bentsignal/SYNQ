export type ImportFileCacheDependencies = {
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
  writeBase64File: (path: string, data: string) => Promise<void>;
};
