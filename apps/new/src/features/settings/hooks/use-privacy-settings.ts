import { useCallback, useMemo, useReducer } from "react";
import { defaultPrivacySettings } from "../services/privacy-settings-domain-service";
import {
  loadPrivacySettings,
  savePrivacySettings,
} from "../services/privacy-settings-service";
import { getPrivacySettingsErrorMessage } from "../services/settings-screen-service";
import {
  createInitialSettingsPersistenceState,
  settingsPersistenceReducer,
} from "../services/settings-persistence-state-service";
import { runSettingsSaveCommand } from "../services/settings-persistence-command-flow-service";
import type { PrivacySettings } from "../types/privacy-settings";
import { useSettingsPersistenceLoader } from "./use-settings-persistence-loader";

export function usePrivacySettings() {
  const [state, dispatch] = useReducer(
    settingsPersistenceReducer<PrivacySettings>,
    createInitialSettingsPersistenceState(defaultPrivacySettings),
  );

  useSettingsPersistenceLoader({
    dispatch,
    getErrorMessage: getPrivacySettingsErrorMessage,
    loadSettings: loadPrivacySettings,
  });

  const setAllowAnalytics = useCallback(
    async (allowAnalytics: boolean) => {
      const previousSettings = state.settings;
      const settings = {
        ...state.settings,
        allowAnalytics,
      };
      await runSettingsSaveCommand({
        currentSettings: previousSettings,
        dispatch,
        getErrorMessage: getPrivacySettingsErrorMessage,
        saveSettings: savePrivacySettings,
        settings,
      });
    },
    [state.settings],
  );

  return useMemo(
    () => ({
      setAllowAnalytics,
      state,
    }),
    [setAllowAnalytics, state],
  );
}
