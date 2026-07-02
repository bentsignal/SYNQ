import { useCallback, useMemo } from "react";
import { saveCustomizationSettings } from "../services/customization-settings-service";
import { setNativeAppIcon } from "../services/native-app-icon-service";
import { getCustomizationSettingsErrorMessage } from "../services/settings-screen-service";
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
      dispatch({ settings, type: "save" });

      try {
        await beforeSave?.();
        await saveCustomizationSettings(settings);
        dispatch({ settings, type: "save-success" });
      } catch (error) {
        dispatch({
          error: getCustomizationSettingsErrorMessage(error),
          settings: currentSettings,
          type: "save-failure",
        });
      }
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
