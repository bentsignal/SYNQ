import { useCallback, useMemo } from "react";
import { saveCustomizationSettings } from "../services/customization-settings-service";
import { setNativeAppIcon } from "../services/native-app-icon-service";
import { runSettingsSaveCommand } from "../services/settings-persistence-command-flow-service";
import { getCustomizationSettingsErrorMessage } from "../services/settings-error-service";
import type { SettingsPersistenceAction } from "../services/settings-persistence-state-service";
import type {
  CustomizationColorKey,
  CustomizationSettings,
} from "../types/customization-settings";

type UseCustomizationSettingsCommandsOptions = {
  dispatch: React.Dispatch<SettingsPersistenceAction<CustomizationSettings>>;
  settings: CustomizationSettings;
};

export function useCustomizationSettingsCommands({
  dispatch,
  settings: currentSettings,
}: UseCustomizationSettingsCommandsOptions) {
  const updateSettings = useCallback(
    async (
      settings: CustomizationSettings,
      beforeSave?: () => void | Promise<void>,
    ) => {
      await runSettingsSaveCommand({
        beforeSave,
        currentSettings,
        dispatch,
        getErrorMessage: getCustomizationSettingsErrorMessage,
        saveSettings: saveCustomizationSettings,
        settings,
      });
    },
    [currentSettings, dispatch],
  );

  const setTheme = useCallback(
    (theme: CustomizationColorKey) =>
      updateSettings({
        ...currentSettings,
        theme,
      }),
    [currentSettings, updateSettings],
  );

  const setAppIcon = useCallback(
    (appIcon: CustomizationColorKey) =>
      updateSettings(
        {
          ...currentSettings,
          appIcon,
        },
        () => setNativeAppIcon(appIcon),
      ),
    [currentSettings, updateSettings],
  );

  const setHapticsEnabled = useCallback(
    (hapticsEnabled: boolean) =>
      updateSettings({
        ...currentSettings,
        hapticsEnabled,
      }),
    [currentSettings, updateSettings],
  );

  return useMemo(
    () => ({
      setAppIcon,
      setHapticsEnabled,
      setTheme,
    }),
    [setAppIcon, setHapticsEnabled, setTheme],
  );
}
