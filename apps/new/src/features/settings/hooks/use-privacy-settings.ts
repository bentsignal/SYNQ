import { useCallback, useMemo, useReducer } from "react";
import {
  defaultPrivacySettings,
  loadPrivacySettings,
  savePrivacySettings,
} from "../services/privacy-settings-service";
import { getPrivacySettingsErrorMessage } from "../services/settings-screen-service";
import {
  createInitialSettingsPersistenceState,
  settingsPersistenceReducer,
} from "../services/settings-persistence-state-service";
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
      dispatch({ settings, type: "save" });

      try {
        await savePrivacySettings(settings);
        dispatch({ settings, type: "save-success" });
      } catch (error) {
        dispatch({
          error: getPrivacySettingsErrorMessage(error),
          settings: previousSettings,
          type: "save-failure",
        });
      }
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
