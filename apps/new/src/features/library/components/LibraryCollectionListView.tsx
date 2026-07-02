import type { Href } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";
import { LibraryCollectionList } from "./LibraryCollectionList";
import { LibraryCollectionListHeader } from "./LibraryCollectionListHeader";
import { LibraryCollectionListSearch } from "./LibraryCollectionListSearch";
import { LibraryCollectionListStatus } from "./LibraryCollectionListStatus";

type LibraryCollectionListViewProps = {
  copy: {
    createHref: Href;
    kicker: string;
    placeholder: string;
    title: string;
  };
  listState: LibraryCollectionListState;
  query: string;
  setQuery: (query: string) => void;
};

export function LibraryCollectionListView({
  copy,
  listState,
  query,
  setQuery,
}: LibraryCollectionListViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <LibraryCollectionListHeader
        createHref={copy.createHref}
        kicker={copy.kicker}
        title={copy.title}
      />
      <LibraryCollectionListSearch
        onChangeQuery={setQuery}
        placeholder={copy.placeholder}
        query={query}
      />
      <LibraryCollectionList listState={listState} />
      <LibraryCollectionListStatus listState={listState} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  screen: {
    flex: 1,
  },
});
