import * as FileSystem from "expo-file-system";
import type { PrivacySettings } from "../types/privacy-settings";

const privacySettingsDirectory = `${FileSystem.documentDirectory}settings`;
const privacySettingsFile = `${privacySettingsDirectory}/privacy.json`;

export const defaultPrivacySettings: PrivacySettings = {
  allowAnalytics: !__DEV__,
};

const normalizePrivacySettings = (value: unknown): PrivacySettings => {
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

const ensurePrivacySettingsDirectory = async () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("The document directory is not available.");
  }

  await FileSystem.makeDirectoryAsync(privacySettingsDirectory, {
    intermediates: true,
  });
};

export async function loadPrivacySettings(): Promise<PrivacySettings> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(privacySettingsFile);
    if (!fileInfo.exists) {
      return defaultPrivacySettings;
    }

    const contents = await FileSystem.readAsStringAsync(privacySettingsFile);

    return normalizePrivacySettings(JSON.parse(contents));
  } catch {
    return defaultPrivacySettings;
  }
}

export async function savePrivacySettings(settings: PrivacySettings) {
  await ensurePrivacySettingsDirectory();
  await FileSystem.writeAsStringAsync(
    privacySettingsFile,
    JSON.stringify(normalizePrivacySettings(settings), null, 2),
  );
}
