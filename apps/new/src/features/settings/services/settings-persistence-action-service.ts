export type SettingsPersistenceAction<TSettings> =
  | { type: "load" }
  | { settings: TSettings; type: "load-success" }
  | { error: string; type: "load-failure" }
  | { settings: TSettings; type: "save" }
  | { settings: TSettings; type: "save-success" }
  | { error: string; settings: TSettings; type: "save-failure" };

export const getSettingsPersistenceLoadAction = <
  TSettings,
>(): SettingsPersistenceAction<TSettings> => ({
  type: "load",
});

export const getSettingsPersistenceLoadSuccessAction = <TSettings>(
  settings: TSettings,
): SettingsPersistenceAction<TSettings> => ({
  settings,
  type: "load-success",
});

export const getSettingsPersistenceLoadFailureAction = <TSettings>(
  error: string,
): SettingsPersistenceAction<TSettings> => ({
  error,
  type: "load-failure",
});

export const getSettingsPersistenceSaveAction = <TSettings>(
  settings: TSettings,
): SettingsPersistenceAction<TSettings> => ({
  settings,
  type: "save",
});

export const getSettingsPersistenceSaveSuccessAction = <TSettings>(
  settings: TSettings,
): SettingsPersistenceAction<TSettings> => ({
  settings,
  type: "save-success",
});

export const getSettingsPersistenceSaveFailureAction = <TSettings>({
  error,
  settings,
}: {
  error: string;
  settings: TSettings;
}): SettingsPersistenceAction<TSettings> => ({
  error,
  settings,
  type: "save-failure",
});
