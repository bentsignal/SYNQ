import * as FileSystem from "expo-file-system";
import type { PrivacySettings } from "../types/privacy-settings";
import {
  defaultPrivacySettings,
  normalizePrivacySettings,
} from "./privacy-settings-domain-service";
import {
  loadSettingsFromJsonFileWithDependencies,
  saveSettingsToJsonFileWithDependencies,
  type SettingsJsonFileStoreDependencies,
} from "./settings-json-file-store-service";

const privacySettingsFileName = "privacy.json";

const privacySettingsDependencies: SettingsJsonFileStoreDependencies = {
  documentDirectory: FileSystem.documentDirectory,
  getInfo: FileSystem.getInfoAsync,
  makeDirectory: FileSystem.makeDirectoryAsync,
  readAsString: FileSystem.readAsStringAsync,
  writeAsString: FileSystem.writeAsStringAsync,
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
