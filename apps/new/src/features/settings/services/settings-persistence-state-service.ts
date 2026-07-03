export type SettingsPersistenceStatus =
  | "error"
  | "idle"
  | "loading"
  | "saving";

export type SettingsPersistenceState<TSettings> = {
  error: string | null;
  settings: TSettings;
  status: SettingsPersistenceStatus;
};

export type SettingsPersistenceAction<TSettings> =
  | { type: "load" }
  | { settings: TSettings; type: "load-success" }
  | { error: string; type: "load-failure" }
  | { settings: TSettings; type: "save" }
  | { settings: TSettings; type: "save-success" }
  | { error: string; settings: TSettings; type: "save-failure" };

export const createInitialSettingsPersistenceState = <TSettings>(
  settings: TSettings,
): SettingsPersistenceState<TSettings> => ({
  error: null,
  settings,
  status: "idle",
});

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

export const settingsPersistenceReducer = <TSettings>(
  state: SettingsPersistenceState<TSettings>,
  action: SettingsPersistenceAction<TSettings>,
): SettingsPersistenceState<TSettings> => {
  switch (action.type) {
    case "load":
      return {
        ...state,
        error: null,
        status: "loading",
      };
    case "load-success":
      return {
        error: null,
        settings: action.settings,
        status: "idle",
      };
    case "load-failure":
      return {
        ...state,
        error: action.error,
        status: "error",
      };
    case "save":
      return {
        error: null,
        settings: action.settings,
        status: "saving",
      };
    case "save-success":
      return {
        error: null,
        settings: action.settings,
        status: "idle",
      };
    case "save-failure":
      return {
        error: action.error,
        settings: action.settings,
        status: "error",
      };
  }
};
