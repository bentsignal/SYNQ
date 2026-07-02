import { ImportFilesScreenView } from "../components/ImportFilesScreenView";
import { useImportFilesController } from "../hooks/use-import-files-controller";

export function ImportFilesScreen() {
  const controller = useImportFilesController();

  return <ImportFilesScreenView {...controller} />;
}
