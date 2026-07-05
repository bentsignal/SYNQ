import {
  getSettingsPersistenceLoadAction,
  getSettingsPersistenceLoadFailureAction,
  getSettingsPersistenceLoadSuccessAction,
  getSettingsPersistenceSaveAction,
  getSettingsPersistenceSaveFailureAction,
  getSettingsPersistenceSaveSuccessAction,
  type SettingsPersistenceAction,
} from "./settings-persistence-action-service";

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
  dispatch(getSettingsPersistenceLoadAction());

  try {
    const settings = await loadSettings();
    if (isCurrent()) {
      dispatch(getSettingsPersistenceLoadSuccessAction(settings));
    }
  } catch (error) {
    if (isCurrent()) {
      dispatch(getSettingsPersistenceLoadFailureAction(getErrorMessage(error)));
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
  dispatch(getSettingsPersistenceSaveAction(settings));

  try {
    await beforeSave?.();
    await saveSettings(settings);
    dispatch(getSettingsPersistenceSaveSuccessAction(settings));
  } catch (error) {
    dispatch(getSettingsPersistenceSaveFailureAction({
      error: getErrorMessage(error),
      settings: currentSettings,
    }));
  }
};
