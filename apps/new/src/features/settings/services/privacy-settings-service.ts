import * as FileSystem from "expo-file-system";
import type { PrivacySettings } from "../types/privacy-settings";
import {
  loadSettingsFromJsonFileWithDependencies,
  saveSettingsToJsonFileWithDependencies,
  type SettingsJsonFileStoreDependencies,
} from "./settings-json-file-store-service";

export const defaultPrivacySettings: PrivacySettings = {
  allowAnalytics: !__DEV__,
};

const privacySettingsFileName = "privacy.json";

const privacySettingsDependencies: SettingsJsonFileStoreDependencies = {
  documentDirectory: FileSystem.documentDirectory,
  getInfo: FileSystem.getInfoAsync,
  makeDirectory: FileSystem.makeDirectoryAsync,
  readAsString: FileSystem.readAsStringAsync,
  writeAsString: FileSystem.writeAsStringAsync,
};

export const normalizePrivacySettings = (value: unknown): PrivacySettings => {
  if (!value || typeof value !== "object") {
    return defaultPrivacySettings;
  }

  const partialValue = value as Partial<PrivacySettings>;

  return {
    allowAnalytics:
      typeof partialValue.allowAnalytics === "boolean"
        ? partialValue.allowAnalytics
        : defaultPrivacySettings.allowAnalytics,
  };
};

export async function loadPrivacySettings(): Promise<PrivacySettings> {
  return loadSettingsFromJsonFileWithDependencies({
    defaultSettings: defaultPrivacySettings,
    dependencies: privacySettingsDependencies,
    fileName: privacySettingsFileName,
    normalizeSettings: normalizePrivacySettings,
  });
}

export async function savePrivacySettings(settings: PrivacySettings) {
  await saveSettingsToJsonFileWithDependencies({
    dependencies: privacySettingsDependencies,
    fileName: privacySettingsFileName,
    normalizeSettings: normalizePrivacySettings,
    settings,
  });
}
