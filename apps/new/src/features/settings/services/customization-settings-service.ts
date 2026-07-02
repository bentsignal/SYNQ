import * as FileSystem from "expo-file-system";
import type {
  CustomizationColorKey,
  CustomizationOption,
  CustomizationSettings,
} from "../types/customization-settings";

const customizationSettingsDirectory = `${FileSystem.documentDirectory}settings`;
const customizationSettingsFile = `${customizationSettingsDirectory}/customization.json`;

export const customizationOptions: CustomizationOption[] = [
  { color: "#77adf8", key: "blue", label: "Blue" },
  { color: "#61ae7f", key: "mint", label: "Mint" },
  { color: "#efa28a", key: "orange", label: "Orange" },
  { color: "#f6ace5", key: "pink", label: "Pink" },
  { color: "#a888ec", key: "purple", label: "Purple" },
  { color: "#ff8585", key: "red", label: "Red" },
  { color: "#eddd92", key: "yellow", label: "Yellow" },
];

export const defaultCustomizationSettings: CustomizationSettings = {
  appIcon: "blue",
  hapticsEnabled: true,
  theme: "blue",
};

const customizationColorKeys = new Set<CustomizationColorKey>(
  customizationOptions.map((option) => option.key),
);

const isCustomizationColorKey = (
  value: unknown,
): value is CustomizationColorKey =>
  typeof value === "string" &&
  customizationColorKeys.has(value as CustomizationColorKey);

const normalizeCustomizationSettings = (
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

const ensureCustomizationSettingsDirectory = async () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("The document directory is not available.");
  }

  await FileSystem.makeDirectoryAsync(customizationSettingsDirectory, {
    intermediates: true,
  });
};

export async function loadCustomizationSettings(): Promise<CustomizationSettings> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(customizationSettingsFile);
    if (!fileInfo.exists) {
      return defaultCustomizationSettings;
    }

    const contents = await FileSystem.readAsStringAsync(
      customizationSettingsFile,
    );

    return normalizeCustomizationSettings(JSON.parse(contents));
  } catch {
    return defaultCustomizationSettings;
  }
}

export async function saveCustomizationSettings(
  settings: CustomizationSettings,
) {
  await ensureCustomizationSettingsDirectory();
  await FileSystem.writeAsStringAsync(
    customizationSettingsFile,
    JSON.stringify(normalizeCustomizationSettings(settings), null, 2),
  );
}
