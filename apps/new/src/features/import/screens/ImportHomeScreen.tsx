import { ImportHomeView } from "../components/ImportHomeView";
import { useImportHomeController } from "../hooks/use-import-home-controller";

export function ImportHomeScreen() {
  return <ImportHomeView {...useImportHomeController()} />;
}
