import {
  parseSettingsJsonWithFallback,
  stringifySettingsJson,
} from "./settings-json-codec-service";
import {
  getSettingsDirectoryWithDependencies,
  getSettingsFileWithDependencies,
} from "./settings-json-file-path-service";

export {
  getSettingsDirectoryWithDependencies,
  getSettingsFileWithDependencies,
} from "./settings-json-file-path-service";
export {
  parseSettingsJsonWithFallback,
  stringifySettingsJson,
} from "./settings-json-codec-service";

export type SettingsJsonFileInfo = {
  exists: boolean;
};

export type SettingsJsonFileStoreDependencies = {
  documentDirectory: string | null;
  getInfo: (path: string) => Promise<SettingsJsonFileInfo>;
  makeDirectory: (
    path: string,
    options: { intermediates: true },
  ) => Promise<void>;
  readAsString: (path: string) => Promise<string>;
  writeAsString: (path: string, contents: string) => Promise<void>;
};

type SettingsJsonFileStoreOptions<TSettings> = {
  dependencies: SettingsJsonFileStoreDependencies;
  fileName: string;
  normalizeSettings: (value: unknown) => TSettings;
};

type LoadSettingsJsonFileStoreOptions<TSettings> =
  SettingsJsonFileStoreOptions<TSettings> & {
    defaultSettings: TSettings;
  };

type SaveSettingsJsonFileStoreOptions<TSettings> =
  SettingsJsonFileStoreOptions<TSettings> & {
    settings: TSettings;
  };

export async function loadSettingsFromJsonFileWithDependencies<TSettings>({
  defaultSettings,
  dependencies,
  fileName,
  normalizeSettings,
}: LoadSettingsJsonFileStoreOptions<TSettings>): Promise<TSettings> {
  try {
    const settingsFile = getSettingsFileWithDependencies({
      documentDirectory: dependencies.documentDirectory,
      fileName,
    });
    const fileInfo = await dependencies.getInfo(settingsFile);
    if (!fileInfo.exists) {
      return defaultSettings;
    }

    const contents = await dependencies.readAsString(settingsFile);

    return parseSettingsJsonWithFallback({
      contents,
      defaultSettings,
      normalizeSettings,
    });
  } catch {
    return defaultSettings;
  }
}

export async function saveSettingsToJsonFileWithDependencies<TSettings>({
  dependencies,
  fileName,
  normalizeSettings,
  settings,
}: SaveSettingsJsonFileStoreOptions<TSettings>) {
  const settingsDirectory = getSettingsDirectoryWithDependencies({
    documentDirectory: dependencies.documentDirectory,
  });
  await dependencies.makeDirectory(settingsDirectory, {
    intermediates: true,
  });
  await dependencies.writeAsString(
    `${settingsDirectory}/${fileName}`,
    stringifySettingsJson({
      normalizeSettings,
      settings,
    }),
  );
}
