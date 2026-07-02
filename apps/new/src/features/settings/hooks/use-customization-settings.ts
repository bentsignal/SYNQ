import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  defaultCustomizationSettings,
  loadCustomizationSettings,
  saveCustomizationSettings,
} from "../services/customization-settings-service";
import type {
  CustomizationColorKey,
  CustomizationSettings,
  CustomizationSettingsStatus,
} from "../types/customization-settings";

type CustomizationSettingsState = {
  error: string | null;
  settings: CustomizationSettings;
  status: CustomizationSettingsStatus;
};

type CustomizationSettingsAction =
  | { type: "load" }
  | { settings: CustomizationSettings; type: "load-success" }
  | { error: string; type: "load-failure" }
  | { settings: CustomizationSettings; type: "save" }
  | { settings: CustomizationSettings; type: "save-success" }
  | { error: string; settings: CustomizationSettings; type: "save-failure" };

const initialState: CustomizationSettingsState = {
  error: null,
  settings: defaultCustomizationSettings,
  status: "idle",
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Customization settings failed.";

const customizationSettingsReducer = (
  state: CustomizationSettingsState,
  action: CustomizationSettingsAction,
): CustomizationSettingsState => {
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

export function useCustomizationSettings() {
  const [state, dispatch] = useReducer(
    customizationSettingsReducer,
    initialState,
  );

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      dispatch({ type: "load" });

      try {
        const settings = await loadCustomizationSettings();
        if (isMounted) {
          dispatch({ settings, type: "load-success" });
        }
      } catch (error) {
        if (isMounted) {
          dispatch({ error: getErrorMessage(error), type: "load-failure" });
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSettings = useCallback(
    async (settings: CustomizationSettings) => {
      const previousSettings = state.settings;
      dispatch({ settings, type: "save" });

      try {
        await saveCustomizationSettings(settings);
        dispatch({ settings, type: "save-success" });
      } catch (error) {
        dispatch({
          error: getErrorMessage(error),
          settings: previousSettings,
          type: "save-failure",
        });
      }
    },
    [state.settings],
  );

  const setTheme = useCallback(
    (theme: CustomizationColorKey) =>
      updateSettings({
        ...state.settings,
        theme,
      }),
    [state.settings, updateSettings],
  );

  const setAppIcon = useCallback(
    (appIcon: CustomizationColorKey) =>
      updateSettings({
        ...state.settings,
        appIcon,
      }),
    [state.settings, updateSettings],
  );

  const setHapticsEnabled = useCallback(
    (hapticsEnabled: boolean) =>
      updateSettings({
        ...state.settings,
        hapticsEnabled,
      }),
    [state.settings, updateSettings],
  );

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
