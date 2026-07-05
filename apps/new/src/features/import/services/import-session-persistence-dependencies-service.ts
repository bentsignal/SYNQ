export type ImportSessionPersistenceDependencies = {
  deletePath: (
    path: string,
    options: { idempotent: true },
  ) => Promise<void>;
  documentDirectory: string | null;
  getInfo: (path: string) => Promise<{ exists: boolean }>;
  makeDirectory: (
    path: string,
    options: { intermediates: true },
  ) => Promise<void>;
  readAsString: (path: string) => Promise<string>;
  writeAsString: (path: string, contents: string) => Promise<void>;
};
