import type { SettingsPersistenceAction } from "./settings-persistence-state-service";

type SettingsPersistenceDispatch<TSettings> = (
  action: SettingsPersistenceAction<TSettings>,
) => void;

export const runSettingsSaveCommand = async <TSettings>({
  beforeSave,
  currentSettings,
  dispatch,
  getErrorMessage,
  saveSettings,
  settings,
}: {
  beforeSave?: () => Promise<void> | void;
  currentSettings: TSettings;
  dispatch: SettingsPersistenceDispatch<TSettings>;
  getErrorMessage: (error: unknown) => string;
  saveSettings: (settings: TSettings) => Promise<void>;
  settings: TSettings;
}) => {
  dispatch({ settings, type: "save" });

  try {
    await beforeSave?.();
    await saveSettings(settings);
    dispatch({ settings, type: "save-success" });
  } catch (error) {
    dispatch({
      error: getErrorMessage(error),
      settings: currentSettings,
      type: "save-failure",
    });
  }
};
