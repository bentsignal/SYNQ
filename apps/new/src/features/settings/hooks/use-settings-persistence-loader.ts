import { useEffect } from "react";
import type {
  SettingsPersistenceAction,
  SettingsPersistenceState,
} from "../services/settings-persistence-state-service";

type SettingsPersistenceLoaderOptions<TSettings> = {
  dispatch: React.Dispatch<SettingsPersistenceAction<TSettings>>;
  getErrorMessage: (caughtError: unknown) => string;
  loadSettings: () => Promise<TSettings>;
};

export function useSettingsPersistenceLoader<TSettings>({
  dispatch,
  getErrorMessage,
  loadSettings,
}: SettingsPersistenceLoaderOptions<TSettings>) {
  useEffect(() => {
    let isMounted = true;

    const loadPersistedSettings = async () => {
      dispatch({ type: "load" });

      try {
        const settings = await loadSettings();
        if (isMounted) {
          dispatch({ settings, type: "load-success" });
        }
      } catch (error) {
        if (isMounted) {
          dispatch({
            error: getErrorMessage(error),
            type: "load-failure",
          });
        }
      }
    };

    void loadPersistedSettings();

    return () => {
      isMounted = false;
    };
  }, [dispatch, getErrorMessage, loadSettings]);
}

export type SettingsPersistenceHookState<TSettings> =
  SettingsPersistenceState<TSettings>;
