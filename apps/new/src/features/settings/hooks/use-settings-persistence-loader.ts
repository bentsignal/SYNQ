import { useEffect } from "react";
import type {
  SettingsPersistenceAction,
  SettingsPersistenceState,
} from "../services/settings-persistence-state-service";
import { runSettingsLoadCommand } from "../services/settings-persistence-command-flow-service";

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

    void runSettingsLoadCommand({
      dispatch,
      getErrorMessage,
      isCurrent: () => isMounted,
      loadSettings,
    });

    return () => {
      isMounted = false;
    };
  }, [dispatch, getErrorMessage, loadSettings]);
}

export type SettingsPersistenceHookState<TSettings> =
  SettingsPersistenceState<TSettings>;
