import { LibraryHomeView } from "../components/LibraryHomeView";
import { useLibraryHomeController } from "../hooks/use-library-home-controller";

export function LibraryHomeScreen() {
  return <LibraryHomeView {...useLibraryHomeController()} />;
}
