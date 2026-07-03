import { ImportResultScreenView } from "../components/ImportResultScreenView";
import { useImportFailureController } from "../hooks/use-import-result-controller";

export function ImportFailureScreen() {
  return <ImportResultScreenView {...useImportFailureController()} />;
}
