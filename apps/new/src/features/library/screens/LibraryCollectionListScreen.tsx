import type { Href } from "expo-router";
import { LibraryCollectionListView } from "../components/LibraryCollectionListView";
import { useLibraryCollectionListController } from "../hooks/use-library-collection-list-controller";
import { type CollectionKind } from "../hooks/use-library-collection-preview-query";

type LibraryCollectionListScreenProps = {
  kind: CollectionKind;
};

const copyByKind = {
  albums: {
    createHref: "/(tabs)/library/album/create",
    empty: "No albums in library",
    kicker: "Library",
    placeholder: "Search albums or artists",
    title: "Albums",
  },
  artists: {
    createHref: "/(tabs)/library/artist/create",
    empty: "No artists in library",
    kicker: "Library",
    placeholder: "Search artists",
    title: "Artists",
  },
  playlists: {
    createHref: "/(tabs)/library/playlist/create",
    empty: "No playlists in library",
    kicker: "Library",
    placeholder: "Search playlists",
    title: "Playlists",
  },
} satisfies Record<
  CollectionKind,
  {
    createHref: Href;
    empty: string;
    kicker: string;
    placeholder: string;
    title: string;
  }
>;

export function LibraryCollectionListScreen({
  kind,
}: LibraryCollectionListScreenProps) {
  const copy = copyByKind[kind];
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
