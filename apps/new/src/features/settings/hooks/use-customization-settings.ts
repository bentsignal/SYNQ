import { useCallback, useMemo, useReducer } from "react";
import { defaultCustomizationSettings } from "../services/customization-settings-domain-service";
import { loadCustomizationSettings } from "../services/customization-settings-service";
import { getCustomizationSettingsErrorMessage } from "../services/settings-error-service";
import {
  createInitialSettingsPersistenceState,
  settingsPersistenceReducer,
} from "../services/settings-persistence-state-service";
import { runSettingsLoadCommand } from "../services/settings-persistence-command-flow-service";
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

  const reloadSettings = useCallback(async () => {
    await runSettingsLoadCommand({
      dispatch,
      getErrorMessage: getCustomizationSettingsErrorMessage,
      isCurrent: () => true,
      loadSettings: loadCustomizationSettings,
    });
  }, []);

  const { setAppIcon, setHapticsEnabled, setTheme } =
    useCustomizationSettingsCommands({
      dispatch,
      settings: state.settings,
    });

  return useMemo(
    () => ({
      reloadSettings,
      setAppIcon,
      setHapticsEnabled,
      setTheme,
      state,
    }),
    [reloadSettings, setAppIcon, setHapticsEnabled, setTheme, state],
  );
}

export type CustomizationSettingsStore = ReturnType<
  typeof useCustomizationSettingsStore
>;
