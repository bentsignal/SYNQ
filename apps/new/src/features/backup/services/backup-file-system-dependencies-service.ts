export type BackupFileSystemDependencies = {
  cacheDirectory: string | null;
  deletePath: (
    path: string,
    options?: { idempotent?: boolean },
  ) => Promise<void>;
  documentDirectory: string | null;
  makeDirectory: (
    path: string,
    options?: { intermediates?: boolean },
  ) => Promise<void>;
  movePath: ({ from, to }: { from: string; to: string }) => Promise<void>;
  now: () => number;
  readDirectory: (path: string) => Promise<string[]>;
};
