import { ImportSaveScreenView } from "../components/ImportSaveScreenView";
import { useImportSaveController } from "../hooks/use-import-save-controller";
import { useImportSessionSelector } from "../hooks/use-import-session";

export function ImportSaveScreen() {
  const discardSession = useImportSessionSelector(
    (store) => store.discardSession,
  );
  const saveImportSession = useImportSessionSelector(
    (store) => store.saveImportSession,
  );
  const setShouldSaveToLibrary = useImportSessionSelector(
    (store) => store.setShouldSaveToLibrary,
  );
  const state = useImportSessionSelector((store) => store.state);

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
