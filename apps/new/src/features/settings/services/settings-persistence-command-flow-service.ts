import type { SettingsPersistenceAction } from "./settings-persistence-state-service";

type SettingsPersistenceDispatch<TSettings> = (
  action: SettingsPersistenceAction<TSettings>,
) => void;

export const runSettingsLoadCommand = async <TSettings>({
  dispatch,
  getErrorMessage,
  isCurrent,
  loadSettings,
}: {
  dispatch: SettingsPersistenceDispatch<TSettings>;
  getErrorMessage: (error: unknown) => string;
  isCurrent: () => boolean;
  loadSettings: () => Promise<TSettings>;
}) => {
  dispatch({ type: "load" });

  try {
    const settings = await loadSettings();
    if (isCurrent()) {
      dispatch({ settings, type: "load-success" });
    }
  } catch (error) {
    if (isCurrent()) {
      dispatch({
        error: getErrorMessage(error),
        type: "load-failure",
      });
    }
  }
};

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
