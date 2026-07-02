import { LibraryCollectionListView } from "../components/LibraryCollectionListView";
import { useLibraryCollectionListController } from "../hooks/use-library-collection-list-controller";
import { type CollectionKind } from "../hooks/use-library-collection-preview-query";
import { getLibraryCollectionListCopy } from "../services/library-collection-list-service";

type LibraryCollectionListScreenProps = {
  kind: CollectionKind;
};

export function LibraryCollectionListScreen({
  kind,
}: LibraryCollectionListScreenProps) {
  const copy = getLibraryCollectionListCopy(kind);
  const { listState, query, setQuery } = useLibraryCollectionListController({
    emptyLabel: copy.empty,
    kind,
  });

  return (
    <LibraryCollectionListView
      copy={copy}
      listState={listState}
      query={query}
      setQuery={setQuery}
    />
  );
}
