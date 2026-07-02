import { ImportSaveScreenView } from "../components/ImportSaveScreenView";
import { useImportSaveController } from "../hooks/use-import-save-controller";
import { useImportSession } from "../hooks/use-import-session";

export function ImportSaveScreen() {
  const { discardSession, saveImportSession, setShouldSaveToLibrary, state } =
    useImportSession();

  return (
    <ImportSaveScreenView
      {...useImportSaveController({
        discardSession,
        saveImportSession,
        setShouldSaveToLibrary,
        state,
      })}
      state={state}
    />
  );
}
