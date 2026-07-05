import { useNumericRouteParam } from "@/src/features/app-shell/hooks/use-numeric-route-param";
import { LibraryCollectionDetailConnectedContent } from "../components/LibraryCollectionDetailConnectedContent";
import { LibraryInvalidCollectionState } from "../components/LibraryInvalidCollectionState";
import { getLibraryInvalidCollectionState } from "../services/library-collection-navigation-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";

type LibraryCollectionDetailScreenProps = {
  kind: LibraryCollectionDetailKind;
};

export function LibraryCollectionDetailScreen({
  kind,
}: LibraryCollectionDetailScreenProps) {
  const id = useNumericRouteParam();

  if (id === null) {
    return (
      <LibraryInvalidCollectionState
        state={getLibraryInvalidCollectionState()}
      />
    );
  }

  return <LibraryCollectionDetailConnectedContent id={id} kind={kind} />;
}
