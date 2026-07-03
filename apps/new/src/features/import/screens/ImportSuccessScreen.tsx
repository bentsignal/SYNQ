import { ImportResultScreenView } from "../components/ImportResultScreenView";
import { useImportSuccessController } from "../hooks/use-import-result-controller";

export function ImportSuccessScreen() {
  return <ImportResultScreenView {...useImportSuccessController()} />;
}
