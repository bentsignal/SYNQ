import { useMemo, useReducer } from "react";
import {
  defaultCustomizationSettings,
  loadCustomizationSettings,
} from "../services/customization-settings-service";
import { getCustomizationSettingsErrorMessage } from "../services/settings-screen-service";
import {
  createInitialSettingsPersistenceState,
  settingsPersistenceReducer,
} from "../services/settings-persistence-state-service";
import type { CustomizationSettings } from "../types/customization-settings";
import { useCustomizationSettingsCommands } from "./use-customization-settings-commands";
import { useSettingsPersistenceLoader } from "./use-settings-persistence-loader";

export function useCustomizationSettingsStore() {
  const [state, dispatch] = useReducer(
    settingsPersistenceReducer<CustomizationSettings>,
    createInitialSettingsPersistenceState(defaultCustomizationSettings),
  );

  useSettingsPersistenceLoader({
    dispatch,
    getErrorMessage: getCustomizationSettingsErrorMessage,
    loadSettings: loadCustomizationSettings,
  });

  const { setAppIcon, setHapticsEnabled, setTheme } =
    useCustomizationSettingsCommands({
      dispatch,
      settings: state.settings,
    });

  return useMemo(
    () => ({
      setAppIcon,
      setHapticsEnabled,
      setTheme,
      state,
    }),
    [setAppIcon, setHapticsEnabled, setTheme, state],
  );
}

export type CustomizationSettingsStore = ReturnType<
  typeof useCustomizationSettingsStore
>;
