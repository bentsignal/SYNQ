import * as FileSystem from "expo-file-system";
import type {
  CustomizationColorKey,
  CustomizationOption,
  CustomizationSettings,
} from "../types/customization-settings";
import {
  loadSettingsFromJsonFileWithDependencies,
  saveSettingsToJsonFileWithDependencies,
  type SettingsJsonFileStoreDependencies,
} from "./settings-json-file-store-service";

export const customizationOptions: CustomizationOption[] = [
  { color: "#77adf8", key: "blue", label: "Blue" },
  { color: "#61ae7f", key: "mint", label: "Mint" },
  { color: "#efa28a", key: "orange", label: "Orange" },
  { color: "#f6ace5", key: "pink", label: "Pink" },
  { color: "#a888ec", key: "purple", label: "Purple" },
  { color: "#ff8585", key: "red", label: "Red" },
  { color: "#eddd92", key: "yellow", label: "Yellow" },
];

export const getCustomizationOption = (key: CustomizationColorKey) =>
  customizationOptions.find((option) => option.key === key) ??
  customizationOptions[0];

export const defaultCustomizationSettings: CustomizationSettings = {
  appIcon: "blue",
  hapticsEnabled: true,
  theme: "blue",
};

const customizationSettingsFileName = "customization.json";

const customizationSettingsDependencies: SettingsJsonFileStoreDependencies = {
  documentDirectory: FileSystem.documentDirectory,
  getInfo: FileSystem.getInfoAsync,
  makeDirectory: FileSystem.makeDirectoryAsync,
  readAsString: FileSystem.readAsStringAsync,
  writeAsString: FileSystem.writeAsStringAsync,
};

const customizationColorKeys = new Set<CustomizationColorKey>(
  customizationOptions.map((option) => option.key),
);

const isCustomizationColorKey = (
  value: unknown,
): value is CustomizationColorKey =>
  typeof value === "string" &&
  customizationColorKeys.has(value as CustomizationColorKey);

export const normalizeCustomizationSettings = (
  value: unknown,
): CustomizationSettings => {
  if (!value || typeof value !== "object") {
    return defaultCustomizationSettings;
  }

  const partialValue = value as Partial<CustomizationSettings>;

  return {
    appIcon: isCustomizationColorKey(partialValue.appIcon)
      ? partialValue.appIcon
      : defaultCustomizationSettings.appIcon,
    hapticsEnabled:
      typeof partialValue.hapticsEnabled === "boolean"
        ? partialValue.hapticsEnabled
        : defaultCustomizationSettings.hapticsEnabled,
    theme: isCustomizationColorKey(partialValue.theme)
      ? partialValue.theme
      : defaultCustomizationSettings.theme,
  };
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
