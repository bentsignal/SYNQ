import * as FileSystem from "expo-file-system";
import type { CustomizationSettings } from "../types/customization-settings";
import {
  defaultCustomizationSettings,
  normalizeCustomizationSettings,
} from "./customization-settings-domain-service";
import {
  loadSettingsFromJsonFileWithDependencies,
  saveSettingsToJsonFileWithDependencies,
  type SettingsJsonFileStoreDependencies,
} from "./settings-json-file-store-service";

const customizationSettingsFileName = "customization.json";

const customizationSettingsDependencies: SettingsJsonFileStoreDependencies = {
  documentDirectory: FileSystem.documentDirectory,
  getInfo: FileSystem.getInfoAsync,
  makeDirectory: FileSystem.makeDirectoryAsync,
  readAsString: FileSystem.readAsStringAsync,
  writeAsString: FileSystem.writeAsStringAsync,
};

export async function loadCustomizationSettings(): Promise<CustomizationSettings> {
  return loadSettingsFromJsonFileWithDependencies({
    defaultSettings: defaultCustomizationSettings,
    dependencies: customizationSettingsDependencies,
    fileName: customizationSettingsFileName,
    normalizeSettings: normalizeCustomizationSettings,
  });
}

export async function saveCustomizationSettings(
  settings: CustomizationSettings,
) {
  await saveSettingsToJsonFileWithDependencies({
    dependencies: customizationSettingsDependencies,
    fileName: customizationSettingsFileName,
    normalizeSettings: normalizeCustomizationSettings,
    settings,
  });
}
