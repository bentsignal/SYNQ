import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  defaultPrivacySettings,
  loadPrivacySettings,
  savePrivacySettings,
} from "../services/privacy-settings-service";
import { getPrivacySettingsErrorMessage } from "../services/settings-screen-service";
import type {
  PrivacySettings,
  PrivacySettingsStatus,
} from "../types/privacy-settings";

type PrivacySettingsState = {
  error: string | null;
  settings: PrivacySettings;
  status: PrivacySettingsStatus;
};

type PrivacySettingsAction =
  | { type: "load" }
  | { settings: PrivacySettings; type: "load-success" }
  | { error: string; type: "load-failure" }
  | { settings: PrivacySettings; type: "save" }
  | { settings: PrivacySettings; type: "save-success" }
  | { error: string; settings: PrivacySettings; type: "save-failure" };

const initialState: PrivacySettingsState = {
  error: null,
  settings: defaultPrivacySettings,
  status: "idle",
};

const privacySettingsReducer = (
  state: PrivacySettingsState,
  action: PrivacySettingsAction,
): PrivacySettingsState => {
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

export function usePrivacySettings() {
  const [state, dispatch] = useReducer(privacySettingsReducer, initialState);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      dispatch({ type: "load" });

      try {
        const settings = await loadPrivacySettings();
        if (isMounted) {
          dispatch({ settings, type: "load-success" });
        }
      } catch (error) {
        if (isMounted) {
          dispatch({
            error: getPrivacySettingsErrorMessage(error),
            type: "load-failure",
          });
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const setAllowAnalytics = useCallback(
    async (allowAnalytics: boolean) => {
      const previousSettings = state.settings;
      const settings = {
        ...state.settings,
        allowAnalytics,
      };
      dispatch({ settings, type: "save" });

      try {
        await savePrivacySettings(settings);
        dispatch({ settings, type: "save-success" });
      } catch (error) {
        dispatch({
          error: getPrivacySettingsErrorMessage(error),
          settings: previousSettings,
          type: "save-failure",
        });
      }
    },
    [state.settings],
  );

  return useMemo(
    () => ({
      setAllowAnalytics,
      state,
    }),
    [setAllowAnalytics, state],
  );
}
