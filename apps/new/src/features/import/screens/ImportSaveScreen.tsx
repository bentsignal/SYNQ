import { ImportSaveScreenView } from "../components/ImportSaveScreenView";
import { useImportSaveController } from "../hooks/use-import-save-controller";

export function ImportSaveScreen() {
  return <ImportSaveScreenView {...useImportSaveController()} />;
}
