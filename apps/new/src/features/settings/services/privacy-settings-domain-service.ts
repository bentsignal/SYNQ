import type { PrivacySettings } from "../types/privacy-settings";

const isDevelopmentRuntime =
  typeof __DEV__ === "boolean" ? __DEV__ : false;

export const defaultPrivacySettings: PrivacySettings = {
  allowAnalytics: !isDevelopmentRuntime,
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
