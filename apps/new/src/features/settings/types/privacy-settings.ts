import type { SettingsPersistenceStatus } from "../services/settings-persistence-state-service";

export type PrivacySettings = {
  allowAnalytics: boolean;
};

export type PrivacySettingsStatus = SettingsPersistenceStatus;
